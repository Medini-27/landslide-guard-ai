import { NextResponse } from "next/server";
import { assessRisk, type RiskInput } from "@/lib/risk-engine";
import { getLocationBySlug, saveAssessment } from "@/lib/store";

export const dynamic = "force-dynamic";

interface AssessBody extends Partial<RiskInput> {
  slug?: string;
  persist?: boolean;
}

export async function POST(request: Request) {
  let body: AssessBody;
  try {
    body = (await request.json()) as AssessBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const numeric = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === "string" ? Number(value) : (value as number);
    return Number.isFinite(parsed) ? (parsed as number) : fallback;
  };

  // If a known NER location slug is supplied we enrich the input with its
  // stored coordinates + terrain susceptibility from the demo dataset.
  const known = body.slug ? await getLocationBySlug(body.slug) : null;

  const input: RiskInput = {
    location: (body.location ?? known?.name ?? "").trim() || "Custom location",
    state: body.state ?? known?.state,
    latitude: body.latitude ?? known?.latitude,
    longitude: body.longitude ?? known?.longitude,
    rainfall: numeric(body.rainfall),
    soilMoisture: numeric(body.soilMoisture),
    slope: numeric(body.slope),
    elevation: numeric(body.elevation),
    previousLandslide: Boolean(body.previousLandslide),
    terrainSusceptibility:
      body.terrainSusceptibility !== undefined
        ? numeric(body.terrainSusceptibility, 0.5)
        : (known?.terrainSusceptibility ?? 0.5),
  };

  if (input.rainfall < 0 || input.soilMoisture < 0 || input.slope < 0 || input.elevation < 0) {
    return NextResponse.json({ error: "Input values cannot be negative" }, { status: 400 });
  }

  const result = assessRisk(input);

  if (body.persist !== false) {
    await saveAssessment(result, {
      rainfall: input.rainfall,
      soilMoisture: input.soilMoisture,
      slope: input.slope,
      elevation: input.elevation,
      previousLandslide: input.previousLandslide,
    });
  }

  return NextResponse.json({ ok: true, result });
}
