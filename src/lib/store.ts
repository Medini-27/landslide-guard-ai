import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { assessments, landslideRecords, locations, roadSegments } from "@/db/schema";
import { SEED_LOCATIONS, SEED_RECORDS, SEED_ROADS, type SeedLocation } from "@/lib/ner-data";
import type { RiskResult } from "@/lib/risk-engine";

export interface MonitoredLocation extends SeedLocation {
  id: number;
}

export interface RoadStatus {
  id: number;
  locationSlug: string;
  name: string;
  status: string;
  detail: string;
  alternateRoute: string;
}

export interface DatasetRow {
  id: number;
  locationName: string;
  state: string;
  observedOn: string;
  rainfall: number;
  soilMoisture: number;
  slope: number;
  elevation: number;
  previousLandslide: boolean;
  riskLevel: string;
}

export interface AssessmentRow {
  id: number;
  locationName: string;
  state: string;
  riskScore: number;
  riskLevel: string;
  rainfall: number;
  soilMoisture: number;
  createdAt: string;
}

let bootstrapPromise: Promise<boolean> | null = null;

/**
 * Creates the tables if they do not exist and inserts the prototype dataset
 * exactly once. Safe to call from every request (memoised per server process).
 */
export async function ensureDatabase(): Promise<boolean> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap().catch((error) => {
      console.error("[landslide-guard] database bootstrap failed:", error);
      bootstrapPromise = null;
      return false;
    });
  }
  return bootstrapPromise;
}

