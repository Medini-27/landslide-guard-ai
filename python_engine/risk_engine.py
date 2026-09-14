"""
Landslide Guard AI — Rule-Based Multi-Factor Risk Engine (Python reference)
===========================================================================
This module is a line-for-line port of `src/lib/risk-engine.ts`. Given the
same inputs it produces the SAME score and the SAME LOW/MEDIUM/HIGH label.

It exists so the team can:
  * run / tune / unit-test the scoring logic in pure Python,
  * serve it from Flask or FastAPI (see app.py) instead of the Node backend,
  * later swap the rule engine for a trained scikit-learn model
    (RandomForestClassifier, DecisionTreeClassifier, ...) behind the same
    `assess_risk()` function signature.

IMPORTANT: this is a transparent rule-based engine. No machine-learning
model has been trained for this prototype and none is being used.

Run `python risk_engine.py` to execute the three mandated test cases.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Dict, List, Sequence, Tuple

# --------------------------- TUNABLE CONFIGURATION ---------------------------

RISK_THRESHOLDS = {
    "MEDIUM_MIN": 35,  # score < 35              -> LOW
    "HIGH_MIN": 65,    # score >= 65             -> HIGH
}

FACTOR_WEIGHTS = {
    "rainfall": 30,
    "soil_moisture": 25,
    "slope": 20,
    "previous_landslide": 12,
    "elevation": 8,
    "terrain": 5,
    "compound_bonus": 5,
}

RAINFALL_CURVE: Sequence[Tuple[float, float]] = ((0, 0), (20, 6), (50, 14), (100, 22), (200, 30))
SOIL_MOISTURE_CURVE: Sequence[Tuple[float, float]] = ((20, 0), (40, 5), (60, 11), (80, 19), (100, 25))
SLOPE_CURVE: Sequence[Tuple[float, float]] = ((0, 0), (10, 2), (20, 7), (30, 13), (45, 19), (90, 20))
ELEVATION_CURVE: Sequence[Tuple[float, float]] = ((0, 0), (300, 1), (800, 3), (1500, 6), (3000, 8))

COMPOUND_RULE = {"rainfall_mm": 100, "soil_moisture_pct": 75, "bonus": 5}

RECOMMENDED_ACTIONS: Dict[str, List[str]] = {
    "HIGH": [
        "Move to a safer location if instructed by authorities",
        "Avoid steep slopes and vulnerable roads",
        "Avoid unnecessary travel in high-risk areas",
        "Follow official emergency instructions (SDMA / DDMA / local administration)",
        "Keep emergency contacts, torch, documents and a go-bag ready",
    ],
    "MEDIUM": [
        "Monitor local rainfall and official weather bulletins",
        "Avoid camping, parking or halting directly below cut-slopes",
        "Report new cracks, tilting trees, seepage or bulging walls to local authorities",
        "Plan an alternate route before travelling through hill sections",
    ],
    "LOW": [
        "No action needed — continue routine monitoring",
        "Keep hillside drains and culverts clear before the monsoon",
        "Stay subscribed to district disaster-management alerts",
    ],
}

HEADLINES = {
    "HIGH": "\u26a0 HIGH LANDSLIDE RISK — Immediate precautionary action is recommended.",
    "MEDIUM": "\u25d0 MEDIUM LANDSLIDE RISK — Stay alert and keep monitoring conditions.",
    "LOW": "\u2713 LOW LANDSLIDE RISK — Conditions are currently normal.",
}


# --------------------------------- HELPERS ---------------------------------

def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def curve_score(value: float, curve: Sequence[Tuple[float, float]]) -> float:
    """Piecewise-linear interpolation across a breakpoint table."""
    if value <= curve[0][0]:
        return curve[0][1]
    if value >= curve[-1][0]:
        return curve[-1][1]
    for (x1, y1), (x2, y2) in zip(curve, curve[1:]):
        if x1 <= value <= x2:
            ratio = (value - x1) / (x2 - x1)
            return y1 + ratio * (y2 - y1)
    return curve[-1][1]


def severity_from_ratio(ratio: float) -> str:
    if ratio >= 0.75:
        return "severe"
    if ratio >= 0.5:
        return "high"
    if ratio >= 0.25:
        return "moderate"
    return "low"


def classify(score: float) -> str:
    if score >= RISK_THRESHOLDS["HIGH_MIN"]:
        return "HIGH"
    if score >= RISK_THRESHOLDS["MEDIUM_MIN"]:
        return "MEDIUM"
    return "LOW"


@dataclass
class Factor:
    key: str
    label: str
    value: str
    points: float
    max_points: float
    severity: str
    reason: str
    contributing: bool


@dataclass
class RiskResult:
    location: str
    risk_score: int
    risk_level: str
    headline: str
    summary: str
    reasons: List[str]
    recommended_actions: List[str]
    factors: List[Factor] = field(default_factory=list)
    thresholds: Dict[str, int] = field(default_factory=lambda: dict(RISK_THRESHOLDS))
    engine: str = "rule-based-multi-factor-v1 (not a trained ML model)"
    computed_at: str = ""

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["factors"] = [asdict(f) for f in self.factors]
        return payload


# ---------------------------------- ENGINE ----------------------------------

def assess_risk(
    location: str = "Unnamed location",
    rainfall: float = 0.0,
    soil_moisture: float = 0.0,
    slope: float = 0.0,
    elevation: float = 0.0,
    previous_landslide: bool = False,
    terrain_susceptibility: float = 0.5,
) -> RiskResult:
    rainfall = clamp(float(rainfall or 0), 0, 1000)
    soil_moisture = clamp(float(soil_moisture or 0), 0, 100)
    slope = clamp(float(slope or 0), 0, 90)
    elevation = clamp(float(elevation or 0), 0, 9000)
    terrain_susceptibility = clamp(float(terrain_susceptibility if terrain_susceptibility is not None else 0.5), 0, 1)
    previous_landslide = bool(previous_landslide)

    factors: List[Factor] = []

    # 1. Rainfall
    rain_pts = curve_score(rainfall, RAINFALL_CURVE)
    factors.append(Factor(
        "rainfall", "Rainfall (last 24 h)", f"{round(rainfall, 1)} mm", round(rain_pts, 1),
        FACTOR_WEIGHTS["rainfall"], severity_from_ratio(rain_pts / FACTOR_WEIGHTS["rainfall"]),
        "Extremely heavy rainfall (>200 mm/24 h) — a dominant landslide trigger in the NER monsoon" if rainfall >= 200
        else "Heavy rainfall detected (>100 mm/24 h) — strong slope-failure trigger" if rainfall >= 100
        else "Moderate to heavy rainfall (50–100 mm/24 h) increases pore-water pressure" if rainfall >= 50
        else "Light to moderate rainfall recorded — limited additional loading" if rainfall >= 20
        else "Rainfall is low — little rainfall-driven triggering",
        rainfall >= 50,
    ))

    # 2. Soil moisture
    soil_pts = curve_score(soil_moisture, SOIL_MOISTURE_CURVE)
    factors.append(Factor(
        "soilMoisture", "Soil moisture", f"{round(soil_moisture, 1)} %", round(soil_pts, 1),
        FACTOR_WEIGHTS["soil_moisture"], severity_from_ratio(soil_pts / FACTOR_WEIGHTS["soil_moisture"]),
        "Soil is near saturation — shear strength is significantly reduced" if soil_moisture >= 85
        else "High soil moisture — slope material is heavy and weakly bonded" if soil_moisture >= 70
        else "Moderate soil moisture — watch for further infiltration" if soil_moisture >= 50
        else "Soil moisture is within a safe range",
        soil_moisture >= 70,
    ))

    # 3. Slope
    slope_pts = curve_score(slope, SLOPE_CURVE)
    factors.append(Factor(
        "slope", "Slope angle", f"{round(slope, 1)}°", round(slope_pts, 1),
        FACTOR_WEIGHTS["slope"], severity_from_ratio(slope_pts / FACTOR_WEIGHTS["slope"]),
        "Very steep slope (≥40°) — gravity-driven failure potential is high" if slope >= 40
        else "Steep slope (30–40°) — common failure band for NER hill cuttings" if slope >= 30
        else "Moderately steep slope (20–30°)" if slope >= 20
        else "Gentle slope — low gravitational driving force",
        slope >= 30,
    ))

    # 4. Previous landslide history
    history_pts = FACTOR_WEIGHTS["previous_landslide"] if previous_landslide else 0
    factors.append(Factor(
        "previousLandslide", "Previous landslide history", "Yes" if previous_landslide else "No",
        history_pts, FACTOR_WEIGHTS["previous_landslide"], "severe" if previous_landslide else "low",
        "Previous landslide reported in this area — disturbed, weakened slope material" if previous_landslide
        else "No recorded landslide history for this area in the demo dataset",
        previous_landslide,
    ))

    # 5. Elevation / relief
    elev_pts = curve_score(elevation, ELEVATION_CURVE)
    factors.append(Factor(
        "elevation", "Elevation", f"{round(elevation)} m", round(elev_pts, 1),
        FACTOR_WEIGHTS["elevation"], severity_from_ratio(elev_pts / FACTOR_WEIGHTS["elevation"]),
        "High-elevation terrain — high relief energy and intense orographic rainfall" if elevation >= 1500
        else "Mid-hill elevation typical of NER landslide belts" if elevation >= 800
        else "Low elevation — limited relief energy",
        elevation >= 1200,
    ))

    # 6. Terrain susceptibility
    terrain_pts = terrain_susceptibility * FACTOR_WEIGHTS["terrain"]
    factors.append(Factor(
        "terrain", "Terrain susceptibility (zone)", f"{round(terrain_susceptibility * 100)} / 100",
        round(terrain_pts, 1), FACTOR_WEIGHTS["terrain"], severity_from_ratio(terrain_susceptibility),
        "Zone sits in weak, highly weathered / fractured rock with heavy hill-cutting" if terrain_susceptibility >= 0.75
        else "Zone has moderately susceptible soil and rock conditions" if terrain_susceptibility >= 0.5
        else "Zone geology is comparatively stable in the demo dataset",
        terrain_susceptibility >= 0.75,
    ))

    # 7. Compound amplifier
    compound = rainfall >= COMPOUND_RULE["rainfall_mm"] and soil_moisture >= COMPOUND_RULE["soil_moisture_pct"]
    compound_pts = COMPOUND_RULE["bonus"] if compound else 0
    factors.append(Factor(
        "compound", "Compound trigger (rain on saturated soil)", "Triggered" if compound else "Not triggered",
        compound_pts, FACTOR_WEIGHTS["compound_bonus"], "severe" if compound else "low",
        (f"Heavy rain (≥{COMPOUND_RULE['rainfall_mm']} mm) falling on already-saturated soil "
         f"(≥{COMPOUND_RULE['soil_moisture_pct']}%) — highest-danger combination") if compound
        else "Rainfall and soil saturation are not simultaneously critical",
        compound,
    ))

    raw = rain_pts + soil_pts + slope_pts + history_pts + elev_pts + terrain_pts + compound_pts
    score = int(round(clamp(raw, 0, 100)))
    level = classify(score)

    reasons = [f.reason for f in sorted(factors, key=lambda f: -f.points) if f.contributing]
    if not reasons:
        reasons = ["All monitored parameters are currently within low-risk ranges"]

    if level == "HIGH":
        summary = (f"Multiple critical thresholds were crossed for {location}. The combined score of {score}/100 is at "
                   f"or above the HIGH threshold ({RISK_THRESHOLDS['HIGH_MIN']}).")
    elif level == "MEDIUM":
        summary = (f"Conditions at {location} are elevated but not critical. The score of {score}/100 falls in the "
                   f"advisory band ({RISK_THRESHOLDS['MEDIUM_MIN']}–{RISK_THRESHOLDS['HIGH_MIN'] - 1}).")
    else:
        summary = (f"Conditions at {location} are stable. The score of {score}/100 is below the advisory threshold "
                   f"({RISK_THRESHOLDS['MEDIUM_MIN']}).")

    return RiskResult(
        location=location,
        risk_score=score,
        risk_level=level,
        headline=HEADLINES[level],
        summary=summary,
        reasons=reasons,
        recommended_actions=RECOMMENDED_ACTIONS[level],
        factors=factors,
        computed_at=datetime.now(timezone.utc).isoformat(),
    )


# -------------------------------- TEST CASES --------------------------------

TEST_CASES = [
    {
        "id": 1,
        "name": "Low rainfall + low soil moisture + gentle slope",
        "expected": "LOW",
        "input": dict(location="Agartala, Tripura (test)", rainfall=5, soil_moisture=25, slope=8,
                      elevation=300, previous_landslide=False, terrain_susceptibility=0.3),
    },
    {
        "id": 2,
        "name": "Moderate rainfall + moderate soil moisture + moderate slope",
        "expected": "MEDIUM",
        "input": dict(location="Shillong, Meghalaya (test)", rainfall=60, soil_moisture=55, slope=25,
                      elevation=1200, previous_landslide=False, terrain_susceptibility=0.5),
    },
    {
        "id": 3,
        "name": "Heavy rainfall + high soil moisture + steep slope + previous landslide",
        "expected": "HIGH",
        "input": dict(location="Aizawl, Mizoram (test)", rainfall=180, soil_moisture=88, slope=42,
                      elevation=1400, previous_landslide=True, terrain_susceptibility=0.8),
    },
]


def run_tests() -> bool:
    print("Landslide Guard AI — rule engine test cases\n" + "=" * 52)
    all_passed = True
    for case in TEST_CASES:
        result = assess_risk(**case["input"])
        passed = result.risk_level == case["expected"]
        all_passed = all_passed and passed
        print(f"\nTest {case['id']}: {case['name']}")
        print(f"  input    : {case['input']}")
        print(f"  expected : {case['expected']}")
        print(f"  actual   : {result.risk_level}  (score {result.risk_score}/100)")
        print(f"  reasons  : {'; '.join(result.reasons)}")
        print(f"  result   : {'PASS ✅' if passed else 'FAIL ❌'}")
    print("\n" + "=" * 52)
    print("ALL TESTS PASSED ✅" if all_passed else "SOME TESTS FAILED ❌")
    return all_passed


if __name__ == "__main__":
    raise SystemExit(0 if run_tests() else 1)
