import type { RiskLevel } from "@/lib/risk-engine";

export interface RoadStatusView {
  id: number;
  locationSlug: string;
  name: string;
  status: string;
  detail: string;
  alternateRoute: string;
}

export interface LocationWithRisk {
  id: number;
  slug: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  elevation: number;
  slope: number;
  terrainSusceptibility: number;
  previousLandslide: boolean;
  currentRainfall: number;
  currentSoilMoisture: number;
  notes: string;
  riskScore: number;
  riskLevel: RiskLevel;
  roads: RoadStatusView[];
  trend: Array<{ day: string; rainfall: number; soilMoisture: number }>;
}

export interface DatasetRowView {
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

export interface AssessmentView {
  id: number;
  locationName: string;
  state: string;
  riskScore: number;
  riskLevel: string;
  rainfall: number;
  soilMoisture: number;
  createdAt: string;
}
