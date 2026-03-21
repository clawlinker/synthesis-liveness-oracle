import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Liveness Oracle",
  description: "Permissionless heartbeat verification for ERC-8004 agents on Base",
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