async function bootstrap(): Promise<boolean> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS locations (
      id serial PRIMARY KEY,
      slug varchar(96) NOT NULL UNIQUE,
      name varchar(128) NOT NULL,
      state varchar(96) NOT NULL,
      latitude double precision NOT NULL,
      longitude double precision NOT NULL,
      elevation double precision NOT NULL,
      slope double precision NOT NULL,
      terrain_susceptibility double precision NOT NULL DEFAULT 0.5,
      previous_landslide boolean NOT NULL DEFAULT false,
      current_rainfall double precision NOT NULL DEFAULT 0,
      current_soil_moisture double precision NOT NULL DEFAULT 0,
      notes text NOT NULL DEFAULT ''
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS road_segments (
      id serial PRIMARY KEY,
      location_slug varchar(96) NOT NULL,
      name varchar(160) NOT NULL,
      status varchar(32) NOT NULL DEFAULT 'normal',
      detail text NOT NULL DEFAULT '',
      alternate_route text NOT NULL DEFAULT '',
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS landslide_records (
      id serial PRIMARY KEY,
      location_name varchar(160) NOT NULL,
      state varchar(96) NOT NULL,
      observed_on varchar(32) NOT NULL,
      rainfall double precision NOT NULL,
      soil_moisture double precision NOT NULL,
      slope double precision NOT NULL,
      elevation double precision NOT NULL,
      previous_landslide boolean NOT NULL,
      risk_level varchar(16) NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS assessments (
      id serial PRIMARY KEY,
      location_name varchar(160) NOT NULL,
      state varchar(96) NOT NULL DEFAULT '',
      latitude double precision,
      longitude double precision,
      rainfall double precision NOT NULL,
      soil_moisture double precision NOT NULL,
      slope double precision NOT NULL,
      elevation double precision NOT NULL,
      previous_landslide boolean NOT NULL,
      risk_score integer NOT NULL,
      risk_level varchar(16) NOT NULL,
      factors jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const existingLocations = await db.select({ id: locations.id }).from(locations).limit(1);
  if (existingLocations.length === 0) {
    await db.insert(locations).values(SEED_LOCATIONS).onConflictDoNothing();
  }

  const existingRoads = await db.select({ id: roadSegments.id }).from(roadSegments).limit(1);
  if (existingRoads.length === 0) {
    await db.insert(roadSegments).values(SEED_ROADS);
  }

  const existingRecords = await db.select({ id: landslideRecords.id }).from(landslideRecords).limit(1);
  if (existingRecords.length === 0) {
    await db.insert(landslideRecords).values(SEED_RECORDS);
  }

  return true;
}

/** Locations — falls back to the in-code demo dataset if the DB is unreachable. */
export async function getLocations(): Promise<MonitoredLocation[]> {
  const ok = await ensureDatabase();
  if (!ok) return SEED_LOCATIONS.map((loc, index) => ({ ...loc, id: index + 1 }));
  try {
    const rows = await db.select().from(locations).orderBy(locations.name);
    if (rows.length === 0) return SEED_LOCATIONS.map((loc, index) => ({ ...loc, id: index + 1 }));
    return rows as MonitoredLocation[];
  } catch (error) {
    console.error("[landslide-guard] getLocations failed:", error);
    return SEED_LOCATIONS.map((loc, index) => ({ ...loc, id: index + 1 }));
  }
}

export async function getRoads(): Promise<RoadStatus[]> {
  const ok = await ensureDatabase();
  if (!ok) return SEED_ROADS.map((road, index) => ({ ...road, id: index + 1 }));
  try {
    const rows = await db
      .select({
        id: roadSegments.id,
        locationSlug: roadSegments.locationSlug,
        name: roadSegments.name,
        status: roadSegments.status,
        detail: roadSegments.detail,
        alternateRoute: roadSegments.alternateRoute,
      })
      .from(roadSegments)
      .orderBy(roadSegments.id);
    if (rows.length === 0) return SEED_ROADS.map((road, index) => ({ ...road, id: index + 1 }));
    return rows;
  } catch (error) {
    console.error("[landslide-guard] getRoads failed:", error);
    return SEED_ROADS.map((road, index) => ({ ...road, id: index + 1 }));
  }
}

export async function getDataset(): Promise<DatasetRow[]> {
  const ok = await ensureDatabase();
  if (!ok) return SEED_RECORDS.map((row, index) => ({ ...row, id: index + 1 }));
  try {
    const rows = await db.select().from(landslideRecords).orderBy(landslideRecords.id);
    if (rows.length === 0) return SEED_RECORDS.map((row, index) => ({ ...row, id: index + 1 }));
    return rows as DatasetRow[];
  } catch (error) {
    console.error("[landslide-guard] getDataset failed:", error);
    return SEED_RECORDS.map((row, index) => ({ ...row, id: index + 1 }));
  }
}

export async function saveAssessment(result: RiskResult, input: {
  rainfall: number;
  soilMoisture: number;
  slope: number;
  elevation: number;
  previousLandslide: boolean;
}): Promise<void> {
  const ok = await ensureDatabase();
  if (!ok) return;
  try {
    await db.insert(assessments).values({
      locationName: result.location,
      state: result.state ?? "",
      latitude: result.latitude,
      longitude: result.longitude,
      rainfall: input.rainfall,
      soilMoisture: input.soilMoisture,
      slope: input.slope,
      elevation: input.elevation,
      previousLandslide: input.previousLandslide,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      factors: result.factors,
    });
  } catch (error) {
    console.error("[landslide-guard] saveAssessment failed:", error);
  }
}

export async function getRecentAssessments(limit = 8): Promise<AssessmentRow[]> {
  const ok = await ensureDatabase();
  if (!ok) return [];
  try {
    const rows = await db
      .select({
        id: assessments.id,
        locationName: assessments.locationName,
        state: assessments.state,
        riskScore: assessments.riskScore,
        riskLevel: assessments.riskLevel,
        rainfall: assessments.rainfall,
        soilMoisture: assessments.soilMoisture,
        createdAt: assessments.createdAt,
      })
      .from(assessments)
      .orderBy(desc(assessments.createdAt))
      .limit(limit);
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  } catch (error) {
    console.error("[landslide-guard] getRecentAssessments failed:", error);
    return [];
  }
}

export async function getLocationBySlug(slug: string): Promise<MonitoredLocation | null> {
  const all = await getLocations();
  return all.find((loc) => loc.slug === slug) ?? null;
}

export async function countRows(): Promise<{ locations: number; roads: number; records: number }> {
  const ok = await ensureDatabase();
  if (!ok) return { locations: SEED_LOCATIONS.length, roads: SEED_ROADS.length, records: SEED_RECORDS.length };
  try {
    const [loc] = await db.select({ value: sql<number>`count(*)::int` }).from(locations);
    const [road] = await db.select({ value: sql<number>`count(*)::int` }).from(roadSegments);
    const [rec] = await db.select({ value: sql<number>`count(*)::int` }).from(landslideRecords);
    return { locations: loc?.value ?? 0, roads: road?.value ?? 0, records: rec?.value ?? 0 };
  } catch {
    return { locations: SEED_LOCATIONS.length, roads: SEED_ROADS.length, records: SEED_RECORDS.length };
  }
}

export { eq };
