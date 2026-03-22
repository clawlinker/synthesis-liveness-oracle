import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/contract";
import { CONTRACT_ADDRESS } from "@/lib/constants";

// Heartbeat(uint256 indexed agentId, address indexed sender, uint256 timestamp)
const HEARTBEAT_TOPIC =
  "0x6941f6f57b822a3d508e7a95fc075f8ee16007b0b104ea7bcf983249723eb3cf";

const DEPLOY_BLOCK = 43680443;
const CHUNK_SIZE = 5000; // Base RPC limit is 10k, use 5k for safety

const AGENT_NAMES: Record<number, string> = {
  28805: "Clawlinker",
};

interface HeartbeatEvent {
  agentId: number;
  agentName: string;
  sender: string;
  timestamp: number;
  txHash: string;
  block: number;
}

// ─── In-memory cache (survives across requests within same serverless instance)
let cachedEvents: HeartbeatEvent[] = [];
let lastScannedBlock = DEPLOY_BLOCK;
let cacheTimestamp = 0;

async function scanAllEvents(provider: ReturnType<typeof getProvider>) {
  const latest = await provider.getBlockNumber();
  const now = Date.now();

  // If cache is fresh (< 30s) and we've scanned to near latest, skip
  if (now - cacheTimestamp < 30_000 && latest - lastScannedBlock < 500) {
    return;
  }

  const startBlock = lastScannedBlock === DEPLOY_BLOCK ? DEPLOY_BLOCK : lastScannedBlock + 1;

  // Scan from where we left off to latest in chunks
  let fromBlock = startBlock;
  const newEvents: HeartbeatEvent[] = [];

  while (fromBlock <= latest) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, latest);

    try {
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [HEARTBEAT_TOPIC],
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        const agentId = parseInt(log.topics[1], 16);
        const sender = "0x" + log.topics[2].slice(26);
        const timestamp = parseInt(log.data, 16);

        newEvents.push({
          agentId,
          agentName: AGENT_NAMES[agentId] || `Agent #${agentId}`,
          sender,
          timestamp,
          txHash: log.transactionHash,
          block: log.blockNumber,
        });
      }
    } catch {
      // If a chunk fails, stop scanning and return what we have
      break;
    }

    fromBlock = toBlock + 1;
  }

  if (newEvents.length > 0) {
    cachedEvents = [...cachedEvents, ...newEvents];
    lastScannedBlock = latest;
  } else if (fromBlock > latest) {
    // No new events but we scanned everything — update scan position
    lastScannedBlock = latest;
  }

  cacheTimestamp = now;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(parseInt(limitParam || "20", 10), 100);

  try {
    const provider = getProvider();
    await scanAllEvents(provider);

    // Return most recent events first
    const recent = [...cachedEvents].reverse().slice(0, limit);

    return NextResponse.json(
      {
        events: recent,
        total: cachedEvents.length,
        scannedToBlock: lastScannedBlock,
        source: "onchain",
      },
      {
        headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { events: [], total: cachedEvents.length, error: String(e), source: "error" },
      { status: 503 }
    );
  }
}
