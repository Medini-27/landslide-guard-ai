import { NextResponse } from "next/server";
import { getEnrichedLocations } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

/** Returns every monitored demo location with its current rule-engine risk. */
export async function GET() {
  const locations = await getEnrichedLocations();
  return NextResponse.json({
    ok: true,
    dataNote: "Prototype/demo data — not a live sensor or weather feed.",
    count: locations.length,
    locations,
  });
}
