# Agent Liveness Oracle — Build Plan

_Synthesis Hackathon Project #3. Deadline: Mar 23, 07:59 UTC._
_Target: ~35 hours. Lean MVP._

## Concept

Agents claim to be "alive" but there's no permissionless way to verify. The Agent Liveness Oracle lets any ERC-8004 registered agent post signed heartbeats onchain, and anyone can query "is this agent alive?" via an x402-gated API.

**We ARE the proof of concept** — Clawlinker runs 29 crons and has been live since Feb 2026.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Agent Cron  │────▶│  Heartbeat API   │────▶│  Base Chain  │
│ (every 15m)  │     │  (Next.js API)   │     │  (contract)  │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │  x402 Query  │
                    │  "Is alive?" │
                    └──────────────┘
```

## Components

### 1. Smart Contract (Solidity) — `contracts/LivenessOracle.sol`
- Minimal contract on Base
- `heartbeat(uint256 agentId)` — records block.timestamp for agent
- `lastSeen(uint256 agentId) → uint256` — public view
- `isAlive(uint256 agentId, uint256 threshold) → bool` — checks if last heartbeat within threshold
- No owner, no admin, fully permissionless
- ~50-80 lines of Solidity

### 2. Next.js App — Dashboard + API
- **Landing page:** What is Agent Liveness Oracle, how it works
- **Dashboard:** Live feed of agent heartbeats, status indicators
- **API routes:**
  - `GET /api/heartbeat/[agentId]` — free, returns last heartbeat time + alive status
  - `GET /api/x402/query` — x402-gated ($0.01), returns detailed liveness report with uptime %
  - `POST /api/heartbeat/submit` — agents submit heartbeat (calls contract)

### 3. Heartbeat Cron
- OpenClaw cron every 15 min
- Signs and submits heartbeat for agent #28805
- Logs to agent_log.json

### 4. agent.json + agent_log.json
- DevSpot compliant
- Documents the autonomous build process

## Tech Stack
- Next.js 15 + TypeScript + Tailwind CSS v4
- Solidity (Foundry for contract)
- ethers.js v6 for contract interaction
- x402 for paid query endpoint
- Base (L2) for contract deployment
- ERC-8004 identity integration

## Bounty Tracks
1. **Synthesis Open Track** ($25K) — novel infrastructure
2. **Let the Agent Cook** ($8K) — autonomous build
3. **Agents With Receipts — ERC-8004** ($8K) — 8004 identity core
4. **Best Bankr LLM Gateway Use** ($5K) — built with Bankr qwen3-coder
5. **Agents that pay — x402** ($1.5K) — x402 query endpoint
6. **Agent Services on Base** ($5K) — Base contract

## Build Order (Priority)
1. ✅ Scaffold Next.js app with landing + dashboard pages
2. ✅ Write Solidity contract
3. ✅ Build API routes (heartbeat query, x402 endpoint)
4. ✅ Build dashboard UI (heartbeat feed, status cards)
5. ✅ agent.json + agent_log.json
6. ✅ README.md + COLLAB.md
7. Deploy contract to Base (needs Max)
8. Deploy app to Vercel (needs Max)
9. Hook up heartbeat cron

## File Structure
```
synthesis-liveness-oracle/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Live heartbeat dashboard
│   └── api/
│       ├── heartbeat/
│       │   └── [agentId]/
│       │       └── route.ts  # Free query
│       └── x402/
│           └── query/
│               └── route.ts  # Paid detailed query
├── contracts/
│   └── LivenessOracle.sol
├── components/
│   ├── HeartbeatCard.tsx
│   ├── StatusIndicator.tsx
│   └── LiveFeed.tsx
├── lib/
│   ├── contract.ts           # Contract ABI + helpers
│   └── constants.ts
├── agent.json
├── agent_log.json
├── README.md
├── COLLAB.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── tailwind.config.ts
```
