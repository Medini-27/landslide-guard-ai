import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Monitored NER locations (prototype/demo dataset). */
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  state: varchar("state", { length: 96 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  elevation: doublePrecision("elevation").notNull(),
  slope: doublePrecision("slope").notNull(),
  terrainSusceptibility: doublePrecision("terrain_susceptibility").notNull().default(0.5),
  previousLandslide: boolean("previous_landslide").notNull().default(false),
  /** Latest demo telemetry values used to pre-fill the dashboard. */
  currentRainfall: doublePrecision("current_rainfall").notNull().default(0),
  currentSoilMoisture: doublePrecision("current_soil_moisture").notNull().default(0),
  notes: text("notes").notNull().default(""),
});

/** Demo road segments used by the Road Connectivity prototype module. */
export const roadSegments = pgTable("road_segments", {
  id: serial("id").primaryKey(),
  locationSlug: varchar("location_slug", { length: 96 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  /** normal | possible_blockage | blocked */
  status: varchar("status", { length: 32 }).notNull().default("normal"),
  detail: text("detail").notNull().default(""),
  alternateRoute: text("alternate_route").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Sample historical landslide-related records (prototype/demo data). */
export const landslideRecords = pgTable("landslide_records", {
  id: serial("id").primaryKey(),
  locationName: varchar("location_name", { length: 160 }).notNull(),
  state: varchar("state", { length: 96 }).notNull(),
  observedOn: varchar("observed_on", { length: 32 }).notNull(),
  rainfall: doublePrecision("rainfall").notNull(),
  soilMoisture: doublePrecision("soil_moisture").notNull(),
  slope: doublePrecision("slope").notNull(),
  elevation: doublePrecision("elevation").notNull(),
  previousLandslide: boolean("previous_landslide").notNull(),
  riskLevel: varchar("risk_level", { length: 16 }).notNull(),
});

/** Every analysis performed by a user is persisted for the monitoring feed. */
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  locationName: varchar("location_name", { length: 160 }).notNull(),
  state: varchar("state", { length: 96 }).notNull().default(""),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  rainfall: doublePrecision("rainfall").notNull(),
  soilMoisture: doublePrecision("soil_moisture").notNull(),
  slope: doublePrecision("slope").notNull(),
  elevation: doublePrecision("elevation").notNull(),
  previousLandslide: boolean("previous_landslide").notNull(),
  riskScore: integer("risk_score").notNull(),
  riskLevel: varchar("risk_level", { length: 16 }).notNull(),
  factors: jsonb("factors"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
