// convex/matchmaking.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Sentry from "@sentry/node";

// Initialize Sentry (do this once at the top of your file)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.CONVEX_CLOUD_URL?.includes("prod") ? "production" : "development",
  tracesSampleRate: 1.0,
});

// Create or get user
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (existing) return existing._id;

      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        username: args.username,
        wins: 0,
        losses: 0,
        rating: 1000,
        walletBalance: 0,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "createUser" },
        extra: { clerkId: args.clerkId, email: args.email },
      });
      throw error;
    }
  },
});

// Join matchmaking queue
export const joinQueue = mutation({
  args: {
    userId: v.id("users"),
    entryFee: v.number(),
  },
  handler: async (ctx, args) => {
    const transaction = Sentry.startTransaction({
      op: "matchmaking",
      name: "joinQueue",
    });

    try {
      // Get user
      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error("User not found");

      // Check if user has enough balance
      if (user.walletBalance < args.entryFee) {
        throw new Error("Insufficient balance");
      }

      // Check if user is already in queue
      const existingQueue = await ctx.db
        .query("matchQueue")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("status"), "waiting"))
        .first();

      if (existingQueue) {
        throw new Error("Already in queue");
      }

      // Check if user is already in an active match
      const activeMatch = await ctx.db
        .query("matches")
        .filter((q) =>
          q.and(
            q.or(
              q.eq(q.field("player1Id"), args.userId),
              q.eq(q.field("player2Id"), args.userId)
            ),
            q.eq(q.field("status"), "active")
          )
        )
        .first();

      if (activeMatch) {
        throw new Error("Already in an active match");
      }

      // Look for a match with similar rating (±200 rating points)
      const potentialMatches = await ctx.db
        .query("matchQueue")
        .withIndex("by_status", (q) => q.eq("status", "waiting"))
        .filter((q) =>
          q.and(
            q.neq(q.field("userId"), args.userId),
            q.eq(q.field("entryFee"), args.entryFee),
            q.gte(q.field("rating"), user.rating - 200),
            q.lte(q.field("rating"), user.rating + 200)
          )
        )
        .first();

      if (potentialMatches) {
        // Found a match! Create the match
        const opponent = await ctx.db.get(potentialMatches.userId);
        if (!opponent) throw new Error("Opponent not found");

        // Deduct entry fees
        await ctx.db.patch(args.userId, {
          walletBalance: user.walletBalance - args.entryFee,
        });
        await ctx.db.patch(potentialMatches.userId, {
          walletBalance: opponent.walletBalance - args.entryFee,
        });

        // Record transactions
        await ctx.db.insert("transactions", {
          userId: args.userId,
          type: "entry_fee",
          amount: -args.entryFee,
          status: "completed",
          description: `Entry fee for match`,
          createdAt: Date.now(),
        });

        await ctx.db.insert("transactions", {
          userId: potentialMatches.userId,
          type: "entry_fee",
          amount: -args.entryFee,
          status: "completed",
          description: `Entry fee for match`,
          createdAt: Date.now(),
        });

        // Get random problem
        const problems = await ctx.db.query("problems").collect();
        const randomProblem: any = problems[Math.floor(Math.random() * problems.length)];

        // Create match
        const matchId = await ctx.db.insert("matches", {
          player1Id: potentialMatches.userId,
          player2Id: args.userId,
          player1Username: opponent.username,
          player2Username: user.username,
          problemId: randomProblem._id as any,
          problemTitle: randomProblem.title,
          problemDifficulty: randomProblem.difficulty,
          entryFee: args.entryFee,
          prizePool: args.entryFee * 2 * 0.9, // 10% platform fee
          status: "active",
          player1Submitted: false,
          player2Submitted: false,
          startedAt: Date.now(),
        });

        // Update queue statuses
        await ctx.db.patch(potentialMatches._id, { status: "matched" });

        Sentry.addBreadcrumb({
          category: "matchmaking",
          message: "Match created successfully",
          level: "info",
          data: { matchId, entryFee: args.entryFee },
        });

        transaction.finish();
        return { matched: true, matchId };
      }

      // No match found, add to queue
      const queueId = await ctx.db.insert("matchQueue", {
        userId: args.userId,
        username: user.username,
        rating: user.rating,
        entryFee: args.entryFee,
        status: "waiting",
        createdAt: Date.now(),
      });

      Sentry.addBreadcrumb({
        category: "matchmaking",
        message: "User added to queue",
        level: "info",
        data: { queueId, userId: args.userId },
      });

      transaction.finish();
      return { matched: false, queueId };
    } catch (error) {
      transaction.setStatus("error");
      Sentry.captureException(error, {
        tags: { function: "joinQueue" },
        extra: { userId: args.userId, entryFee: args.entryFee },
      });
      transaction.finish();
      throw error;
    }
  },
});

// Leave queue
export const leaveQueue = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const queueEntry = await ctx.db
        .query("matchQueue")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("status"), "waiting"))
        .first();

      if (queueEntry) {
        await ctx.db.patch(queueEntry._id, { status: "cancelled" });
        Sentry.addBreadcrumb({
          category: "matchmaking",
          message: "User left queue",
          level: "info",
          data: { userId: args.userId },
        });
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "leaveQueue" },
        extra: { userId: args.userId },
      });
      throw error;
    }
  },
});

