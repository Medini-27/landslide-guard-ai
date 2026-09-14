"""
Optional FastAPI wrapper around the Python reference risk engine.

    pip install -r requirements.txt
    uvicorn app:app --reload --port 8000

Endpoints
    GET  /health          -> service check
    GET  /tests           -> runs the three mandated engine test cases
    POST /assess          -> body: {location, rainfall, soil_moisture, slope,
                                    elevation, previous_landslide,
                                    terrain_susceptibility}

The Next.js app ships with the same engine in TypeScript, so the web
prototype runs without Python. This service is provided so the scoring
layer can be migrated to Python (Flask/FastAPI) or replaced by a trained
scikit-learn model without touching the frontend contract.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from risk_engine import TEST_CASES, assess_risk

app = FastAPI(
    title="Landslide Guard AI — Risk Engine",
    description="Transparent rule-based landslide risk scoring for the NER (prototype, not a trained ML model).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AssessRequest(BaseModel):
    location: str = Field(default="Unnamed location")
    rainfall: float = Field(default=0, ge=0, description="Rainfall in mm over the last 24 hours")
    soil_moisture: float = Field(default=0, ge=0, le=100, description="Soil moisture %")
    slope: float = Field(default=0, ge=0, le=90, description="Slope angle in degrees")
    elevation: float = Field(default=0, ge=0, description="Elevation in metres")
    previous_landslide: bool = False
    terrain_susceptibility: float = Field(default=0.5, ge=0, le=1)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "engine": "rule-based-multi-factor-v1 (not a trained ML model)"}


@app.post("/assess")
def assess(payload: AssessRequest) -> dict:
    result = assess_risk(**payload.model_dump())
    return {"ok": True, "result": result.to_dict()}


@app.get("/tests")
def tests() -> dict:
    results = []
    for case in TEST_CASES:
        out = assess_risk(**case["input"])
        results.append({
            "id": case["id"],
            "name": case["name"],
            "expected": case["expected"],
            "actual": out.risk_level,
            "score": out.risk_score,
            "passed": out.risk_level == case["expected"],
            "reasons": out.reasons,
        })
    return {"ok": all(r["passed"] for r in results), "results": results}
