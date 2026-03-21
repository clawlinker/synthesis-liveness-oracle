"use client";

import StatusIndicator, { StatusLevel } from "./StatusIndicator";

export interface AgentHeartbeatData {
  agentId: number;
  name: string;
  lastSeenTs: number; // Unix seconds, 0 = never
  uptimePercent: number;
  heartbeatInterval: number; // seconds
  totalHeartbeats: number;
  network: string;
}

interface HeartbeatCardProps {
  data: AgentHeartbeatData;
  isHighlighted?: boolean;
}

function getStatus(lastSeenTs: number): StatusLevel {
  if (lastSeenTs === 0) return "unknown";
  const age = Math.floor(Date.now() / 1000) - lastSeenTs;
  if (age < 20 * 60) return "alive";
  if (age < 60 * 60) return "stale";
  return "dead";
}

function formatAge(lastSeenTs: number): string {
  if (lastSeenTs === 0) return "never";
  const age = Math.floor(Date.now() / 1000) - lastSeenTs;
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
  return `${Math.floor(age / 86400)}d ago`;
}

function formatTimestamp(ts: number): string {
  if (ts === 0) return "—";
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function uptimeColor(pct: number): string {
  if (pct >= 99) return "#22c55e";
  if (pct >= 95) return "#f59e0b";
  return "#ef4444";
}

export default function HeartbeatCard({
  data,
  isHighlighted = false,
}: HeartbeatCardProps) {
  const status = getStatus(data.lastSeenTs);
  const age = formatAge(data.lastSeenTs);
  const timestamp = formatTimestamp(data.lastSeenTs);
  const uptimeClr = uptimeColor(data.uptimePercent);

  return (
    <div
      style={{
        background: isHighlighted ? "rgba(34,197,94,0.05)" : "#111111",
        border: `1px solid ${isHighlighted ? "rgba(34,197,94,0.3)" : "#1e1e1e"}`,
        borderRadius: "0.75rem",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <StatusIndicator status={status} size="md" />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "#ededed",
                letterSpacing: "-0.01em",
              }}
            >
              {data.name}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: "#888",
                marginTop: "0.15rem",
              }}
            >
              agent #{data.agentId} · {data.network}
            </div>
          </div>
        </div>

        {/* Last seen badge */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: status === "alive" ? "#22c55e" : status === "stale" ? "#f59e0b" : "#ef4444",
            background:
              status === "alive"
                ? "rgba(34,197,94,0.1)"
                : status === "stale"
                ? "rgba(245,158,11,0.1)"
                : "rgba(239,68,68,0.1)",
            border: `1px solid ${
              status === "alive"
                ? "rgba(34,197,94,0.25)"
                : status === "stale"
                ? "rgba(245,158,11,0.25)"
                : "rgba(239,68,68,0.25)"
            }`,
            borderRadius: "9999px",
            padding: "0.25rem 0.75rem",
            whiteSpace: "nowrap",
          }}
        >
          {age}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
        }}
      >
        <Stat label="UPTIME" value={`${data.uptimePercent.toFixed(1)}%`} color={uptimeClr} />
        <Stat label="HEARTBEATS" value={data.totalHeartbeats.toLocaleString()} />
        <Stat label="INTERVAL" value={`${Math.floor(data.heartbeatInterval / 60)}m`} />
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.68rem",
          color: "#555",
          borderTop: "1px solid #1a1a1a",
          paddingTop: "0.75rem",
        }}
      >
        Last heartbeat: {timestamp}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "#ededed",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          color: "#555",
          letterSpacing: "0.08em",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.95rem",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
