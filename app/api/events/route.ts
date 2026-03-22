import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/contract";
import { CONTRACT_ADDRESS } from "@/lib/constants";

// Heartbeat(uint256 indexed agentId, address indexed sender, uint256 timestamp)
const HEARTBEAT_TOPIC =
  "0x6941f6f57b822a3d508e7a95fc075f8ee16007b0b104ea7bcf983249723eb3cf";

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(parseInt(limitParam || "20", 10), 50);

  const agentIdParam = request.nextUrl.searchParams.get("agentId");

  try {
    const provider = getProvider();
    const latest = await provider.getBlockNumber();

    // Scan in chunks of 5000 blocks (within Base RPC limit)
    // Go back up to 4 chunks (~10,000 blocks, ~5 hours)
    const events: HeartbeatEvent[] = [];
    let toBlock = latest;

    for (let i = 0; i < 4 && events.length < limit; i++) {
      const fromBlock = Math.max(0, toBlock - 5000);

      const topics: (string | null)[] = [HEARTBEAT_TOPIC];
      if (agentIdParam) {
        topics.push("0x" + parseInt(agentIdParam, 10).toString(16).padStart(64, "0"));
      }

      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics,
        fromBlock,
        toBlock,
      });

      for (const log of logs.reverse()) {
        if (events.length >= limit) break;
        const agentId = parseInt(log.topics[1], 16);
        const sender = "0x" + log.topics[2].slice(26);
        const timestamp = parseInt(log.data, 16);

        events.push({
          agentId,
          agentName: AGENT_NAMES[agentId] || `Agent #${agentId}`,
          sender,
          timestamp,
          txHash: log.transactionHash,
          block: log.blockNumber,
        });
      }

      toBlock = fromBlock - 1;
      if (fromBlock === 0) break;
    }

    return NextResponse.json(
      {
        events,
        total: events.length,
        source: "onchain",
      },
      {
        headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { events: [], total: 0, error: String(e), source: "error" },
      { status: 503 }
    );
  }
}
