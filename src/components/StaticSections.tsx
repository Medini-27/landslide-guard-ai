import { RISK_THRESHOLDS } from "@/lib/risk-engine";

function Heading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-400">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function ProblemSolution({ stats }: { stats: { locations: number; records: number; roads: number } }) {
  return (
    <>
      <section id="problem" className="scroll-mt-24">
        <Heading
          eyebrow="01 · Problem"
          title="Why the North-Eastern Region needs landslide early warning"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">The situation</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>▸ The NER receives extremely heavy monsoon rainfall over young, weak and highly weathered Himalayan / Patkai terrain.</li>
              <li>▸ Hill towns such as Aizawl, Gangtok and Kohima are built on 30°–45° cut-slopes with dense unplanned construction.</li>
              <li>▸ Single-corridor highways (NH-10, NH-06, NH-29, NH-13) get blocked, isolating entire districts for days.</li>
              <li>▸ Warnings today are largely reactive: damage is reported <em>after</em> a slide has already happened.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">The gap this prototype targets</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>▸ No single dashboard combines rainfall, soil moisture, slope, elevation and slide history per location.</li>
              <li>▸ Risk outputs from black-box models are hard for district officials to trust or act on.</li>
              <li>▸ Road connectivity status is not linked to slope-risk information.</li>
              <li>▸ Citizens need a plain-language answer: <strong className="text-slate-200">how risky is my location right now, and why?</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="solution" className="scroll-mt-24">
        <Heading
          eyebrow="02 · Solution"
          title="Landslide Guard AI — an explainable risk & early-warning dashboard"
          subtitle="A working full-stack prototype that turns five simple environmental/geographical inputs into a transparent 0–100 risk score, a LOW / MEDIUM / HIGH classification, a plain-language explanation, a live map and an actionable warning."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: "🧮",
              title: "Transparent risk engine",
              body: "A documented multi-factor scoring model (not a black box, and not a fake ML model). Every point is traceable to a threshold table that anyone can audit or tune.",
            },
            {
              icon: "🗺️",
              title: "Live map + monitoring",
              body: `Leaflet + OpenStreetMap plots ${stats.locations} monitored NER demo locations, colour-coded by risk, with a per-location parameter monitor and 7-day demo trends.`,
            },
            {
              icon: "🚨",
              title: "Action, not just numbers",
              body: "HIGH risk fires a prominent warning with recommended precautions; the road module flags blocked corridors and suggests alternate routing.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
              <div className="mb-2 text-2xl">{card.icon}</div>
              <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat value={`${stats.locations}`} label="NER locations monitored (demo)" />
          <Stat value={`${stats.records}`} label="Sample dataset records seeded" />
          <Stat value={`${stats.roads}`} label="Road segments tracked (demo)" />
        </div>
      </section>

      <section id="how" className="scroll-mt-24">
        <Heading
          eyebrow="03 · How It Works"
          title="Input → Risk analysis → Risk level → Explanation → Map → Warning"
        />
        <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { n: "1", t: "Input data", d: "Pick an NER location (auto-fills demo telemetry) or type your own rainfall, soil moisture, slope, elevation and history." },
            { n: "2", t: "Risk analysis", d: "POST /api/assess runs the rule-based engine server-side and scores 7 weighted factors out of 100." },
            { n: "3", t: "Risk level", d: `Thresholds: LOW < ${RISK_THRESHOLDS.MEDIUM_MIN}, MEDIUM ${RISK_THRESHOLDS.MEDIUM_MIN}–${RISK_THRESHOLDS.HIGH_MIN - 1}, HIGH ≥ ${RISK_THRESHOLDS.HIGH_MIN}.` },
            { n: "4", t: "Explanation", d: "Each factor returns its points, severity and a human reason — the UI shows exactly why the score came out that way." },
            { n: "5", t: "Map", d: "The location is plotted on Leaflet/OSM with a colour-coded marker and popup; other locations stay visible for comparison." },
            { n: "6", t: "Warning", d: "HIGH fires an emergency-style banner + precautions; MEDIUM shows an advisory; LOW shows a normal status." },
          ].map((step) => (
            <li key={step.n} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold text-sky-300">
                {step.n}
              </span>
              <h3 className="text-sm font-semibold text-slate-100">{step.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3">
      <p className="text-2xl font-bold text-sky-300">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

export function FutureAndLimits() {
  return (
    <>
      <section id="future-ai" className="scroll-mt-24">
        <Heading
          eyebrow="09 · Future AI/ML Integration"
          title="Future AI/ML Integration"
          subtitle="The current release uses a transparent rule-based scoring engine. No machine-learning model has been trained for this prototype, and we do not claim one is running."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-sky-200">Planned upgrade path</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>▸ Collect historical landslide inventories (GSI, NRSC/Bhuvan, NDMA, state DDMAs) with matching rainfall and soil-moisture records.</li>
              <li>▸ Engineer features: antecedent rainfall (3/7/15-day), rainfall intensity-duration, NDVI, lithology, land-use change, slope aspect, distance to road cut.</li>
              <li>▸ Train and compare classification models — <strong>Random Forest</strong>, <strong>Decision Tree</strong>, Gradient Boosting / XGBoost, Logistic Regression and SVM.</li>
              <li>▸ Validate with stratified k-fold CV and report precision / recall / F1 / ROC-AUC, prioritising recall for HIGH risk.</li>
              <li>▸ Keep explainability with SHAP or feature-importance so officials still see <em>why</em> a warning fired.</li>
              <li>▸ Retain the rule engine as a fallback and as a sanity check against model drift.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Why the code is already ML-ready</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>▸ Scoring is isolated in a single pure function, <code className="text-slate-200">assessRisk()</code> in <code className="text-slate-200">src/lib/risk-engine.ts</code> (mirrored in <code className="text-slate-200">python_engine/risk_engine.py</code>).</li>
              <li>▸ The API contract (<code className="text-slate-200">POST /api/assess</code>) returns score + level + factor breakdown, so a model can be swapped in behind the same response shape.</li>
              <li>▸ Every analysis is persisted to PostgreSQL — the beginnings of a training set.</li>
              <li>▸ The sample dataset already uses an ML-friendly tabular schema (features + label) and is downloadable as CSV.</li>
              <li>▸ A Python FastAPI reference service is included so a scikit-learn model can be served without changing the frontend.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="architecture" className="scroll-mt-24">
        <Heading eyebrow="10 · Architecture" title="Simple, SIH-friendly architecture" />
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <pre className="min-w-[640px] text-[11px] leading-relaxed text-slate-300">{`┌──────────────────────────────────────────────────────────────────────────┐
│  FRONTEND  ·  Next.js (React) + Tailwind CSS + Leaflet.js/OpenStreetMap  │
│  Dashboard · inputs · gauge + charts · map · warnings · road module      │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  fetch JSON
┌───────────────────────────────▼──────────────────────────────────────────┐
│  BACKEND API  ·  Next.js route handlers (Node runtime)                   │
│   POST /api/assess      → run risk engine + persist assessment           │
│   GET  /api/locations   → NER demo locations scored by the engine        │
│   GET  /api/dataset     → sample dataset as JSON or CSV                  │
│   GET  /api/tests       → runs the 3 mandated engine test cases          │
│   GET  /api/assessments → recent analyses feed   ·  GET /api/health      │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
        ┌───────────────────────┴────────────────────────┐
        ▼                                                ▼
┌────────────────────────────┐              ┌────────────────────────────────┐
│ RISK ENGINE (pure module)  │              │ DATA  ·  PostgreSQL + Drizzle  │
│ src/lib/risk-engine.ts     │              │ locations · road_segments      │
│ python_engine/risk_engine  │              │ landslide_records · assessments│
│ .py  (FastAPI reference)   │              │ seeded from CSV/JSON samples   │
└────────────────────────────┘              └────────────────────────────────┘`}</pre>
        </div>
      </section>

      <section id="limitations" className="scroll-mt-24">
        <Heading
          eyebrow="11 · Limitations"
          title="Honest limitations of this prototype"
          subtitle="Stated up-front so the demonstration remains scientifically and ethically responsible."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-amber-200">What this is NOT</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>▸ NOT an official or operational emergency warning system.</li>
              <li>▸ NOT scientifically validated; thresholds are indicative, chosen from published rainfall-threshold literature patterns and engineering judgement.</li>
              <li>▸ NOT powered by a trained machine-learning model in this release.</li>
              <li>▸ NOT using live sensors, satellite feeds or real-time weather APIs.</li>
              <li>▸ NOT detecting real road damage — road statuses are demo values.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Known gaps &amp; next steps</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>▸ Integrate IMD / OpenWeather rainfall APIs and IoT soil-moisture + tilt sensors.</li>
              <li>▸ Replace static slope/elevation with DEM-derived values (SRTM / Cartosat).</li>
              <li>▸ Add antecedent-rainfall accumulation windows instead of a single 24 h value.</li>
              <li>▸ Add SMS / IVR / multilingual push alerts for low-connectivity hill areas.</li>
              <li>▸ Field-validate thresholds with GSI and state disaster-management authorities.</li>
              <li>▸ Add authentication and role-based dashboards for district control rooms.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="run" className="scroll-mt-24">
        <Heading eyebrow="12 · Run it locally" title="How to run this prototype" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Web app (frontend + backend + DB)</h3>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-relaxed text-emerald-300">{`# 1. install dependencies
npm install

# 2. point .env at your PostgreSQL instance
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# 3. create the tables (Drizzle)
npx drizzle-kit push

# 4. run it (tables + demo data seed automatically)
npm run dev      # http://localhost:3000
npm run build && npm start   # production`}</pre>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Python risk engine (reference service)</h3>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-relaxed text-emerald-300">{`cd python_engine
pip install -r requirements.txt

# run the 3 test cases in pure Python
python risk_engine.py

# or serve the same engine over FastAPI
uvicorn app:app --reload --port 8000
# POST http://localhost:8000/assess`}</pre>
            <p className="mt-2 text-xs text-slate-400">
              The Python module is a line-for-line port of the TypeScript engine, so the scores match exactly. It exists
              so the team can migrate the scoring service to Flask/FastAPI or plug in scikit-learn later.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
