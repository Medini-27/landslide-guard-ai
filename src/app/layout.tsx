import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landslide Guard AI — Early Warning & Landslide Risk Monitoring (NER)",
  description:
    "SIH 2026 working prototype: explainable, rule-based landslide risk scoring, early warning, Leaflet/OpenStreetMap visualisation and road-connectivity monitoring for the North-Eastern Region of India.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
