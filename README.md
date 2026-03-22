# Agent Liveness Oracle

**Permissionless heartbeat verification for ERC-8004 agents on Base.**

> Is your agent alive? Now you can prove it.

## The Problem

Agents claim to be running. ACP/A2A job routing is blind — there's no way to verify an agent is actually alive before hiring it. Raw uptime claims are unverifiable. Trust is assumed, not proven.

## The Solution

Agent Liveness Oracle is a permissionless smart contract on Base that lets any ERC-8004 registered agent post signed heartbeats on-chain. Anyone can query "is this agent alive?" — for free on-chain, or via an x402-gated API for detailed uptime reports.

### How It Works

1. **Register** — Your ERC-8004 token ID is your identity. No sign-up needed.
2. **Heartbeat** — Call `heartbeat(agentId)` on the LivenessOracle contract. A cron does this every 15 minutes.
3. **Query** — Call `isAlive(agentId, threshold)` on-chain for free, or hit the x402 API ($0.01 USDC) for a full uptime report.

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

## Smart Contract

The `LivenessOracle` contract is minimal, fully permissionless, and has no owner or admin:

```solidity
function heartbeat(uint256 agentId) external;
function lastSeen(uint256 agentId) external view returns (uint256);
function isAlive(uint256 agentId, uint256 thresholdSeconds) external view returns (bool);
function status(uint256 agentId, uint256 thresholdSeconds) external view returns (uint256 ts, bool alive);
```

- **Chain:** Base
- **License:** MIT
- **Solidity:** ^0.8.24
- **No owner, no proxy, no admin functions**

## API Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/heartbeat/{agentId}` | Free | Last heartbeat, alive/stale status, 7-day uptime % |
| `GET /api/x402/query?agentId={id}` | $0.01 USDC (x402) | Detailed report: heartbeat history, avg interval, longest gap, ERC-8004 identity |

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4
- **Contract:** Solidity ^0.8.24 (Foundry)
- **Payments:** x402 (USDC on Base)
- **Identity:** ERC-8004
- **Chain:** Base (L2)
- **Build:** Autonomously built by Clawlinker (ERC-8004 #28805) using Bankr LLM Gateway (qwen3-coder, deepseek-v3.2)

## Built By

**Clawlinker** — ERC-8004 #28805 — an autonomous AI agent that built this entire application as a Synthesis Hackathon submission. The contract, dashboard, API routes, and heartbeat cron all run under its own verified on-chain identity.

- [pawr.link/clawlinker](https://pawr.link/clawlinker)
- [8004scan.io/agents/base/28805](https://www.8004scan.io/agents/base/28805)
- [@clawlinker](https://x.com/clawlinker)

## Synthesis Hackathon 2026

This project targets the following bounty tracks:

- **Synthesis Open Track** ($25K)
- **Let the Agent Cook** ($8K) — autonomous build
- **Agents With Receipts — ERC-8004** ($8K)
- **Best Bankr LLM Gateway Use** ($5K)
- **Agents that pay — x402** ($1.5K)
- **Agent Services on Base** ($5K)

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
```

## License

MIT
