# ⛰ Landslide Guard AI

**AI-Based Early Warning and Landslide Risk Monitoring System for the North-Eastern Region (NER) of India**
Smart India Hackathon 2026 — **working prototype**

> ⚠ **Prototype disclaimer.** This is a college-level working prototype. It uses a **transparent rule-based
> multi-factor scoring engine — NOT a trained machine-learning model**. Outputs are **not scientifically
> validated** and this is **not an official emergency warning system**. All rainfall, soil-moisture, road-status
> and history values shipped with the app are clearly labelled **prototype/demo data**. In a real emergency,
> follow NDMA / SDMA / DDMA / IMD advisories.

---

## 1. What it does (complete working workflow)

```
Input data → Risk analysis → Risk level → Explanation → Map visualisation → Warning → Road advisory
```

| Feature | Status |
| --- | --- |
| Location selection (11 NER sample locations + custom input) | ✅ working |
| Rainfall / soil moisture / slope / elevation / history inputs | ✅ working |
| Server-side risk engine (`POST /api/assess`) | ✅ working |
| 0–100 risk score + LOW / MEDIUM / HIGH classification | ✅ working |
| Explainable "why" — per-factor points, severity and reasons | ✅ working |
| Leaflet.js + OpenStreetMap interactive map (no paid API) | ✅ working |
| Monitoring dashboard + charts (gauge, 7-day trend, distribution) | ✅ working |
| Early warning banner + recommended actions | ✅ working |
| Road connectivity module (Normal / Possible blockage / Blocked) | ✅ working (demo data) |
| Sample NER dataset seeded into PostgreSQL, downloadable as CSV | ✅ working |
| Engine test cases executed live (`GET /api/tests`) | ✅ working |
| Python reference engine + FastAPI service | ✅ included |
| Trained ML model | ❌ **not implemented — future work (documented)** |
| Live sensors / weather APIs / real road detection | ❌ **not implemented — future work (documented)** |

---

## 2. Risk engine (transparent, auditable, easy to tune)

`src/lib/risk-engine.ts` (TypeScript, used by the app) and `python_engine/risk_engine.py`
(identical Python port) score seven factors out of 100:

| Factor | Max points | How it is scored |
| --- | --- | --- |
| Rainfall, last 24 h | 30 | piecewise curve `0mm→0`, `20→6`, `50→14`, `100→22`, `200→30` |
| Soil moisture | 25 | `20%→0`, `40→5`, `60→11`, `80→19`, `100→25` |
| Slope angle | 20 | `0°→0`, `10→2`, `20→7`, `30→13`, `45→19`, `90→20` |
| Previous landslide history | 12 | `Yes → 12`, `No → 0` |
| Elevation / relief | 8 | `0m→0`, `300→1`, `800→3`, `1500→6`, `3000→8` |
| Terrain susceptibility (zone) | 5 | zone factor `0..1 × 5` |
| Compound trigger bonus | 5 | `+5` when rainfall ≥ 100 mm **and** soil moisture ≥ 75 % |

**Classification thresholds** (single place to edit — `RISK_THRESHOLDS`):

```
LOW     score <  35
MEDIUM  35 ≤ score < 65
HIGH    score ≥ 65
```

---

## 3. Architecture

```
Frontend : Next.js (React) + Tailwind CSS + Leaflet.js / OpenStreetMap
Backend  : Next.js route handlers (Node)  ·  Python FastAPI reference service included
Engine   : pure rule-based module (TS + identical Python port)
Data     : PostgreSQL via Drizzle ORM, auto-seeded from the sample CSV/JSON dataset
```

### Folder structure

