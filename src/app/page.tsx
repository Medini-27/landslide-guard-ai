import Dashboard from "@/components/Dashboard";
import { FutureAndLimits, ProblemSolution } from "@/components/StaticSections";
import { getEnrichedLocations } from "@/lib/monitoring";
import { getDataset, getRecentAssessments } from "@/lib/store";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#how", label: "How It Works" },
  { href: "#risk-analysis", label: "Risk Analysis" },
  { href: "#map", label: "Map" },
  { href: "#early-warning", label: "Early Warning" },
  { href: "#roads", label: "Road Monitoring" },
  { href: "#data", label: "Data & Tests" },
  { href: "#future-ai", label: "Future AI/ML" },
  { href: "#limitations", label: "Limitations" },
];

export default async function Home() {
  const [locations, dataset, recent] = await Promise.all([
    getEnrichedLocations(),
    getDataset(),
    getRecentAssessments(10),
  ]);

  const roadCount = locations.reduce((sum, loc) => sum + loc.roads.length, 0);
  const highRisk = locations.filter((l) => l.riskLevel === "HIGH").length;

  return (
    <div className="min-h-screen">
      {/* ------------------------------ NAV ------------------------------ */}
      <header className="sticky top-0 z-[1000] border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 text-base">
              ⛰
            </span>
            <span className="text-sm font-bold tracking-tight text-white">Landslide Guard AI</span>
          </a>
          <nav className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-sky-300">
                {item.label}
              </a>
            ))}
          </nav>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Working prototype · demo data
          </span>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        {/* ------------------------------ HERO ------------------------------ */}
        <section className="overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-7 shadow-2xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-300">
                Smart India Hackathon 2026 · Disaster Management
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Landslide <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">Guard AI</span>
              </h1>
              <p className="mt-2 max-w-2xl text-base font-medium text-slate-300 md:text-lg">
                AI-Based Early Warning and Landslide Risk Monitoring System
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                A functional full-stack prototype for the North-Eastern Region of India. It turns rainfall, soil
                moisture, slope, elevation and past-landslide history into an explainable 0–100 risk score, plots it on
                an OpenStreetMap view, and raises an early warning with recommended actions and road-connectivity
                advice.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#risk-analysis"
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-cyan-300"
                >
                  ⛰ Analyze Landslide Risk
                </a>
                <a
                  href="#map"
                  className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
                >
                  View risk map
                </a>
                <a
                  href="/api/dataset?format=csv"
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                >
                  ⬇ Sample dataset (CSV)
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Region snapshot (demo)</p>
              <div className="mt-3 space-y-3">
                <SnapshotRow label="Locations monitored" value={`${locations.length}`} />
                <SnapshotRow label="Currently HIGH risk" value={`${highRisk}`} accent="text-red-400" />
                <SnapshotRow label="Road segments tracked" value={`${roadCount}`} />
                <SnapshotRow label="Dataset records" value={`${dataset.length}`} />
              </div>
              <p className="mt-4 border-t border-slate-800 pt-3 text-[11px] leading-relaxed text-slate-500">
                All values on this page come from a seeded prototype/demo dataset. No live sensors or weather APIs are
                connected in this release.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------- SAFETY NOTICE -------------------------- */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-xs leading-relaxed text-amber-100">
          <strong className="font-bold">⚠ Prototype disclaimer —</strong> Landslide Guard AI is a{" "}
          <strong>working college-level prototype built for SIH 2026</strong>. It uses a transparent rule-based scoring
          engine, <strong>not a trained machine-learning model</strong>, and its outputs are{" "}
          <strong>not scientifically validated</strong>. This is <strong>not an official emergency warning system</strong>.
          All locations, rainfall, soil-moisture and road-status values shown here are clearly labelled{" "}
          <strong>prototype/demo data</strong>. For real emergencies, always follow NDMA, SDMA, DDMA and IMD advisories.
        </div>

        <ProblemSolution stats={{ locations: locations.length, records: dataset.length, roads: roadCount }} />

        <Dashboard locations={locations} dataset={dataset} recent={recent} />

        <FutureAndLimits />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 py-7 text-xs text-slate-500">
          <p className="font-semibold text-slate-300">Landslide Guard AI — AI-Based Early Warning and Landslide Risk Monitoring System (NER)</p>
          <p className="mt-1">
            Smart India Hackathon 2026 prototype · Next.js + PostgreSQL/Drizzle backend · rule-based risk engine (Python
            reference included) · Leaflet.js + OpenStreetMap (no paid map APIs).
          </p>
          <p className="mt-1">
            Demo/prototype data only. Not an official warning service. Map data © OpenStreetMap contributors.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SnapshotRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-2 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-lg font-bold ${accent ?? "text-slate-100"}`}>{value}</span>
    </div>
  );
}
