import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  BASE_RPC_URL,
  DEFAULT_THRESHOLD_SECONDS,
} from "./constants";

// ─── ABI ─────────────────────────────────────────────────────────────────────

export const LIVENESS_ORACLE_ABI = [
  // Constructor takes identityRegistry address (not in ABI, but documenting)
  // Write
  {
    name: "heartbeat",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [],
  },
  // Write — authorize operator
  {
    name: "authorize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "operator", type: "address" },
    ],
    outputs: [],
  },
  // Reads
  {
    name: "identityRegistry",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "operatorOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "lastSeen",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isAlive",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "thresholdSeconds", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "status",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "thresholdSeconds", type: "uint256" },
    ],
    outputs: [
      { name: "ts", type: "uint256" },
      { name: "alive", type: "bool" },
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
  },
  // Events
  {
    name: "Heartbeat",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "OperatorSet",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "operator", type: "address", indexed: true },
    ],
  },
] as const;

// ─── Provider / Contract helpers ─────────────────────────────────────────────

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(BASE_RPC_URL);
}

export function getReadOnlyContract(): ethers.Contract {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, LIVENESS_ORACLE_ABI, provider);
}

export function getWriteContract(signer: ethers.Signer): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESS, LIVENESS_ORACLE_ABI, signer);
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export interface AgentStatus {
  agentId: number;
  lastSeenTs: number;
  isAlive: boolean;
  secondsAgo: number;
  humanAge: string;
  owner: string;
  operator: string;
}

/**
 * Query the on-chain status of a single agent.
 * Returns null if the contract is not yet deployed (zero-address).
 */
export async function queryAgentStatus(
  agentId: number,
  thresholdSeconds = DEFAULT_THRESHOLD_SECONDS
): Promise<AgentStatus | null> {
  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  try {
    const contract = getReadOnlyContract();
    const [ts, alive, owner, operator]: [bigint, boolean, string, string] =
      await contract.status(agentId, thresholdSeconds);
    const lastSeenTs = Number(ts);
    const nowTs = Math.floor(Date.now() / 1000);
    const secondsAgo = lastSeenTs === 0 ? -1 : nowTs - lastSeenTs;
    return {
      agentId,
      lastSeenTs,
      isAlive: alive,
      secondsAgo,
      humanAge: formatAge(secondsAgo),
      owner,
      operator,
    };
  } catch {
    return null;
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatAge(secondsAgo: number): string {
  if (secondsAgo < 0) return "never";
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
}
