import { assessRisk } from "@/lib/risk-engine";
import { buildTrend } from "@/lib/ner-data";
import { getLocations, getRoads } from "@/lib/store";
import type { LocationWithRisk } from "@/lib/types";

/**
 * Runs the rule-based risk engine over every monitored demo location so the
 * map, the monitoring dashboard and the API all share one source of truth.
 */
export async function getEnrichedLocations(): Promise<LocationWithRisk[]> {
  const [locations, roads] = await Promise.all([getLocations(), getRoads()]);

  return locations.map((loc) => {
    const result = assessRisk({
      location: loc.name,
      state: loc.state,
      latitude: loc.latitude,
      longitude: loc.longitude,
      rainfall: loc.currentRainfall,
      soilMoisture: loc.currentSoilMoisture,
      slope: loc.slope,
      elevation: loc.elevation,
      previousLandslide: loc.previousLandslide,
      terrainSusceptibility: loc.terrainSusceptibility,
    });

    return {
      ...loc,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      roads: roads.filter((road) => road.locationSlug === loc.slug),
      trend: buildTrend(loc.slug, loc.currentRainfall, loc.currentSoilMoisture),
    };
  });
}
