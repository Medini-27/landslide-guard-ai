import { NextResponse } from "next/server";
import { getRecentAssessments } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Recent analyses performed by users, newest first (monitoring feed). */
export async function GET() {
  const rows = await getRecentAssessments(10);
  return NextResponse.json({ ok: true, count: rows.length, assessments: rows });
}
