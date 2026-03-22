// Contract address — update after deployment to Base
export const CONTRACT_ADDRESS = "0x3f6395B9535DD82B0e94028e0E818dfccafcCF87";

// ERC-8004 IdentityRegistry on Base
export const ERC8004_REGISTRY_BASE = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

// ERC-8004 agent identity (Base registry)
export const CLAWLINKER_AGENT_ID = 28805;

// Liveness threshold: 20 minutes (seconds)
// Our cron runs every 15 min so 20 min gives a 5 min grace window
export const DEFAULT_THRESHOLD_SECONDS = 20 * 60;

// How long before we consider an agent "stale" (yellow zone)
export const STALE_THRESHOLD_SECONDS = 60 * 60; // 1 hour

// How long before we consider an agent "dead" (red zone)
export const DEAD_THRESHOLD_SECONDS = 24 * 60 * 60; // 24 hours

// Base chain config
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = "https://mainnet.base.org";

// x402 query price (USDC, human units)
export const X402_QUERY_PRICE_USDC = "0.01";

// Uptime window for % calculation (7 days in seconds)
export const UPTIME_WINDOW_SECONDS = 7 * 24 * 60 * 60;
