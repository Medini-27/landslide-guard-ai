import { NextResponse } from "next/server";
import { getDataset } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Sample NER landslide dataset (prototype/demo records) as JSON or CSV. */
export async function GET(request: Request) {
  const rows = await getDataset();
  const format = new URL(request.url).searchParams.get("format");

  if (format === "csv") {
    const header = "location,state,observed_on,rainfall_mm,soil_moisture_pct,slope_deg,elevation_m,previous_landslide,risk_level";
    const body = rows
      .map((r) =>
        [
          r.locationName,
          r.state,
          r.observedOn,
          r.rainfall,
          r.soilMoisture,
          r.slope,
          r.elevation,
          r.previousLandslide ? "yes" : "no",
          r.riskLevel,
        ].join(","),
      )
      .join("\n");
    return new NextResponse(`${header}\n${body}\n`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="ner_landslide_sample.csv"',
      },
    });
  }

  return NextResponse.json({
    ok: true,
    dataNote: "Prototype/demo dataset for demonstration only — not validated ground truth.",
    count: rows.length,
    records: rows,
  });
}
