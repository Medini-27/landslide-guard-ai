/**
 * Landslide Guard AI — Rule-Based Multi-Factor Risk Engine
 * ---------------------------------------------------------
 * This is a TRANSPARENT, DETERMINISTIC scoring engine.
 * It is NOT a trained machine-learning model. Every point awarded can be
 * traced back to a documented threshold table below, which makes the output
 * fully explainable (and easy for judges/reviewers to audit).
 *
 * A line-for-line equivalent Python reference implementation lives in
 * `python_engine/risk_engine.py` so the engine can be lifted into a
 * Flask/FastAPI service or replaced by a trained ML model later.
 *
 * TOTAL SCORE = 100
 *   Rainfall (24h)            ->  0 - 30
 *   Soil moisture             ->  0 - 25
 *   Slope angle               ->  0 - 20
 *   Previous landslide history->  0 - 12
 *   Elevation / relief        ->  0 -  8
 *   Terrain susceptibility    ->  0 -  5
 *   Compound amplifier bonus  ->  0 -  5  (rain + saturated soil together)
 *   (final value clamped to 0 - 100)
 */

/** ---------------- TUNABLE CONFIGURATION (edit freely) ---------------- */

export const RISK_THRESHOLDS = {
  /** score < MEDIUM_MIN  => LOW */
  MEDIUM_MIN: 35,
  /** score >= HIGH_MIN   => HIGH */
  HIGH_MIN: 65,
} as const;

export const FACTOR_WEIGHTS = {
  rainfall: 30,
  soilMoisture: 25,
  slope: 20,
  previousLandslide: 12,
  elevation: 8,
  terrain: 5,
  compoundBonus: 5,
} as const;

/** Piecewise breakpoints: [inputValue, pointsAwarded] — linearly interpolated. */
const RAINFALL_CURVE: Array<[number, number]> = [
  [0, 0],
  [20, 6],
  [50, 14],
  [100, 22],
  [200, 30],
];

const SOIL_MOISTURE_CURVE: Array<[number, number]> = [
  [20, 0],
  [40, 5],
  [60, 11],
  [80, 19],
  [100, 25],
];

const SLOPE_CURVE: Array<[number, number]> = [
  [0, 0],
  [10, 2],
  [20, 7],
  [30, 13],
  [45, 19],
  [90, 20],
];

const ELEVATION_CURVE: Array<[number, number]> = [
  [0, 0],
  [300, 1],
  [800, 3],
  [1500, 6],
  [3000, 8],
];

/** Compound amplifier: intense rain falling on already-saturated soil. */
const COMPOUND_RULE = { rainfallMm: 100, soilMoisturePct: 75, bonus: 5 };

/** ---------------------------- TYPES ---------------------------- */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Severity = "low" | "moderate" | "high" | "severe";

export interface RiskInput {
  location: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  rainfall: number; // mm in the last 24 hours
  soilMoisture: number; // % volumetric saturation
  slope: number; // degrees
  elevation: number; // metres above sea level
  previousLandslide: boolean;
  /** 0..1 geological/terrain susceptibility of the zone (default 0.5) */
  terrainSusceptibility?: number;
}

export interface FactorBreakdown {
  key: string;
  label: string;
  value: string;
  points: number;
  maxPoints: number;
  severity: Severity;
  reason: string;
  /** Shown in the "Reasons" list only when it materially pushes risk up. */
  contributing: boolean;
}

export interface RiskResult {
  location: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  riskScore: number;
  riskLevel: RiskLevel;
  headline: string;
  summary: string;
  factors: FactorBreakdown[];
  reasons: string[];
  recommendedActions: string[];
  thresholds: typeof RISK_THRESHOLDS;
  computedAt: string;
  engine: string;
}

/** ------------------------- CORE HELPERS ------------------------- */

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Linear interpolation across a breakpoint curve. */
function curveScore(value: number, curve: Array<[number, number]>): number {
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let i = 0; i < curve.length - 1; i += 1) {
    const [x1, y1] = curve[i];
    const [x2, y2] = curve[i + 1];
    if (value >= x1 && value <= x2) {
      const ratio = (value - x1) / (x2 - x1);
      return y1 + ratio * (y2 - y1);
    }
  }
  return last[1];
}

function severityFromRatio(ratio: number): Severity {
  if (ratio >= 0.75) return "severe";
  if (ratio >= 0.5) return "high";
  if (ratio >= 0.25) return "moderate";
  return "low";
}

