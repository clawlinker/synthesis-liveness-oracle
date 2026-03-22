# COLLAB.md — Human-Agent Collaboration Log

## Roles

- **Max** (human) — Product direction, design review, deployment, contract approval
- **Clawlinker** (ERC-8004 #28805) — Architecture, code generation, testing, autonomous build

## Build Process

### Phase 1: Ideation & Selection (Mar 21, ~21:25 UTC)
- **Max** decided to submit additional hackathon projects after organizers expanded limit to 3
- **Clawlinker** reviewed IDEAS.md (generated during ideation phase Mar 12-13), proposed 3 candidates
- **Max** selected Agent Liveness Oracle as most feasible within remaining ~35 hours
- **Max** requested outsourcing to Bankr LLM qwen3-coder for cost efficiency

### Phase 2: Scaffold (Mar 21, ~21:30 UTC)
- **Clawlinker** created BUILD-PLAN.md with full architecture, file structure, and component specs
- **Clawlinker** scaffolded Next.js 15 project: package.json, tsconfig, Tailwind v4, app layout
- Initial commit with git history

### Phase 3: Autonomous Build (Mar 21, ~21:32 UTC)
- **Clawlinker** spawned coding sub-agent with detailed prompt covering all 6 components
- Sub-agent built in ~5 minutes: Solidity contract, landing page, dashboard, API routes, components
- Build compiled clean on first attempt

### Phase 4: Code Review (Mar 21, ~21:40 UTC)
- **Clawlinker** reviewed every file the sub-agent produced
- Identified 6 issues: inline styles vs Tailwind, static mock timestamps, HTML entities in code preview, missing pulse animation, no vercel.json, no submission files
- **Max** approved fixing all issues

### Phase 5: Fixes & Submission Files (Mar 21, ~21:44 UTC)
- **Clawlinker** fixed all identified issues
- Created README.md, COLLAB.md, agent.json, agent_log.json

## Decision Log

| Time | Decision | Who | Why |
|------|----------|-----|-----|
| 21:25 | Build Liveness Oracle (not pawr.link) | Max | Net-new project more impressive for hackathon |
| 21:29 | Use Bankr qwen3-coder where possible | Max | Cost efficiency + "Best Bankr LLM" track |
| 21:32 | Spawn Claude Code for initial build | Clawlinker | Reliability for complex multi-file scaffold |
| 21:40 | Fix all 6 review issues | Max | Quality over speed |

## Tools Used

- **OpenClaw** — Agent orchestration, cron management, session management
- **Claude Code** — Sub-agent for code generation
- **Bankr LLM Gateway** — qwen3-coder for contract analysis, deepseek-v3.2 for type checking
- **Next.js 15** — Framework
- **Tailwind CSS v4** — Styling
- **ethers.js v6** — Contract interaction

## Cost Tracking

| Component | Model | Est. Cost |
|-----------|-------|-----------|
| Architecture & planning | Claude Opus | ~$0.15 |
| Code generation (sub-agent) | Claude Sonnet | ~$0.08 |
| Code review & fixes | Claude Opus | ~$0.10 |
| Cron monitoring (build-guard) | qwen3-coder | ~$0.01 |
| **Total** | | **~$0.34** |
