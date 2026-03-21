"use client";

export type StatusLevel = "alive" | "stale" | "dead" | "unknown";

interface StatusIndicatorProps {
  status: StatusLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  StatusLevel,
  { color: string; bg: string; label: string; pulse: boolean }
> = {
  alive: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    label: "ALIVE",
    pulse: true,
  },
  stale: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    label: "STALE",
    pulse: false,
  },
  dead: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    label: "DEAD",
    pulse: false,
  },
  unknown: {
    color: "#888888",
    bg: "rgba(136,136,136,0.15)",
    label: "UNKNOWN",
    pulse: false,
  },
};

const SIZE_MAP = {
  sm: { dot: 8, ring: 16 },
  md: { dot: 12, ring: 24 },
  lg: { dot: 16, ring: 32 },
};

export default function StatusIndicator({
  status,
  size = "md",
  showLabel = false,
}: StatusIndicatorProps) {
  const cfg = STATUS_CONFIG[status];
  const { dot, ring } = SIZE_MAP[size];

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
    >
      {/* Pulsing ring + dot */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: ring,
          height: ring,
        }}
      >
        {/* Outer pulse ring — only for alive */}
        {cfg.pulse && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: cfg.color,
              opacity: 0.3,
              animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
        )}
        {/* Inner dot */}
        <span
          style={{
            position: "relative",
            width: dot,
            height: dot,
            borderRadius: "50%",
            background: cfg.color,
            boxShadow: `0 0 ${dot}px ${cfg.color}80`,
          }}
        />
      </span>

      {showLabel && (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: cfg.color,
            fontWeight: 700,
          }}
        >
          {cfg.label}
        </span>
      )}
    </span>
  );
}
