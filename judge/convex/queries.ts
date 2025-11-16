// convex/queries.ts
import { v } from "convex/values";
import { query } from "./_generated/server";
import { sentryWrap } from "./sentry";

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  }),
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }),
});

// Check queue status
export const getQueueStatus = query({
  args: { userId: v.id("users") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db
      .query("matchQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .first();
  }),
});

// Get active match for user
export const getActiveMatch = query({
  args: { userId: v.id("users") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db
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
  }),
});

// Get match details
export const getMatch = query({
  args: { matchId: v.id("matches") },
  handler: sentryWrap(async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    const problem = await ctx.db.get(match.problemId as any);

    return {
      ...match,
      problem,
    };
  }),
});

// Get match submissions
export const getMatchSubmissions = query({
  args: { matchId: v.id("matches") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
  }),
});

// Get user match history
export const getUserMatchHistory = query({
  args: { userId: v.id("users") },
  handler: sentryWrap(async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .filter((q) =>
        q.or(
          q.eq(q.field("player1Id"), args.userId),
          q.eq(q.field("player2Id"), args.userId)
        )
      )
      .order("desc")
      .take(20);

    return matches;
  }),
});

// Get user transactions
export const getUserTransactions = query({
  args: { userId: v.id("users") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  }),
});

// Get leaderboard
export const getLeaderboard = query({
  args: {},
  handler: sentryWrap(async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 100)
      .map((user) => ({
        _id: user._id,
        username: user.username,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
      }));
  }),
});

// Get all problems
export const getProblems = query({
  args: {},
  handler: sentryWrap(async (ctx) => {
    return await ctx.db.query("problems").collect();
  }),
});

// Get problem by ID
export const getProblem = query({
  args: { problemId: v.id("problems") },
  handler: sentryWrap(async (ctx, args) => {
    return await ctx.db.get(args.problemId);
  }),
});
