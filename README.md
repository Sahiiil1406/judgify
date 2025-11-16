# CodeJudge

<img width="1146" height="672" alt="image" src="https://github.com/user-attachments/assets/03ebbdf9-a3e2-4046-9a18-81d75ef88b60" />


AI is rewriting how companies hire. The old grind of pure DSA is dying out, replaced by rounds that demand real engineering instincts — building live features, fixing production-style bugs, crafting clean schemas, writing SQL that mirrors real data problems, designing scalable systems, and proving you can ship under pressure.

Teams want builders, not puzzle solvers.

Developers need a battleground that reflects this new reality — a place to practice practical engineering skills with instant feedback, real constraints, and the adrenaline of a live match.

This is that battleground.

DevDAO (CodeJudge) is a next-gen arena for head-to-head coding battles across Solidity, SQL, schema design, and frontend machine-coding. Fast, interactive, and brutally realistic — built to push you to think, code, debug, and deliver exactly like you would inside an engineering team.

---

### **Deep Integration with Hackathon Sponsors**
| Technology | Implementation | Impact |
|------------|----------------|--------|
| **TanStack Start** | Full-document SSR streaming, server functions, nested routing, type-safe RPCs | Instant page loads, seamless full-stack development, zero API boilerplate |
| **Convex** | Real-time matchmaking, reactive state sync, session management ,Real time leaderboard for contest | Sub-second opponent matching with live updates |
| **Cloudflare Workers** | Edge computing, serverless API routes, global CDN | <50ms response times worldwide |
| **Sentry** | Full-stack tracing, error tracking, performance monitoring | Complete observability from browser to database |
| **Firecrawl** | Automated documentation scraping per challenge | Context-aware learning without leaving the platform |
| **Autumn** | Payment processing for premium features | Seamless monetization with usage-based billing |


---

## ⚙️ Core Features (Deep Implementation Details)

### **1. Real-Time Competitive 1v1 Matchmaking 🎮**
Experience the thrill of live coding battles:
- **Instant Matching**: Convex-powered matchmaking finds opponents in <1 second
- **Live Progress Tracking**: Watch your opponent's test cases pass in real-time
- **Session Management**: Automatic room creation, readiness checks, and result synchronization
- **Reactive UI**: Zero manual refreshes - everything updates automatically via Convex subscriptions


### ⚡ 2. **Frontend Machine Coding (CodeSandbox + Monaco + Jest)**

* Editor powered by **Monaco** with language services, autocomplete, and error markers.
* CodeSandbox runtime runs React code in an isolated iframe.
* On every save:

  * The component is bundled in a virtual FS.
  * Jest test suite runs inside the sandbox.
  * Results stream back with pass/fail, diff, and console logs.
* No page reloads — evaluation happens in a worker-like sandbox.

### 🛠 3. **Smart Contract Challenge Engine (solc + Ganache)**

* User submits Solidity code.
* `solc` compiles inside a Cloudflare Worker-compatible environment.
* Compilation artifacts stored temporarily in memory.
* Ganache spawns an **ephemeral chain per submission**.
* Contract deployment:

  * Deploy using the compiled ABI + bytecode.
  * Seed accounts with deterministic balances.
* Tests run using ethers.js against the deployed contract.
* Full logs (events, reverts, gas) returned to UI.

### 4. **SQL & Schema Design** 🗄️
- **Dynamic Schema Validation**: Parse user DDL → Generate tables → Seed data → Execute queries
- **In-Memory Database**: Fresh SQL instance per attempt for isolated testing
- **Visual ERD Builder**: Design database schemas with an intuitive drag-and-drop interface
- **Result Diff Engine**: Precise comparison of expected vs actual query outputs
  
### **3. Intelligent Documentation via Firecrawl 📚**
Never leave the coding environment:
- **Auto-Scraped Docs**: Official documentation automatically fetched for each challenge
- **Contextual Help**: Relevant API references, syntax guides, and best practices
- **Smart Caching**: Docs are pre-loaded and instantly accessible
- **Zero Distractions**: No tab-switching, no context loss

### 🔍 6. **Observability (Sentry)**

* Every code execution path wrapped in instrumentation.
* Traces include: compile time, execution time, deploy time, test duration.
* Frontend captures editor crashes, sandbox errors, and network issues.
* Useful for debugging user-step failures in real-time.

---

## 🛠 Setup (Essentials)

1. `git clone` + `npm install`
2. `npx convex dev` (Convex local dev)
3. `wrangler login` + `wrangler deploy` (Cloudflare)
4. Add env vars: `CONVEX_DEPLOYMENT`, `SENTRY_DSN`, `FIRECRAWL_API_KEY`, `CLOUDFLARE_API_TOKEN`, `AUTUMN_API_KEY`
5. `npm run dev` to run locally

---
## ScreenShots 
<img width="1858" height="935" alt="image" src="https://github.com/user-attachments/assets/61e496bd-0381-47ae-bd55-88a3f2cad037" />
<img width="1829" height="936" alt="image" src="https://github.com/user-attachments/assets/19cca705-f798-4cfd-bd00-ca86aa69ce6f" />

<img width="1827" height="938" alt="image" src="https://github.com/user-attachments/assets/be0af6b8-3cf7-46c0-813a-4b1199dda2aa" />
<img width="1857" height="927" alt="image" src="https://github.com/user-attachments/assets/35f53328-721a-453d-b60c-32e643ec1006" />
<img width="1838" height="932" alt="image" src="https://github.com/user-attachments/assets/46c197bf-f810-4fcf-85f2-a08ec35153a2" />
<img width="1846" height="931" alt="image" src="https://github.com/user-attachments/assets/8203f6d1-194e-4d05-815b-3b32f70cf89d" />
<img width="1860" height="940" alt="image" src="https://github.com/user-attachments/assets/aa3dc00e-afa5-48c2-b028-5241b23ccd04" />
<img width="1820" height="944" alt="Screenshot 2025-11-07 032823" src="https://github.com/user-attachments/assets/2779213b-0bf9-498d-adb9-f72e68719101" />
<img width="1860" height="899" alt="image" src="https://github.com/user-attachments/assets/b99bc369-4e8a-4064-8e30-8afb2f0997a5" />
<img width="1835" height="931" alt="image" src="https://github.com/user-attachments/assets/2721b14f-e41f-4980-9934-a0435da76edc" />
<img width="1693" height="926" alt="image" src="https://github.com/user-attachments/assets/2eaf3df8-25ee-48ce-98da-adfab3293132" />


<img width="1855" height="933" alt="image" src="https://github.com/user-attachments/assets/2ea9f918-585a-421b-a9e9-f84c71125337" />
<img width="1651" height="883" alt="image" src="https://github.com/user-attachments/assets/07e66403-fa23-4fae-b17f-51df6486f942" />


## 🙏 Acknowledgments

Built for the TanStack Start Hackathon with ❤️

Special thanks to:
- [TanStack](https://tanstack.com) for the incredible Start framework
- [Convex](https://convex.dev) for making real-time development delightful
- [Cloudflare](https://cloudflare.com) for edge computing infrastructure
- [Sentry](https://sentry.io) for world-class observability
- [Firecrawl](https://firecrawl.dev) for intelligent web scraping

---
