import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FalkorDB Context-Aware AI Agent | Graph Memory & Traceability",
  description:
    "An AI agent powered by FalkorDB leveraging relational graph knowledge, multi-session persistent memory, and auditable decision traceability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
