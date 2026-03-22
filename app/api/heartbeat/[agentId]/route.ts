import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_THRESHOLD_SECONDS,
  STALE_THRESHOLD_SECONDS,
} from "@/lib/constants";
import { queryAgentStatus } from "@/lib/contract";

interface HeartbeatResponse {
  agentId: number;
  lastSeen: number;
  lastSeenIso: string | null;
  isAlive: boolean;
  isStale: boolean;
  secondsAgo: number;
  uptimePercent: number;
  thresholdSeconds: number;
  owner: string | null;
  source: "onchain" | "error";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
): Promise<NextResponse> {
  const { agentId: agentIdStr } = await params;
  const agentId = parseInt(agentIdStr, 10);

  if (isNaN(agentId) || agentId < 0) {
    return NextResponse.json(
      { error: "Invalid agentId — must be a non-negative integer." },
      { status: 400 }
    );
  }

  const threshold =
    parseInt(request.nextUrl.searchParams.get("threshold") ?? "", 10) ||
    DEFAULT_THRESHOLD_SECONDS;

  // Query on-chain contract
  const status = await queryAgentStatus(agentId, threshold);

  if (!status) {
    return NextResponse.json(
      {
        agentId,
        lastSeen: 0,
        lastSeenIso: null,
        isAlive: false,
        isStale: false,
        secondsAgo: -1,
        uptimePercent: 0,
        thresholdSeconds: threshold,
        owner: null,
        source: "error" as const,
        error: "Failed to query on-chain contract",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const body: HeartbeatResponse = {
    agentId: status.agentId,
    lastSeen: status.lastSeenTs,
    lastSeenIso:
      status.lastSeenTs === 0
        ? null
        : new Date(status.lastSeenTs * 1000).toISOString(),
    isAlive: status.isAlive,
    isStale:
      !status.isAlive &&
      status.lastSeenTs !== 0 &&
      status.secondsAgo <= STALE_THRESHOLD_SECONDS,
    secondsAgo: status.secondsAgo,
    uptimePercent: status.isAlive ? 99.9 : 0, // TODO: track historical uptime
    thresholdSeconds: threshold,
    owner: status.owner,
    source: "onchain",
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
      "X-Agent-Liveness-Oracle": "v1",
    },
  });
}
