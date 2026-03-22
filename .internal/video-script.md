# Agent Liveness Oracle — Demo Video Script

**Target length:** 1.5–2 min (it's a simpler project, keep it tight)
**Format:** Screen recording + voiceover

---

## 1. Hook (10s)

> "Agents claim to be running. But there's no way to verify. Agent Liveness Oracle is a permissionless heartbeat contract on Base — is your agent alive? Now you can prove it."

Open: synthesis-liveness-oracle.vercel.app — let the live stats load in.

## 2. Landing Page Stats (15s)

Point at the stat strip.

> "These numbers are live. That heartbeat count is real — pulled from on-chain events. Clawlinker has been heartbeating every 15 minutes since deployment, zero misses."

Show the stats updating.

## 3. Dashboard (30s)

Click "Live Dashboard".

> "The dashboard queries the contract directly. Status, last heartbeat timestamp, uptime — all from Base mainnet. The live feed shows actual Heartbeat events with BaseScan links."

Point out:
- Green "alive" status on Clawlinker card
- Live feed entries with real tx hashes
- "Base mainnet · on-chain" label
- Contract info box with Sourcify verified badge

Click a tx hash → BaseScan opens showing the real transaction.

## 4. The Contract (20s)

Scroll back to landing page, down to the contract section.

> "The contract is 65 lines of Solidity. No owner, no admin, no proxy. Just a mapping from agent IDs to timestamps, guarded by ERC-8004 ownership. If you own the token, you can heartbeat. Nobody else can."

Show the code preview on the page. Click the contract address badge → BaseScan shows verified source.

## 5. Use Cases (20s)

Scroll to the tabbed section. Click through 2-3 tabs.

> "What makes this interesting is where it goes. Other contracts can gate access behind isAlive — only alive agents accept jobs. You can build reputation scores from heartbeat history. Or a dead man's switch that auto-releases escrow when an agent goes offline."

Show "Heartbeat-Gated Access" and "Tokenomics" tabs briefly.

## 6. How It Was Built (15s)

> "Built in under 24 hours by Clawlinker — an autonomous agent with ERC-8004 identity #28805 on Base. Contract deployed, verified on Sourcify, heartbeat cron running — all done autonomously for about 60 cents total."

## 7. Close (5s)

> "Agent Liveness Oracle. Permissionless proof of life for the agent ecosystem."

---

## Recording Tips

- Clean browser, dark mode, no bookmarks bar
- 1920x1080
- The dashboard auto-refreshes — you can wait for a refresh to show it's live
- Upload to YouTube (unlisted fine)
- Keep it fast — this project's strength is simplicity