// Submit solution
export const submitSolution = mutation({
  args: {
    matchId: v.id("matches"),
    userId: v.id("users"),
    code: v.string(),
    language: v.string(),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const transaction = Sentry.startTransaction({
      op: "match",
      name: "submitSolution",
    });

    try {
      const match = await ctx.db.get(args.matchId);
      if (!match) throw new Error("Match not found");
      if (match.status !== "active") throw new Error("Match is not active");

      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error("User not found");

      const isPlayer1 = match.player1Id === args.userId;
      const isPlayer2 = match.player2Id === args.userId;

      if (!isPlayer1 && !isPlayer2) {
        throw new Error("Not a participant in this match");
      }

      // Check if already submitted
      if ((isPlayer1 && match.player1Submitted) || (isPlayer2 && match.player2Submitted)) {
        throw new Error("Already submitted");
      }

      const submitTime = Date.now();

      // Record submission
      await ctx.db.insert("submissions", {
        matchId: args.matchId,
        userId: args.userId,
        username: user.username,
        code: args.code,
        language: args.language,
        isCorrect: args.isCorrect,
        submittedAt: submitTime,
      });

      // Update match
      const updates: any = {};
      if (isPlayer1) {
        updates.player1Submitted = true;
        updates.player1SubmitTime = submitTime;
      } else {
        updates.player2Submitted = true;
        updates.player2SubmitTime = submitTime;
      }

      // Check if this is a winning submission (correct and first)
      let winnerId: string | undefined;
      let winnerUsername: string | undefined;

      if (args.isCorrect) {
        // If opponent hasn't submitted or submitted incorrectly, this player wins
        const opponentSubmitted = isPlayer1 ? match.player2Submitted : match.player1Submitted;
        const opponentId: any = isPlayer1 ? match.player2Id : match.player1Id;
        
        if (!opponentSubmitted) {
          // First correct submission wins
          winnerId = args.userId;
          winnerUsername = user.username;
          updates.status = "completed";
          updates.winnerId = winnerId;
          updates.winnerUsername = winnerUsername;
          updates.completedAt = submitTime;
        } else {
          // Both submitted, check if opponent was correct
          const opponentSubmissions = await ctx.db
            .query("submissions")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .filter((q) => q.eq(q.field("userId"), opponentId))
            .first();

          if (opponentSubmissions && !opponentSubmissions.isCorrect) {
            // Opponent was wrong, this player wins
            winnerId = args.userId;
            winnerUsername = user.username;
            updates.status = "completed";
            updates.winnerId = winnerId;
            updates.winnerUsername = winnerUsername;
            updates.completedAt = submitTime;
          } else if (opponentSubmissions && opponentSubmissions.isCorrect) {
            // Both correct, earliest wins
            const opponentTime = isPlayer1 ? match.player2SubmitTime! : match.player1SubmitTime!;
            if (submitTime < opponentTime) {
              winnerId = args.userId;
              winnerUsername = user.username;
            } else {
              winnerId = opponentId;
              winnerUsername = isPlayer1 ? match.player2Username : match.player1Username;
            }
            updates.status = "completed";
            updates.winnerId = winnerId;
            updates.winnerUsername = winnerUsername;
            updates.completedAt = submitTime;
          }
        }
      } else {
        // Incorrect submission, check if opponent has correct submission
        const opponentId: any = isPlayer1 ? match.player2Id : match.player1Id;
        const opponentSubmissions = await ctx.db
          .query("submissions")
          .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
          .filter((q) => q.eq(q.field("userId"), opponentId))
          .first();

        if (opponentSubmissions && opponentSubmissions.isCorrect) {
          // Opponent wins
          winnerId = opponentId;
          winnerUsername = isPlayer1 ? match.player2Username : match.player1Username;
          updates.status = "completed";
          updates.winnerId = winnerId;
          updates.winnerUsername = winnerUsername;
          updates.completedAt = Date.now();
        }
      }

      await ctx.db.patch(args.matchId, updates);

      // Award prize if match completed
      if (updates.status === "completed" && winnerId) {
        const winnerDocId = winnerId as any;
        const loserDocId = (winnerId === match.player1Id ? match.player2Id : match.player1Id) as any;
        
        const winner = await ctx.db.get(winnerDocId);
        const loser = await ctx.db.get(loserDocId);
        
        if (winner && loser) {
          await ctx.db.patch(winnerDocId, {
            walletBalance: winner.walletBalance + match.prizePool,
            wins: winner.wins + 1,
            rating: winner.rating + 25,
          });

          await ctx.db.patch(loserDocId, {
            losses: loser.losses + 1,
            rating: Math.max(0, loser.rating - 15),
          });

          await ctx.db.insert("transactions", {
            userId: winnerDocId,
            type: "prize_win",
            amount: match.prizePool,
            status: "completed",
            matchId: args.matchId,
            description: `Prize for winning match`,
            createdAt: Date.now(),
          });

          Sentry.addBreadcrumb({
            category: "match",
            message: "Match completed with winner",
            level: "info",
            data: { 
              matchId: args.matchId, 
              winnerId, 
              prizePool: match.prizePool 
            },
          });
        }
      }

      transaction.finish();
      return { success: true, winnerId, winnerUsername };
    } catch (error) {
      transaction.setStatus("error");
      Sentry.captureException(error, {
        tags: { 
          function: "submitSolution",
          language: args.language,
          isCorrect: args.isCorrect.toString(),
        },
        extra: { 
          matchId: args.matchId, 
          userId: args.userId,
        },
      });
      transaction.finish();
      throw error;
    }
  },
});