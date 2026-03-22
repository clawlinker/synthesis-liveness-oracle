"use client";

import { useEffect, useState } from "react";
import StatusIndicator, { StatusLevel } from "./StatusIndicator";

interface FeedEntry {
  id: string;
  agentId: number;
  agentName: string;
  ts: number;
  txHash: string;
  block: number;
}

interface LiveFeedProps {
  maxEntries?: number;
}

const AGENT_NAMES: Record<number, string> = {
  28805: "Clawlinker",
};

const CONTRACT = "0x3f6395B9535DD82B0e94028e0E818dfccafcCF87";
const BASE_RPC = "https://mainnet.base.org";
// Heartbeat event topic: keccak256("Heartbeat(uint256,address,uint256)")
const HEARTBEAT_TOPIC = "0x6941f6f57b822a3d508e7a95fc075f8ee16007b0b104ea7bcf983249723eb3cf";

function formatTs(ts: number): string {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
  return `${Math.floor(age / 86400)}d ago`;
}

function getStatus(ts: number): StatusLevel {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 20 * 60) return "alive";
  if (age < 60 * 60) return "stale";
  return "dead";
}

async function fetchRecentHeartbeats(count: number): Promise<FeedEntry[]> {
  try {
    // Get latest block
    const blockRes = await fetch(BASE_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    const { result: latestHex } = await blockRes.json();
    const latest = parseInt(latestHex, 16);

    // Look back ~6 hours (~10800 blocks at 2s/block)
    const fromBlock = Math.max(0, latest - 10800);

    // Fetch Heartbeat events
    const logsRes = await fetch(BASE_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_getLogs",
        params: [{
          address: CONTRACT,
          topics: [HEARTBEAT_TOPIC],
          fromBlock: "0x" + fromBlock.toString(16),
          toBlock: "latest",
        }],
      }),
    });
    const { result: logs } = await logsRes.json();

    if (!logs || !Array.isArray(logs)) return [];

    // Parse events — newest first
    const entries: FeedEntry[] = logs
      .reverse()
      .slice(0, count)
      .map((log: { topics: string[]; data: string; transactionHash: string; blockNumber: string }, i: number) => {
        const agentId = parseInt(log.topics[1], 16);
        const timestamp = parseInt(log.data, 16);
        return {
          id: `${log.transactionHash}-${i}`,
          agentId,
          agentName: AGENT_NAMES[agentId] || `Agent #${agentId}`,
          ts: timestamp,
          txHash: log.transactionHash,
          block: parseInt(log.blockNumber, 16),
        };
      });

    return entries;
  } catch (e) {
    console.error("Failed to fetch heartbeat events:", e);
    return [];
  }
}

export default function LiveFeed({ maxEntries = 12 }: LiveFeedProps) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceRender] = useState(0);

  useEffect(() => {
    fetchRecentHeartbeats(maxEntries).then((e) => {
      setEntries(e);
      setLoading(false);
    });

    // Refresh every 60s
    const interval = setInterval(() => {
      fetchRecentHeartbeats(maxEntries).then(setEntries);
    }, 60_000);

    // Update "X ago" labels every 30s
    const tick = setInterval(() => forceRender((n) => n + 1), 30_000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [maxEntries]);

  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid #1e1e1e",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid #1a1a1a",
          background: "#111",
        }}
      >
        <StatusIndicator status="alive" size="sm" />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "#888",
            textTransform: "uppercase",
          }}
        >
          Live Feed
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "0.65rem",
            color: "#444",
          }}
        >
          Base mainnet · on-chain
        </span>
      </div>

      {/* Entries */}
      <div style={{ maxHeight: "22rem", overflowY: "auto" }}>
        {loading ? (
          <div style={{
            padding: "2rem 1.25rem",
            textAlign: "center",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "#444",
          }}>
            Fetching heartbeat events…
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            padding: "2rem 1.25rem",
            textAlign: "center",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "#444",
          }}>
            No heartbeat events found
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.625rem 1.25rem",
                borderBottom: i < entries.length - 1 ? "1px solid #151515" : "none",
                background: i === 0 ? "rgba(34,197,94,0.04)" : "transparent",
              }}
            >
              <StatusIndicator status={getStatus(entry.ts)} size="sm" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#e0e0e0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.agentName}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    color: "#555",
                    marginTop: "0.1rem",
                  }}
                >
                  #{entry.agentId} ·{" "}
                  <a
                    href={`https://basescan.org/tx/${entry.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#555", textDecoration: "none" }}
                  >
                    {entry.txHash.slice(0, 10)}…
                  </a>
                </div>
              </div>

              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  color: "#555",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTs(entry.ts)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
