"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HeartbeatCard, { AgentHeartbeatData } from "@/components/HeartbeatCard";
import LiveFeed from "@/components/LiveFeed";
import StatusIndicator from "@/components/StatusIndicator";

// ─── Mock agent data ──────────────────────────────────────────────────────────
// In production this comes from on-chain events / API queries

const now = () => Math.floor(Date.now() / 1000);

const INITIAL_AGENTS: AgentHeartbeatData[] = [
  {
    agentId: 22945,
    name: "Clawlinker",
    lastSeenTs: now() - 312,
    uptimePercent: 99.7,
    heartbeatInterval: 15 * 60,
    totalHeartbeats: 6721,
    network: "Base",
  },
  {
    agentId: 8821,
    name: "Molttail",
    lastSeenTs: now() - 847,
    uptimePercent: 98.2,
    heartbeatInterval: 15 * 60,
    totalHeartbeats: 4102,
    network: "Base",
  },
  {
    agentId: 14503,
    name: "BasePilot",
    lastSeenTs: now() - 1203,
    uptimePercent: 97.5,
    heartbeatInterval: 30 * 60,
    totalHeartbeats: 2891,
    network: "Base",
  },
  {
    agentId: 3317,
    name: "VaultBot",
    lastSeenTs: now() - 4210,
    uptimePercent: 95.1,
    heartbeatInterval: 60 * 60,
    totalHeartbeats: 1204,
    network: "Base",
  },
  {
    agentId: 7001,
    name: "NexAgent",
    lastSeenTs: now() - 90000,
    uptimePercent: 72.3,
    heartbeatInterval: 15 * 60,
    totalHeartbeats: 9843,
    network: "Base",
  },
  {
    agentId: 19988,
    name: "Arbiter",
    lastSeenTs: now() - 3600 * 3,
    uptimePercent: 88.4,
    heartbeatInterval: 30 * 60,
    totalHeartbeats: 3301,
    network: "Base",
  },
];

function getStatusLevel(lastSeenTs: number): "alive" | "stale" | "dead" | "unknown" {
  if (lastSeenTs === 0) return "unknown";
  const age = now() - lastSeenTs;
  if (age < 20 * 60) return "alive";
  if (age < 60 * 60) return "stale";
  return "dead";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentHeartbeatData[]>(INITIAL_AGENTS);
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, tick] = useState(0);

  // Auto-refresh every 30 seconds
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate fetching fresh data — in production calls /api/heartbeat/{id}
    setTimeout(() => {
      // Simulate Clawlinker posting a new heartbeat occasionally
      setAgents((prev) =>
        prev.map((a) =>
          a.agentId === 22945 && now() - a.lastSeenTs > 14 * 60
            ? { ...a, lastSeenTs: now(), totalHeartbeats: a.totalHeartbeats + 1 }
            : a
        )
      );
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 600);
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30_000);
    // Tick every 10s to update "X ago" labels
    const tickInterval = setInterval(() => tick((n) => n + 1), 10_000);
    return () => {
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, [refresh]);

  // Filter agents
  const filtered = agents.filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      String(a.agentId).includes(q)
    );
  });

  const aliveCount = agents.filter((a) => getStatusLevel(a.lastSeenTs) === "alive").length;
  const staleCount = agents.filter((a) => getStatusLevel(a.lastSeenTs) === "stale").length;
  const deadCount = agents.filter((a) => getStatusLevel(a.lastSeenTs) === "dead").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ededed" }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid #161616",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          background: "#0d0d0d",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/"
            style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#555", textDecoration: "none" }}
          >
            ← Home
          </Link>
          <span style={{ color: "#2a2a2a" }}>|</span>
          <StatusIndicator status="alive" size="sm" />
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.02em" }}>
            LIVENESS DASHBOARD
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#444" }}>
            {isRefreshing ? "Refreshing…" : `Updated ${lastRefresh.toLocaleTimeString()}`}
          </span>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            style={{
              background: "transparent",
              border: "1px solid #2a2a2a",
              color: "#666",
              fontFamily: "monospace",
              fontSize: "0.72rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* ─── Summary stats ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <SummaryCard label="Alive" value={aliveCount} color="#22c55e" />
          <SummaryCard label="Stale" value={staleCount} color="#f59e0b" />
          <SummaryCard label="Dead" value={deadCount} color="#ef4444" />
          <SummaryCard label="Total Agents" value={agents.length} color="#888" />
        </div>

        {/* ─── Search ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="Search by agent name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "0.5rem",
              padding: "0.65rem 1rem",
              color: "#ededed",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ─── Main grid ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(260px, 380px)",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Agent cards */}
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#888", letterSpacing: "0.04em" }}>
                AGENTS ({filtered.length})
              </h2>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "transparent", border: "none", color: "#555",
                    cursor: "pointer", fontFamily: "monospace", fontSize: "0.75rem",
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div style={{
                background: "#111", border: "1px solid #1e1e1e", borderRadius: "0.75rem",
                padding: "3rem", textAlign: "center", color: "#444",
                fontFamily: "monospace", fontSize: "0.82rem",
              }}>
                No agents found for &quot;{search}&quot;
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {filtered.map((agent) => (
                  <HeartbeatCard
                    key={agent.agentId}
                    data={agent}
                    isHighlighted={agent.agentId === 22945}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Live feed sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#888", letterSpacing: "0.04em" }}>
                LIVE FEED
              </h2>
            </div>
            <LiveFeed maxEntries={14} autoAnimate />

            {/* Contract info */}
            <div style={{
              marginTop: "1.25rem",
              background: "#0d0d0d",
              border: "1px solid #1a1a1a",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
              fontFamily: "monospace",
              fontSize: "0.72rem",
            }}>
              <div style={{ color: "#444", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>CONTRACT</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555" }}>Network</span>
                <span style={{ color: "#888" }}>Base</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555" }}>Address</span>
                <span style={{ color: "#555" }}>Deploying…</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#555" }}>Threshold</span>
                <span style={{ color: "#888" }}>20m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "#111",
      border: `1px solid ${color}22`,
      borderRadius: "0.625rem",
      padding: "1rem 1.25rem",
    }}>
      <div style={{ fontFamily: "monospace", fontSize: "1.75rem", fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#555", marginTop: "0.35rem", letterSpacing: "0.08em" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}
