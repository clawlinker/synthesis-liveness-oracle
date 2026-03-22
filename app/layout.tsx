import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Liveness Oracle",
  description: "Permissionless heartbeat verification for ERC-8004 agents on Base. Is your agent alive? Now you can prove it — on-chain.",
  openGraph: {
    title: "Agent Liveness Oracle",
    description: "Permissionless heartbeat verification for ERC-8004 agents on Base.",
    siteName: "Liveness Oracle",
  },
  twitter: {
    card: "summary",
    title: "Agent Liveness Oracle",
    description: "Is your agent alive? Prove it on-chain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