export function classify(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.HIGH_MIN) return "HIGH";
  if (score >= RISK_THRESHOLDS.MEDIUM_MIN) return "MEDIUM";
  return "LOW";
}

export function riskColor(level: RiskLevel): string {
  return level === "HIGH" ? "#ef4444" : level === "MEDIUM" ? "#f59e0b" : "#22c55e";
}

/** ------------------------- THE ENGINE ------------------------- */

export function assessRisk(rawInput: RiskInput): RiskResult {
  const input: Required<Omit<RiskInput, "state" | "latitude" | "longitude">> &
    Pick<RiskInput, "state" | "latitude" | "longitude"> = {
    location: rawInput.location?.trim() || "Unnamed location",
    state: rawInput.state,
    latitude: rawInput.latitude,
    longitude: rawInput.longitude,
    rainfall: clamp(Number(rawInput.rainfall) || 0, 0, 1000),
    soilMoisture: clamp(Number(rawInput.soilMoisture) || 0, 0, 100),
    slope: clamp(Number(rawInput.slope) || 0, 0, 90),
    elevation: clamp(Number(rawInput.elevation) || 0, 0, 9000),
    previousLandslide: Boolean(rawInput.previousLandslide),
    terrainSusceptibility: clamp(
      rawInput.terrainSusceptibility === undefined ? 0.5 : Number(rawInput.terrainSusceptibility),
      0,
      1,
    ),
  };

  const factors: FactorBreakdown[] = [];

  /* 1. RAINFALL ------------------------------------------------- */
  const rainPoints = curveScore(input.rainfall, RAINFALL_CURVE);
  factors.push({
    key: "rainfall",
    label: "Rainfall (last 24 h)",
    value: `${round1(input.rainfall)} mm`,
    points: round1(rainPoints),
    maxPoints: FACTOR_WEIGHTS.rainfall,
    severity: severityFromRatio(rainPoints / FACTOR_WEIGHTS.rainfall),
    reason:
      input.rainfall >= 200
        ? "Extremely heavy rainfall (>200 mm/24 h) — a dominant landslide trigger in the NER monsoon"
        : input.rainfall >= 100
          ? "Heavy rainfall detected (>100 mm/24 h) — strong slope-failure trigger"
          : input.rainfall >= 50
            ? "Moderate to heavy rainfall (50–100 mm/24 h) increases pore-water pressure"
            : input.rainfall >= 20
              ? "Light to moderate rainfall recorded — limited additional loading"
              : "Rainfall is low — little rainfall-driven triggering",
    contributing: input.rainfall >= 50,
  });

  /* 2. SOIL MOISTURE -------------------------------------------- */
  const soilPoints = curveScore(input.soilMoisture, SOIL_MOISTURE_CURVE);
  factors.push({
    key: "soilMoisture",
    label: "Soil moisture",
    value: `${round1(input.soilMoisture)} %`,
    points: round1(soilPoints),
    maxPoints: FACTOR_WEIGHTS.soilMoisture,
    severity: severityFromRatio(soilPoints / FACTOR_WEIGHTS.soilMoisture),
    reason:
      input.soilMoisture >= 85
        ? "Soil is near saturation — shear strength is significantly reduced"
        : input.soilMoisture >= 70
          ? "High soil moisture — slope material is heavy and weakly bonded"
          : input.soilMoisture >= 50
            ? "Moderate soil moisture — watch for further infiltration"
            : "Soil moisture is within a safe range",
    contributing: input.soilMoisture >= 70,
  });

  /* 3. SLOPE ------------------------------------------------------ */
  const slopePoints = curveScore(input.slope, SLOPE_CURVE);
  factors.push({
    key: "slope",
    label: "Slope angle",
    value: `${round1(input.slope)}°`,
    points: round1(slopePoints),
    maxPoints: FACTOR_WEIGHTS.slope,
    severity: severityFromRatio(slopePoints / FACTOR_WEIGHTS.slope),
    reason:
      input.slope >= 40
        ? "Very steep slope (≥40°) — gravity-driven failure potential is high"
        : input.slope >= 30
          ? "Steep slope (30–40°) — common failure band for NER hill cuttings"
          : input.slope >= 20
            ? "Moderately steep slope (20–30°)"
            : "Gentle slope — low gravitational driving force",
    contributing: input.slope >= 30,
  });

  /* 4. PREVIOUS LANDSLIDE HISTORY -------------------------------- */
  const historyPoints = input.previousLandslide ? FACTOR_WEIGHTS.previousLandslide : 0;
  factors.push({
    key: "previousLandslide",
    label: "Previous landslide history",
    value: input.previousLandslide ? "Yes" : "No",
    points: historyPoints,
    maxPoints: FACTOR_WEIGHTS.previousLandslide,
    severity: input.previousLandslide ? "severe" : "low",
    reason: input.previousLandslide
      ? "Previous landslide reported in this area — disturbed, weakened slope material"
      : "No recorded landslide history for this area in the demo dataset",
    contributing: input.previousLandslide,
  });

  /* 5. ELEVATION / RELIEF ---------------------------------------- */
  const elevationPoints = curveScore(input.elevation, ELEVATION_CURVE);
  factors.push({
    key: "elevation",
    label: "Elevation",
    value: `${Math.round(input.elevation)} m`,
    points: round1(elevationPoints),
    maxPoints: FACTOR_WEIGHTS.elevation,
    severity: severityFromRatio(elevationPoints / FACTOR_WEIGHTS.elevation),
    reason:
      input.elevation >= 1500
        ? "High-elevation terrain — high relief energy and intense orographic rainfall"
        : input.elevation >= 800
          ? "Mid-hill elevation typical of NER landslide belts"
          : "Low elevation — limited relief energy",
    contributing: input.elevation >= 1200,
  });

  /* 6. TERRAIN / GEOLOGICAL SUSCEPTIBILITY ----------------------- */
  const terrainPoints = input.terrainSusceptibility * FACTOR_WEIGHTS.terrain;
  factors.push({
    key: "terrain",
    label: "Terrain susceptibility (zone)",
    value: `${Math.round(input.terrainSusceptibility * 100)} / 100`,
    points: round1(terrainPoints),
    maxPoints: FACTOR_WEIGHTS.terrain,
    severity: severityFromRatio(input.terrainSusceptibility),
    reason:
      input.terrainSusceptibility >= 0.75
        ? "Zone sits in weak, highly weathered / fractured rock with heavy hill-cutting"
        : input.terrainSusceptibility >= 0.5
          ? "Zone has moderately susceptible soil and rock conditions"
          : "Zone geology is comparatively stable in the demo dataset",
    contributing: input.terrainSusceptibility >= 0.75,
  });

  /* 7. COMPOUND AMPLIFIER ---------------------------------------- */
  const compoundTriggered =
    input.rainfall >= COMPOUND_RULE.rainfallMm && input.soilMoisture >= COMPOUND_RULE.soilMoisturePct;
  const compoundPoints = compoundTriggered ? COMPOUND_RULE.bonus : 0;
  factors.push({
    key: "compound",
    label: "Compound trigger (rain on saturated soil)",
    value: compoundTriggered ? "Triggered" : "Not triggered",
    points: compoundPoints,
    maxPoints: FACTOR_WEIGHTS.compoundBonus,
    severity: compoundTriggered ? "severe" : "low",
    reason: compoundTriggered
      ? `Heavy rain (≥${COMPOUND_RULE.rainfallMm} mm) falling on already-saturated soil (≥${COMPOUND_RULE.soilMoisturePct}%) — highest-danger combination`
      : "Rainfall and soil saturation are not simultaneously critical",
    contributing: compoundTriggered,
  });

  const rawScore =
    rainPoints + soilPoints + slopePoints + historyPoints + elevationPoints + terrainPoints + compoundPoints;
  const riskScore = Math.round(clamp(rawScore, 0, 100));
  const riskLevel = classify(riskScore);

  const reasons = factors
    .filter((f) => f.contributing)
    .sort((a, b) => b.points - a.points)
    .map((f) => f.reason);

  if (reasons.length === 0) {
    reasons.push("All monitored parameters are currently within low-risk ranges");
  }

  return {
    location: input.location,
    state: input.state,
    latitude: input.latitude,
    longitude: input.longitude,
    riskScore,
    riskLevel,
    headline: HEADLINES[riskLevel],
    summary: buildSummary(riskLevel, input.location, riskScore),
    factors,
    reasons,
    recommendedActions: RECOMMENDED_ACTIONS[riskLevel],
    thresholds: RISK_THRESHOLDS,
    computedAt: new Date().toISOString(),
    engine: "rule-based-multi-factor-v1 (not a trained ML model)",
  };
}

