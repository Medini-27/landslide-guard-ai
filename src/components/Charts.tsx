"use client";

import type { FactorBreakdown, RiskLevel } from "@/lib/risk-engine";
import { riskColor } from "@/lib/risk-engine";

/** Semicircular risk gauge (pure SVG, no chart library). */
export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const radius = 78;
  const circumference = Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const color = riskColor(level);

  return (
    <svg viewBox="0 0 200 116" className="h-auto w-full max-w-[260px]">
      <path
        d={`M 22 100 A ${radius} ${radius} 0 0 1 178 100`}
        fill="none"
        stroke="#1e293b"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d={`M 22 100 A ${radius} ${radius} 0 0 1 178 100`}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        style={{ transition: "stroke-dasharray 700ms ease, stroke 400ms ease" }}
      />
      <text x="100" y="86" textAnchor="middle" className="fill-white" style={{ fontSize: 34, fontWeight: 700 }}>
        {score}
      </text>
      <text x="100" y="104" textAnchor="middle" style={{ fontSize: 11, fill: "#94a3b8" }}>
        out of 100
      </text>
      <text x="20" y="114" style={{ fontSize: 9, fill: "#64748b" }}>
        0
      </text>
      <text x="172" y="114" style={{ fontSize: 9, fill: "#64748b" }}>
        100
      </text>
    </svg>
  );
}

/** Horizontal contribution bars for every scoring factor. */
export function FactorBars({ factors }: { factors: FactorBreakdown[] }) {
  const severityColor: Record<string, string> = {
    severe: "bg-red-500",
    high: "bg-orange-500",
    moderate: "bg-amber-400",
    low: "bg-emerald-500",
  };

  return (
    <ul className="space-y-3">
      {factors.map((factor) => {
        const pct = factor.maxPoints === 0 ? 0 : (factor.points / factor.maxPoints) * 100;
        return (
          <li key={factor.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-slate-200">{factor.label}</span>
              <span className="shrink-0 font-mono text-slate-400">
                {factor.value} · {factor.points}/{factor.maxPoints} pts
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${severityColor[factor.severity]} transition-all duration-700`}
                style={{ width: `${Math.max(pct, 1.5)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export interface TrendPoint {
  day: string;
  rainfall: number;
  soilMoisture: number;
}

/** 7-day rainfall bars + soil-moisture line (demo trend). */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const width = 520;
  const height = 190;
  const padX = 34;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2 - 18;
  const maxRain = Math.max(60, ...data.map((d) => d.rainfall)) * 1.15;
  const barW = innerW / data.length - 12;

  const linePoints = data
    .map((d, i) => {
      const x = padX + (i + 0.5) * (innerW / data.length);
      const y = padY + innerH - (d.soilMoisture / 100) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * t}
            y2={padY + innerH * t}
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}
        {data.map((d, i) => {
          const x = padX + i * (innerW / data.length) + 6;
          const h = Math.max(2, (d.rainfall / maxRain) * innerH);
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={padY + innerH - h}
                width={barW}
                height={h}
                rx="3"
                fill={d.rainfall >= 100 ? "#38bdf8" : "#0ea5e9"}
                opacity={0.85}
              />
              <text
                x={x + barW / 2}
                y={padY + innerH + 14}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "#64748b" }}
              >
                {d.day.replace("Day ", "")}
              </text>
            </g>
          );
        })}
        <polyline points={linePoints} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = padX + (i + 0.5) * (innerW / data.length);
          const y = padY + innerH - (d.soilMoisture / 100) * innerH;
          return <circle key={d.day} cx={x} cy={y} r="3.4" fill="#f59e0b" stroke="#0b1220" strokeWidth="1.4" />;
        })}
        <text x={6} y={padY + 4} style={{ fontSize: 9, fill: "#64748b" }}>
          {Math.round(maxRain)}mm
        </text>
        <text x={6} y={padY + innerH} style={{ fontSize: 9, fill: "#64748b" }}>
          0
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm bg-sky-500" /> Rainfall (mm / day)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-amber-500" /> Soil moisture (%)
        </span>
      </div>
    </div>
  );
}

/** Distribution of risk levels across the monitored demo locations. */
export function RiskDistribution({ counts }: { counts: { LOW: number; MEDIUM: number; HIGH: number } }) {
  const total = Math.max(1, counts.LOW + counts.MEDIUM + counts.HIGH);
  const rows: Array<{ label: RiskLevel; value: number; color: string }> = [
    { label: "HIGH", value: counts.HIGH, color: "bg-red-500" },
    { label: "MEDIUM", value: counts.MEDIUM, color: "bg-amber-400" },
    { label: "LOW", value: counts.LOW, color: "bg-emerald-500" },
  ];
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-3 text-xs">
          <span className="w-16 font-semibold text-slate-300">{row.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full ${row.color}`} style={{ width: `${(row.value / total) * 100}%` }} />
          </div>
          <span className="w-8 text-right font-mono text-slate-400">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