```
src/
  app/
    page.tsx                  # full SIH dashboard page (server component)
    layout.tsx, globals.css
    api/
      assess/route.ts         # POST – run the risk engine + persist result
      locations/route.ts      # GET  – NER demo locations scored by the engine
      dataset/route.ts        # GET  – sample dataset (JSON or ?format=csv)
      assessments/route.ts    # GET  – recent analyses feed
      tests/route.ts          # GET  – runs the 3 mandated engine test cases
      health/route.ts         # GET  – health probe
  components/
    Dashboard.tsx             # interactive client dashboard
    RiskMap.tsx               # Leaflet + OpenStreetMap map
    Charts.tsx                # SVG gauge / trend / distribution / factor bars
    StaticSections.tsx        # Problem, Solution, How It Works, Future AI/ML, Limitations
  lib/
    risk-engine.ts            # ⭐ the risk engine + test cases
    ner-data.ts               # prototype/demo dataset (locations, roads, records)
    monitoring.ts             # scores every location with the engine
    store.ts                  # DB bootstrap + seeding + queries (with safe fallback)
    types.ts
  db/
    schema.ts                 # Drizzle tables
    index.ts                  # pg pool + drizzle client
python_engine/
  risk_engine.py              # identical rule engine in Python + test runner
  app.py                      # FastAPI service exposing /assess, /tests, /health
  requirements.txt
data/
  ner_landslide_sample.csv    # sample NER-style dataset (demo data)
```

---

## 4. Run locally

### Web application (frontend + backend + database)

```bash
# 1. install
npm install

# 2. configure the database in .env
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db' > .env

# 3. create tables (Drizzle)
npx drizzle-kit push

# 4. run
npm run dev                 # http://localhost:3000
# or
npm run build && npm start
```

Tables are also created and seeded automatically on first request, so the app still works if you skip step 3.
If PostgreSQL is unreachable the app falls back to the in-code demo dataset so the demo never breaks.

### Python risk engine (reference / future ML service)

```bash
cd python_engine
pip install -r requirements.txt

python risk_engine.py                      # runs the 3 test cases in the terminal
uvicorn app:app --reload --port 8000       # POST http://localhost:8000/assess
```

---

## 5. Test cases

Run them from the UI (**Data & Tests → Run tests**), from the API (`GET /api/tests`)
or in Python (`python python_engine/risk_engine.py`).

| # | Scenario | Inputs | Expected | Engine output |
| --- | --- | --- | --- | --- |
| 1 | Low rainfall + low soil moisture + gentle slope | 5 mm, 25 %, 8°, 300 m, no history | LOW | **LOW (7/100)** |
| 2 | Moderate rainfall + moderate soil moisture + moderate slope | 60 mm, 55 %, 25°, 1200 m, no history | MEDIUM | **MEDIUM (42/100)** |
| 3 | Heavy rainfall + high soil moisture + steep slope + previous landslide | 180 mm, 88 %, 42°, 1400 m, history yes | HIGH | **HIGH (94/100)** |

---

## 6. API quick reference

```bash
# analyse a custom location
curl -X POST http://localhost:3000/api/assess \
  -H 'content-type: application/json' \
  -d '{"location":"Aizawl","rainfall":180,"soilMoisture":88,"slope":42,"elevation":1400,"previousLandslide":true}'

curl http://localhost:3000/api/locations       # all demo locations + risk + roads
curl http://localhost:3000/api/dataset          # sample dataset (JSON)
curl http://localhost:3000/api/dataset?format=csv
curl http://localhost:3000/api/tests            # 3 mandated test cases
curl http://localhost:3000/api/health
```

---

## 7. Future AI/ML integration (not implemented yet)

The scoring layer is a single pure function behind a stable API contract, so it can be replaced by a model:

1. Build a labelled dataset from GSI / NRSC-Bhuvan / NDMA / state DDMA landslide inventories plus IMD rainfall
   and satellite soil-moisture products.
2. Engineer features: antecedent rainfall (3/7/15-day), intensity–duration, NDVI, lithology, land-use change,
   slope aspect, distance to road cut.
3. Train and compare **Random Forest**, **Decision Tree**, Gradient Boosting/XGBoost, Logistic Regression, SVM.
4. Validate with stratified k-fold CV; report precision / recall / F1 / ROC-AUC, prioritising recall for HIGH risk.
5. Keep explainability (SHAP / feature importance) and keep the rule engine as a fallback and drift check.

Every analysis performed in the app is stored in the `assessments` table — the seed of a future training set.

---

## 8. Limitations

* Not an official or operational warning system; thresholds are indicative, not field-validated.
* No trained ML model, no live sensors, no weather API, no real-time road-damage detection in this release.
* Slope/elevation values are static demo values rather than DEM-derived per-pixel terrain analysis.
* Single 24 h rainfall value instead of antecedent-rainfall accumulation windows.
* No authentication or role-based access for district control rooms yet.

Map data © OpenStreetMap contributors. No paid mapping APIs are used.
