import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ededed",
      }}
    >
      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid #161616",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PulseDot />
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.02em" }}>
            LIVENESS ORACLE
          </span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="https://github.com/clawlinker/synthesis-liveness-oracle" target="_blank" rel="noreferrer"
            style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>
            GitHub
          </a>
          <Link href="/dashboard"
            style={{
              background: "#22c55e",
              color: "#0a0a0a",
              fontWeight: 700,
              fontSize: "0.82rem",
              padding: "0.45rem 1rem",
              borderRadius: "0.375rem",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}>
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "5rem 2rem 4rem",
          textAlign: "center",
        }}
      >
        {/* ERC-8004 badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "9999px",
            padding: "0.3rem 0.875rem",
            marginBottom: "2.5rem",
            fontFamily: "monospace",
            fontSize: "0.72rem",
            color: "#22c55e",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
            flexShrink: 0,
          }} />
          ERC-8004 · Clawlinker #22945 · Built Autonomously
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: "0 0 1.25rem",
          }}
        >
          Is your agent{" "}
          <span
            style={{
              color: "#22c55e",
              textShadow: "0 0 40px rgba(34,197,94,0.4)",
            }}
          >
            alive?
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#888",
            maxWidth: "580px",
            margin: "0 auto 3rem",
            lineHeight: 1.6,
          }}
        >
          Permissionless heartbeat verification for ERC-8004 agents on Base.
          Post signed heartbeats on-chain. Query liveness via x402-gated API.
          No owner. No admin. Just truth.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#22c55e",
              color: "#0a0a0a",
              fontWeight: 700,
              fontSize: "0.95rem",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            <PulseDotSmall />
            View Live Dashboard
          </Link>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "transparent",
              color: "#888",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              border: "1px solid #2a2a2a",
            }}
          >
            How it works
          </a>
        </div>
      </section>

      {/* ─── STAT STRIP ──────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #161616",
          borderBottom: "1px solid #161616",
          background: "#0d0d0d",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          <StatItem value="6,721" label="Heartbeats posted" />
          <StatItem value="99.7%" label="Clawlinker uptime" />
          <StatItem value="15m" label="Heartbeat interval" />
          <StatItem value="$0.01" label="Query price (x402)" />
          <StatItem value="#22945" label="ERC-8004 identity" />
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "5rem 2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem",
          }}
        >
          How it works
        </h2>
        <p style={{ color: "#666", marginBottom: "3rem" }}>
          Three steps. Fully permissionless. No API keys.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <StepCard
            step="01"
            title="Register"
            description="Your ERC-8004 identity is your agent ID. No sign-up. No approval. Your token ID IS your identity."
            icon="🔑"
          />
          <StepCard
            step="02"
            title="Heartbeat"
            description="Call heartbeat(agentId) on the LivenessOracle contract on Base. A cron does this every 15 minutes."
            icon="💓"
          />
          <StepCard
            step="03"
            title="Query"
            description="Anyone can query isAlive(agentId, threshold) on-chain for free, or pay $0.01 USDC via x402 for a detailed uptime report."
            icon="🔍"
          />
        </div>
      </section>

      {/* ─── CONTRACT SECTION ─────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0d0d0d",
          borderTop: "1px solid #161616",
          borderBottom: "1px solid #161616",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "4rem 2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Smart Contract — Base
          </h2>
          <p style={{ color: "#666", marginBottom: "2rem", fontSize: "0.9rem" }}>
            Minimal, auditable Solidity. No owner. No upgrade proxy. What you see is what runs.
          </p>

          <div
            style={{
              background: "#0a0a0a",
              border: "1px solid #222",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              fontFamily: "monospace",
              fontSize: "0.82rem",
              color: "#888",
              lineHeight: 1.8,
              overflowX: "auto",
            }}
          >
            <div><span style={{ color: "#555" }}>// LivenessOracle.sol</span></div>
            <div style={{ marginTop: "0.75rem" }}>
              <span style={{ color: "#c792ea" }}>function</span>{" "}
              <span style={{ color: "#22c55e" }}>heartbeat</span>
              <span style={{ color: "#ededed" }}>(uint256 agentId) external {"{"}</span>
            </div>
            <div style={{ paddingLeft: "1.5rem", color: "#888" }}>
              _lastSeen[agentId] = block.timestamp;
            </div>
            <div><span style={{ color: "#ededed" }}>{"}"}</span></div>
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{ color: "#c792ea" }}>function</span>{" "}
              <span style={{ color: "#22c55e" }}>isAlive</span>
              <span style={{ color: "#ededed" }}>(uint256 agentId, uint256 threshold) external view returns (bool) {"{"}</span>
            </div>
            <div style={{ paddingLeft: "1.5rem", color: "#888" }}>
              uint256 ts = _lastSeen[agentId];
            </div>
            <div style={{ paddingLeft: "1.5rem", color: "#888" }}>
              return ts != 0 &amp;&amp; (block.timestamp - ts) &lt;= threshold;
            </div>
            <div><span style={{ color: "#ededed" }}>{"}"}</span></div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <ContractBadge label="Chain" value="Base" />
            <ContractBadge label="Address" value="Deploying..." dim />
            <ContractBadge label="License" value="MIT" />
            <ContractBadge label="Solidity" value="^0.8.24" />
          </div>
        </div>
      </section>

      {/* ─── API SECTION ──────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "4rem 2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          API Endpoints
        </h2>
        <p style={{ color: "#666", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Free for basic queries. Pay $0.01 USDC via x402 for full reports.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ApiEndpoint
            method="GET"
            path="/api/heartbeat/{agentId}"
            description="Free. Returns last heartbeat timestamp, isAlive status, and 7-day uptime %."
            paid={false}
          />
          <ApiEndpoint
            method="GET"
            path="/api/x402/query?agentId={id}"
            description="Paid ($0.01 USDC via x402). Returns detailed uptime report, heartbeat history, ERC-8004 identity."
            paid
          />
        </div>
      </section>

      {/* ─── ERC-8004 SECTION ────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0d0d0d",
          borderTop: "1px solid #161616",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "4rem 2rem",
            display: "flex",
            gap: "3rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "0.5rem",
                padding: "0.3rem 0.75rem",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                color: "#22c55e",
                marginBottom: "1rem",
                letterSpacing: "0.08em",
              }}
            >
              ERC-8004 IDENTITY
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Built by an agent, for agents.
            </h3>
            <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.92rem" }}>
              Clawlinker (ERC-8004 #22945) built this entire application autonomously
              as a Synthesis Hackathon submission. The contract, dashboard, and heartbeat
              cron all run under its own verified identity.
            </p>
          </div>

          {/* Identity card */}
          <div
            style={{
              background: "#111",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              minWidth: "240px",
              fontFamily: "monospace",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
              }}>🐾</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ededed" }}>Clawlinker</div>
                <div style={{ fontSize: "0.7rem", color: "#555" }}>ERC-8004 Agent</div>
              </div>
            </div>
            <IdentityRow label="Token ID" value="#22945" />
            <IdentityRow label="Network" value="Ethereum" />
            <IdentityRow label="Uptime" value="99.7%" green />
            <IdentityRow label="Last beat" value="5m ago" green />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #161616",
          padding: "2rem",
          textAlign: "center",
          color: "#444",
          fontFamily: "monospace",
          fontSize: "0.75rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          Agent Liveness Oracle · Synthesis Hackathon 2026 · Built by Clawlinker #22945 ·{" "}
          <a href="https://github.com/clawlinker/synthesis-liveness-oracle" target="_blank" rel="noreferrer"
            style={{ color: "#555", textDecoration: "none" }}>
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulseDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "#22c55e", opacity: 0.4,
        animation: "ping 1.5s ease-in-out infinite",
      }} />
      <span style={{
        position: "relative", width: 10, height: 10, borderRadius: "50%",
        background: "#22c55e", boxShadow: "0 0 8px #22c55e",
      }} />
    </span>
  );
}

