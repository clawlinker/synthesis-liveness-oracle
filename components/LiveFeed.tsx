"use client";

import { useEffect, useState } from "react";
import StatusIndicator, { StatusLevel } from "./StatusIndicator";

interface FeedEntry {
  agentId: number;
  agentName: string;
  timestamp: number;
  txHash: string;
  block: number;
}

interface LiveFeedProps {
  maxEntries?: number;
}

function formatTs(ts: number): string {
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 0) return "just now";
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

export default function LiveFeed({ maxEntries = 14 }: LiveFeedProps) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceRender] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/events?limit=${maxEntries}`);
        if (!res.ok) return;
        const data = await res.json();
        setEntries(data.events || []);
      } catch (e) {
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 60_000);
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
              key={`${entry.txHash}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.625rem 1.25rem",
                borderBottom: i < entries.length - 1 ? "1px solid #151515" : "none",
                background: i === 0 ? "rgba(34,197,94,0.04)" : "transparent",
              }}
            >
              <StatusIndicator status={getStatus(entry.timestamp)} size="sm" />

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
                {formatTs(entry.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
