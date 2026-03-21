# AGENTS.md — Agent Liveness Oracle

## Project
Agent Liveness Oracle — permissionless heartbeat verification for ERC-8004 agents on Base.
Synthesis Hackathon Project #3.

## Build Plan
Read `BUILD-PLAN.md` for full architecture and file structure.

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS v4
- Solidity (LivenessOracle contract)
- ethers.js v6
- x402 payments (USDC on Base)
- ERC-8004 identity

## Key Constraints
- **Dark theme** — consistent with Molttail (our other hackathon project)
- **Tailwind v4** — use `@import "tailwindcss"` syntax, NOT v3 `@tailwind` directives
- **No mock data** — use real Basescan/contract data where possible, placeholder for contract address until deployed
- **Mobile responsive**
- **App Router** (Next.js) — all pages in `app/` directory
- **TypeScript strict mode**

## Contract Address
TBD — will be deployed to Base before deadline. Use placeholder `0x0000000000000000000000000000000000000000` until then.

## ERC-8004 Agent
- Agent ID: 22945
- Name: Clawlinker
- Network: Ethereum mainnet (identity), Base (heartbeats)

## File Paths
- NEVER use `~/` — always use absolute paths
- Project root: `/root/synthesis-liveness-oracle/`