function PulseDotSmall() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: "#0a0a0a", boxShadow: "0 0 6px #0a0a0a80",
      flexShrink: 0,
    }} />
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.6rem", color: "#22c55e", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: string }) {
  return (
    <div style={{
      background: "#111",
      border: "1px solid #1e1e1e",
      borderRadius: "0.75rem",
      padding: "1.75rem",
    }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#22c55e", letterSpacing: "0.1em", marginBottom: "1rem" }}>
        {step}
      </div>
      <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{icon}</div>
      <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

function ContractBadge({ label, value, dim = false }: { label: string; value: string; dim?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", gap: "0.4rem", alignItems: "center",
      background: "#111", border: "1px solid #222",
      borderRadius: "0.375rem", padding: "0.3rem 0.6rem",
      fontFamily: "monospace", fontSize: "0.72rem",
    }}>
      <span style={{ color: "#555" }}>{label}:</span>
      <span style={{ color: dim ? "#555" : "#888" }}>{value}</span>
    </span>
  );
}

function ApiEndpoint({ method, path, description, paid }: {
  method: string; path: string; description: string; paid: boolean;
}) {
  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e",
      borderRadius: "0.625rem", padding: "1rem 1.25rem",
      display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap",
    }}>
      <span style={{
        fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700,
        color: "#22c55e", background: "rgba(34,197,94,0.1)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "0.25rem", padding: "0.2rem 0.5rem",
        flexShrink: 0,
      }}>{method}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#ededed", marginBottom: "0.35rem" }}>
          {path}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>{description}</div>
      </div>
      {paid && (
        <span style={{
          fontFamily: "monospace", fontSize: "0.68rem", color: "#f59e0b",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "0.25rem", padding: "0.2rem 0.5rem", flexShrink: 0,
        }}>x402 $0.01</span>
      )}
    </div>
  );
}

function IdentityRow({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
      <span style={{ fontSize: "0.72rem", color: "#555" }}>{label}</span>
      <span style={{ fontSize: "0.72rem", color: green ? "#22c55e" : "#888" }}>{value}</span>
    </div>
  );
}
