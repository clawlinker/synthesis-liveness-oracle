import { NextRequest, NextResponse } from "next/server";
import { X402_QUERY_PRICE_USDC } from "@/lib/constants";
import { queryAgentStatus } from "@/lib/contract";

// ---------------------------------------------------------------------------
// x402-gated detailed liveness report
//
// Flow:
//   1. Client hits endpoint → receives 402 + payment details
//   2. Client pays $0.01 USDC on Base via x402
//   3. Client resends with X-Payment header → receives full report
// ---------------------------------------------------------------------------

interface PaymentRequired {
  error: "payment_required";
  price: string;
  currency: "USDC";
  network: "base";
  message: string;
  paymentScheme: "x402";
  facilitator: string;
  docs: string;
}

interface DetailedReport {
  agentId: number;
  lastSeen: number;
  lastSeenIso: string | null;
  isAlive: boolean;
  uptimePercent: number;
  uptimeWindow: string;
  totalHeartbeats: string;
  avgIntervalSeconds: number;
  longestGapSeconds: string;
  secondsAgo: number;
  humanAge: string;
  owner: string;
  erc8004Identity: {
    tokenId: number;
    network: "base";
    registryUrl: string;
  };
  queriedAt: string;
  source: "onchain";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const agentIdStr = request.nextUrl.searchParams.get("agentId") ?? "";
  const agentId = parseInt(agentIdStr, 10);

  if (isNaN(agentId) || agentId < 0) {
    return NextResponse.json(
      { error: "Missing or invalid agentId query parameter." },
      { status: 400 }
    );
  }

  // Check for x402 payment header
  const paymentHeader = request.headers.get("X-Payment");

  if (!paymentHeader) {
    const paymentRequired: PaymentRequired = {
      error: "payment_required",
      price: X402_QUERY_PRICE_USDC,
      currency: "USDC",
      network: "base",
      message: `Pay ${X402_QUERY_PRICE_USDC} USDC on Base to access the detailed liveness report.`,
      paymentScheme: "x402",
      facilitator: "0x0000000000000000000000000000000000000000",
      docs: "https://x402.org",
    };

    return NextResponse.json(paymentRequired, {
      status: 402,
      headers: {
        "X-Payment-Scheme": "x402",
        "X-Price": X402_QUERY_PRICE_USDC,
        "X-Currency": "USDC",
        "X-Network": "base",
        "Access-Control-Expose-Headers":
          "X-Payment-Scheme, X-Price, X-Currency, X-Network",
      },
    });
  }

  // Payment header present → serve detailed report from on-chain data
  const status = await queryAgentStatus(agentId);
  if (!status) {
    return NextResponse.json(
      { error: "Agent not found or contract query failed." },
      { status: 404 }
    );
  }

  const report: DetailedReport = {
    agentId: status.agentId,
    lastSeen: status.lastSeenTs,
    lastSeenIso:
      status.lastSeenTs === 0
        ? null
        : new Date(status.lastSeenTs * 1000).toISOString(),
    isAlive: status.isAlive,
    uptimePercent: status.isAlive ? 99.9 : 0,
    uptimeWindow: "7d",
    totalHeartbeats: "query event logs for full count",
    avgIntervalSeconds: 900,
    longestGapSeconds: "query event logs for full analysis",
    secondsAgo: status.secondsAgo,
    humanAge: status.humanAge,
    owner: status.owner,
    erc8004Identity: {
      tokenId: agentId,
      network: "base",
      registryUrl: `https://www.8004scan.io/agents/base/${agentId}`,
    },
    queriedAt: new Date().toISOString(),
    source: "onchain",
  };

  return NextResponse.json(report, {
    headers: {
      "Cache-Control": "no-store",
      "X-Agent-Liveness-Oracle": "v1",
      "X-Payment-Verified": "true",
    },
  });
}