const HEADLINES: Record<RiskLevel, string> = {
  HIGH: "⚠ HIGH LANDSLIDE RISK — Immediate precautionary action is recommended.",
  MEDIUM: "◐ MEDIUM LANDSLIDE RISK — Stay alert and keep monitoring conditions.",
  LOW: "✓ LOW LANDSLIDE RISK — Conditions are currently normal.",
};

function buildSummary(level: RiskLevel, location: string, score: number): string {
  if (level === "HIGH") {
    return `Multiple critical thresholds were crossed for ${location}. The combined score of ${score}/100 is at or above the HIGH threshold (${RISK_THRESHOLDS.HIGH_MIN}). Treat slopes, cut-roads and hillside settlements as unsafe until conditions improve.`;
  }
  if (level === "MEDIUM") {
    return `Conditions at ${location} are elevated but not critical. The score of ${score}/100 falls in the advisory band (${RISK_THRESHOLDS.MEDIUM_MIN}–${RISK_THRESHOLDS.HIGH_MIN - 1}). Continue monitoring rainfall and soil moisture closely.`;
  }
  return `Conditions at ${location} are stable. The score of ${score}/100 is below the advisory threshold (${RISK_THRESHOLDS.MEDIUM_MIN}). Routine monitoring is sufficient.`;
}

