import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  BASE_RPC_URL,
  DEFAULT_THRESHOLD_SECONDS,
} from "./constants";

// ─── ABI ─────────────────────────────────────────────────────────────────────

export const LIVENESS_ORACLE_ABI = [
  // Authorization
  {
    name: "authorize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "authorizedSender",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  // Write
  {
    name: "heartbeat",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [],
  },
  // Reads
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
      { name: "sender", type: "address" },
    ],
  },
  // Events
  {
    name: "Heartbeat",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Authorized",
    type: "event",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: true },
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
  authorizedSender: string;
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
    const [ts, alive, sender]: [bigint, boolean, string] = await contract.status(
      agentId,
      thresholdSeconds
    );
    const lastSeenTs = Number(ts);
    const nowTs = Math.floor(Date.now() / 1000);
    const secondsAgo = lastSeenTs === 0 ? -1 : nowTs - lastSeenTs;
    return {
      agentId,
      lastSeenTs,
      isAlive: alive,
      secondsAgo,
      humanAge: formatAge(secondsAgo),
      authorizedSender: sender,
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
