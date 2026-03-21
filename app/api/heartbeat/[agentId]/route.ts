import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_THRESHOLD_SECONDS, STALE_THRESHOLD_SECONDS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mock liveness data — in production, this queries the on-chain contract.
// Swap queryAgentStatus() in once the contract is deployed.
// ---------------------------------------------------------------------------

interface HeartbeatResponse {
  agentId: number;
  lastSeen: number; // Unix timestamp, 0 = never
  lastSeenIso: string | null;
  isAlive: boolean;
  isStale: boolean;
  secondsAgo: number;
  uptimePercent: number;
  thresholdSeconds: number;
  source: "mock" | "onchain";
}

// Simulated last-seen offsets (seconds ago) — computed dynamically per request
const MOCK_OFFSETS: Record<number, { offsetSeconds: number; uptimePct: number }> = {
  22945: { offsetSeconds: 312,   uptimePct: 99.7 }, // Clawlinker
  8821:  { offsetSeconds: 847,   uptimePct: 98.2 },
  14503: { offsetSeconds: 1203,  uptimePct: 97.5 },
  3317:  { offsetSeconds: 4210,  uptimePct: 95.1 },
  7001:  { offsetSeconds: 90000, uptimePct: 72.3 }, // dead
};

function getMockData(agentId: number): { lastSeen: number; uptimePct: number } | null {
  const entry = MOCK_OFFSETS[agentId];
  if (!entry) return null;
  return { lastSeen: Math.floor(Date.now() / 1000) - entry.offsetSeconds, uptimePct: entry.uptimePct };
}

// ---------------------------------------------------------------------------

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

  const nowTs = Math.floor(Date.now() / 1000);

  // Attempt on-chain query (no-ops until contract deployed)
  // const onchain = await queryAgentStatus(agentId, threshold);
  // if (onchain) { ... }

  // Fall back to mock data
  const mock = getMockData(agentId);
  const lastSeen = mock?.lastSeen ?? 0;
  const secondsAgo = lastSeen === 0 ? -1 : nowTs - lastSeen;

  const body: HeartbeatResponse = {
    agentId,
    lastSeen,
    lastSeenIso: lastSeen === 0 ? null : new Date(lastSeen * 1000).toISOString(),
    isAlive: lastSeen !== 0 && secondsAgo <= threshold,
    isStale:
      lastSeen !== 0 &&
      secondsAgo > threshold &&
      secondsAgo <= STALE_THRESHOLD_SECONDS,
    secondsAgo,
    uptimePercent: mock?.uptimePct ?? 0,
    thresholdSeconds: threshold,
    source: "mock",
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
      "X-Agent-Liveness-Oracle": "v1",
    },
  });
}
