import { NextResponse } from "next/server";
import { RISK_THRESHOLDS, runEngineTests } from "@/lib/risk-engine";

export const dynamic = "force-dynamic";

/** Runs the three mandated engine test cases against the live risk engine. */
export async function GET() {
  const suite = runEngineTests();
  return NextResponse.json({
    ok: suite.passed === suite.total,
    thresholds: RISK_THRESHOLDS,
    ...suite,
  });
}