export const RECOMMENDED_ACTIONS: Record<RiskLevel, string[]> = {
  HIGH: [
    "Move to a safer location if instructed by authorities",
    "Avoid steep slopes and vulnerable roads",
    "Avoid unnecessary travel in high-risk areas",
    "Follow official emergency instructions (SDMA / DDMA / local administration)",
    "Keep emergency contacts, torch, documents and a go-bag ready",
  ],
  MEDIUM: [
    "Monitor local rainfall and official weather bulletins",
    "Avoid camping, parking or halting directly below cut-slopes",
    "Report new cracks, tilting trees, seepage or bulging walls to local authorities",
    "Plan an alternate route before travelling through hill sections",
  ],
  LOW: [
    "No action needed — continue routine monitoring",
    "Keep hillside drains and culverts clear before the monsoon",
    "Stay subscribed to district disaster-management alerts",
  ],
};

/** ------------------------- TEST CASES ------------------------- */

export interface EngineTestCase {
  id: number;
  name: string;
  input: RiskInput;
  expected: RiskLevel;
}

export const ENGINE_TEST_CASES: EngineTestCase[] = [
  {
    id: 1,
    name: "Low rainfall + low soil moisture + gentle slope",
    expected: "LOW",
    input: {
      location: "Agartala, Tripura (test)",
      rainfall: 5,
      soilMoisture: 25,
      slope: 8,
      elevation: 300,
      previousLandslide: false,
      terrainSusceptibility: 0.3,
    },
  },
  {
    id: 2,
    name: "Moderate rainfall + moderate soil moisture + moderate slope",
    expected: "MEDIUM",
    input: {
      location: "Shillong, Meghalaya (test)",
      rainfall: 60,
      soilMoisture: 55,
      slope: 25,
      elevation: 1200,
      previousLandslide: false,
      terrainSusceptibility: 0.5,
    },
  },
  {
    id: 3,
    name: "Heavy rainfall + high soil moisture + steep slope + previous landslide",
    expected: "HIGH",
    input: {
      location: "Aizawl, Mizoram (test)",
      rainfall: 180,
      soilMoisture: 88,
      slope: 42,
      elevation: 1400,
      previousLandslide: true,
      terrainSusceptibility: 0.8,
    },
  },
];

export interface TestCaseResult extends EngineTestCase {
  actual: RiskLevel;
  score: number;
  passed: boolean;
  reasons: string[];
}

export function runEngineTests(): { results: TestCaseResult[]; passed: number; total: number } {
  const results = ENGINE_TEST_CASES.map((tc) => {
    const out = assessRisk(tc.input);
    return {
      ...tc,
      actual: out.riskLevel,
      score: out.riskScore,
      passed: out.riskLevel === tc.expected,
      reasons: out.reasons,
    };
  });
  return {
    results,
    passed: results.filter((r) => r.passed).length,
    total: results.length,
  };
}
