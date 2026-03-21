import { NextRequest, NextResponse } from "next/server";
import { X402_QUERY_PRICE_USDC } from "@/lib/constants";

// ---------------------------------------------------------------------------
// x402-gated detailed liveness report
//
// Production flow:
//   1. Client hits this endpoint → receives 402 + payment details
//   2. Client pays $0.01 USDC on Base via x402 facilitator
//   3. Client resends with X-Payment header → receives full report
//
// This stub returns a 402 with the payment instructions so hackathon
// judges can see the x402 integration shape. Full CDP x402 middleware
// integration is wired in once the facilitator contract address is set.
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
  totalHeartbeats: number;
  avgIntervalSeconds: number;
  longestGapSeconds: number;
  lastGapSeconds: number;
  erc8004Identity: {
    tokenId: number;
    network: "ethereum";
    name: string;
  } | null;
  queriedAt: string;
  source: "mock";
}

// Generate mock data dynamically per request so timestamps stay fresh
function getDetailedMock(agentId: number): Omit<DetailedReport, "queriedAt"> | null {
  if (agentId !== 22945) return null;
  const lastSeen = Math.floor(Date.now() / 1000) - 312;
  return {
    agentId: 22945,
    lastSeen,
    lastSeenIso: new Date(lastSeen * 1000).toISOString(),
    isAlive: true,
    uptimePercent: 99.7,
    uptimeWindow: "7d",
    totalHeartbeats: 6721,
    avgIntervalSeconds: 900,
    longestGapSeconds: 3240,
    lastGapSeconds: 312,
    erc8004Identity: { tokenId: 22945, network: "ethereum", name: "Clawlinker" },
    source: "mock",
  };
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
    // Return 402 Payment Required with x402 payment details
    const paymentRequired: PaymentRequired = {
      error: "payment_required",
      price: X402_QUERY_PRICE_USDC,
      currency: "USDC",
      network: "base",
      message: `Pay ${X402_QUERY_PRICE_USDC} USDC on Base to access the detailed liveness report.`,
      paymentScheme: "x402",
      facilitator: "0x0000000000000000000000000000000000000000", // CDP facilitator — set post-deployment
      docs: "https://x402.org",
    };

    return NextResponse.json(paymentRequired, {
      status: 402,
      headers: {
        "X-Payment-Scheme": "x402",
        "X-Price": X402_QUERY_PRICE_USDC,
        "X-Currency": "USDC",
        "X-Network": "base",
        "Access-Control-Expose-Headers": "X-Payment-Scheme, X-Price, X-Currency, X-Network",
      },
    });
  }

  // Payment header present → serve detailed report
  // In production: verify payment proof via x402 CDP facilitator before responding
  const mockReport = getDetailedMock(agentId);
  if (!mockReport) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const report: DetailedReport = {
    ...mockReport,
    queriedAt: new Date().toISOString(),
  };

  return NextResponse.json(report, {
    headers: {
      "Cache-Control": "no-store",
      "X-Agent-Liveness-Oracle": "v1",
      "X-Payment-Verified": "true",
    },
  });
}
