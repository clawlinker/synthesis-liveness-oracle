"use client";

import { useEffect, useState } from "react";
import StatusIndicator, { StatusLevel } from "./StatusIndicator";

interface FeedEntry {
  id: string;
  agentId: number;
  agentName: string;
  ts: number; // Unix seconds
  txHash: string;
}

interface LiveFeedProps {
  maxEntries?: number;
  autoAnimate?: boolean;
}

// Mock feed data seeded with realistic agent heartbeats
const SEED_ENTRIES: FeedEntry[] = [
  { id: "1", agentId: 22945, agentName: "Clawlinker", ts: Math.floor(Date.now() / 1000) - 312, txHash: "0x3a9f" },
  { id: "2", agentId: 8821, agentName: "Molttail", ts: Math.floor(Date.now() / 1000) - 847, txHash: "0xb7c2" },
  { id: "3", agentId: 14503, agentName: "BasePilot", ts: Math.floor(Date.now() / 1000) - 1203, txHash: "0x91de" },
  { id: "4", agentId: 3317, agentName: "VaultBot", ts: Math.floor(Date.now() / 1000) - 2051, txHash: "0x4fa1" },
  { id: "5", agentId: 22945, agentName: "Clawlinker", ts: Math.floor(Date.now() / 1000) - 2712, txHash: "0xc8e5" },
  { id: "6", agentId: 7001, agentName: "NexAgent", ts: Math.floor(Date.now() / 1000) - 3415, txHash: "0x2d07" },
  { id: "7", agentId: 19988, agentName: "Arbiter", ts: Math.floor(Date.now() / 1000) - 4100, txHash: "0x5b3c" },
  { id: "8", agentId: 8821, agentName: "Molttail", ts: Math.floor(Date.now() / 1000) - 4804, txHash: "0xa66d" },
];

const AGENT_NAMES: Record<number, string> = {
  22945: "Clawlinker",
  8821: "Molttail",
  14503: "BasePilot",
  3317: "VaultBot",
  7001: "NexAgent",
  19988: "Arbiter",
};

const AGENT_IDS = Object.keys(AGENT_NAMES).map(Number);

function randomTxHash(): string {
  return (
    "0x" +
    Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join("")
  );
}

function formatTs(ts: number): string {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  return `${Math.floor(age / 3600)}h ago`;
}

function getStatus(ts: number): StatusLevel {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 20 * 60) return "alive";
  if (age < 60 * 60) return "stale";
  return "dead";
}

export default function LiveFeed({ maxEntries = 12, autoAnimate = true }: LiveFeedProps) {
  const [entries, setEntries] = useState<FeedEntry[]>(SEED_ENTRIES.slice(0, maxEntries));
  const [, forceRender] = useState(0);

  // Simulate new heartbeats arriving
  useEffect(() => {
    if (!autoAnimate) return;
    let counter = 100;
    const interval = setInterval(() => {
      const agentId = AGENT_IDS[Math.floor(Math.random() * AGENT_IDS.length)];
      const newEntry: FeedEntry = {
        id: String(counter++),
        agentId,
        agentName: AGENT_NAMES[agentId],
        ts: Math.floor(Date.now() / 1000),
        txHash: randomTxHash(),
      };
      setEntries((prev) => [newEntry, ...prev].slice(0, maxEntries));
    }, 8000 + Math.random() * 7000);

    // Force re-render every 30s to update "X ago" times
    const tick = setInterval(() => forceRender((n) => n + 1), 30000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [autoAnimate, maxEntries]);

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
          Base mainnet
        </span>
      </div>

      {/* Entries */}
      <div style={{ maxHeight: "22rem", overflowY: "auto" }}>
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0.625rem 1.25rem",
              borderBottom: i < entries.length - 1 ? "1px solid #151515" : "none",
              background: i === 0 ? "rgba(34,197,94,0.04)" : "transparent",
              transition: "background 0.5s",
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
                #{entry.agentId} · {entry.txHash}…
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
        ))}
      </div>
    </div>
  );
}
