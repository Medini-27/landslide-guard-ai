/**
 * PROTOTYPE / DEMO DATA for the North-Eastern Region.
 * ---------------------------------------------------
 * Coordinates and elevations are approximate real-world values.
 * Rainfall, soil-moisture, slope, road status and history flags are
 * SYNTHETIC DEMO VALUES created for the SIH prototype demonstration.
 * They are NOT live sensor feeds and must not be used operationally.
 */

export interface SeedLocation {
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
}

export const SEED_LOCATIONS: SeedLocation[] = [
  {
    slug: "aizawl-mizoram",
    name: "Aizawl",
    state: "Mizoram",
    latitude: 23.7271,
    longitude: 92.7176,
    elevation: 1132,
    slope: 38,
    terrainSusceptibility: 0.85,
    previousLandslide: true,
    currentRainfall: 168,
    currentSoilMoisture: 87,
    notes: "Dense hill-slope settlement on steep cut-slopes; recurring monsoon slides.",
  },
  {
    slug: "gangtok-sikkim",
    name: "Gangtok",
    state: "Sikkim",
    latitude: 27.3389,
    longitude: 88.6065,
    elevation: 1650,
    slope: 34,
    terrainSusceptibility: 0.88,
    previousLandslide: true,
    currentRainfall: 104,
    currentSoilMoisture: 79,
    notes: "High-relief Himalayan terrain, NH-10 corridor vulnerable to debris flow.",
  },
  {
    slug: "shillong-meghalaya",
    name: "Shillong",
    state: "Meghalaya",
    latitude: 25.5788,
    longitude: 91.8933,
    elevation: 1496,
    slope: 22,
    terrainSusceptibility: 0.6,
    previousLandslide: false,
    currentRainfall: 54,
    currentSoilMoisture: 61,
    notes: "Plateau edge; moderate slopes with heavy orographic rainfall.",
  },
  {
    slug: "kohima-nagaland",
    name: "Kohima",
    state: "Nagaland",
    latitude: 25.6751,
    longitude: 94.1086,
    elevation: 1444,
    slope: 31,
    terrainSusceptibility: 0.76,
    previousLandslide: true,
    currentRainfall: 82,
    currentSoilMoisture: 72,
    notes: "Weathered shale ridges; frequent road-cut failures on NH-29.",
  },
  {
    slug: "itanagar-arunachal-pradesh",
    name: "Itanagar",
    state: "Arunachal Pradesh",
    latitude: 27.0844,
    longitude: 93.6053,
    elevation: 320,
    slope: 19,
    terrainSusceptibility: 0.66,
    previousLandslide: false,
    currentRainfall: 41,
    currentSoilMoisture: 58,
    notes: "Foothill belt with rapid urban expansion on unstable fill slopes.",
  },
  {
    slug: "tawang-arunachal-pradesh",
    name: "Tawang",
    state: "Arunachal Pradesh",
    latitude: 27.5861,
    longitude: 91.8594,
    elevation: 3048,
    slope: 41,
    terrainSusceptibility: 0.9,
    previousLandslide: true,
    currentRainfall: 96,
    currentSoilMoisture: 74,
    notes: "Very high relief, snowmelt + rainfall combination on fragile slopes.",
  },
  {
    slug: "sohra-cherrapunji-meghalaya",
    name: "Sohra (Cherrapunji)",
    state: "Meghalaya",
    latitude: 25.3,
    longitude: 91.7,
    elevation: 1430,
    slope: 35,
    terrainSusceptibility: 0.84,
    previousLandslide: true,
    currentRainfall: 212,
    currentSoilMoisture: 92,
    notes: "One of the wettest places on Earth; escarpment slopes fail after cloudbursts.",
  },
  {
    slug: "lunglei-mizoram",
    name: "Lunglei",
    state: "Mizoram",
    latitude: 22.8879,
    longitude: 92.7337,
    elevation: 1013,
    slope: 29,
    terrainSusceptibility: 0.72,
    previousLandslide: false,
    currentRainfall: 66,
    currentSoilMoisture: 64,
    notes: "Ridge-top town connected by a single vulnerable highway corridor.",
  },
  {
    slug: "imphal-manipur",
    name: "Imphal",
    state: "Manipur",
    latitude: 24.817,
    longitude: 93.9368,
    elevation: 786,
    slope: 11,
    terrainSusceptibility: 0.42,
    previousLandslide: false,
    currentRainfall: 24,
    currentSoilMoisture: 46,
    notes: "Valley floor; risk concentrates on surrounding hill approach roads.",
  },
  {
    slug: "guwahati-assam",
    name: "Guwahati",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    elevation: 55,
    slope: 16,
    terrainSusceptibility: 0.52,
    previousLandslide: true,
    currentRainfall: 58,
    currentSoilMoisture: 63,
    notes: "Isolated hillocks with encroached slopes — localised slides each monsoon.",
  },
  {
    slug: "agartala-tripura",
    name: "Agartala",
    state: "Tripura",
    latitude: 23.8315,
    longitude: 91.2868,
    elevation: 22,
    slope: 5,
    terrainSusceptibility: 0.24,
    previousLandslide: false,
    currentRainfall: 12,
    currentSoilMoisture: 38,
    notes: "Mostly flat terrain; lowest landslide susceptibility in the demo set.",
  },
  {
    slug: "dimapur-nagaland",
    name: "Dimapur",
    state: "Nagaland",
    latitude: 25.9063,
    longitude: 93.7276,
    elevation: 145,
    slope: 8,
    terrainSusceptibility: 0.3,
    previousLandslide: false,
    currentRainfall: 30,
    currentSoilMoisture: 49,
    notes: "Plains gateway town; risk rises only on the Kohima approach climb.",
  },
];

export interface SeedRoad {
  locationSlug: string;
  name: string;
  status: "normal" | "possible_blockage" | "blocked";
  detail: string;
  alternateRoute: string;
}

export const SEED_ROADS: SeedRoad[] = [
  {
    locationSlug: "aizawl-mizoram",
    name: "NH-06 · Aizawl – Seling section",
    status: "blocked",
    detail: "Demo: debris slide reported across both lanes near km-14 cut-slope.",
    alternateRoute: "Detour via Sairang – Kanhmun link road (adds ~45 min).",
  },
  {
    locationSlug: "aizawl-mizoram",
    name: "Chaltlang – Bawngkawn arterial",
    status: "possible_blockage",
    detail: "Demo: retaining-wall seepage and minor slumping on the downhill side.",
    alternateRoute: "Use Zarkawt bypass during heavy rain hours.",
  },
  {
    locationSlug: "aizawl-mizoram",
    name: "Aizawl – Lengpui Airport road",
    status: "normal",
    detail: "Demo: no obstruction reported in the last monitoring cycle.",
    alternateRoute: "",
  },
  {
    locationSlug: "gangtok-sikkim",
    name: "NH-10 · Gangtok – Singtam",
    status: "blocked",
    detail: "Demo: river-side slope failure; traffic held at Ranipool check post.",
    alternateRoute: "Route via Pakyong – Rangpo state highway.",
  },
  {
    locationSlug: "gangtok-sikkim",
    name: "Gangtok – Nathula (JN Road)",
    status: "possible_blockage",
    detail: "Demo: loose boulders observed above the carriageway at 3 locations.",
    alternateRoute: "Convoy movement only, with escort clearance.",
  },
  {
    locationSlug: "shillong-meghalaya",
    name: "NH-06 · Shillong – Jowai",
    status: "normal",
    detail: "Demo: surface stable, drains functional.",
    alternateRoute: "",
  },
  {
    locationSlug: "shillong-meghalaya",
    name: "Shillong – Sohra (Cherrapunji) road",
    status: "possible_blockage",
    detail: "Demo: minor soil wash-out on the Mawkdok stretch after heavy showers.",
    alternateRoute: "Use Mylliem – Laitkynsew link if wash-out worsens.",
  },
  {
    locationSlug: "kohima-nagaland",
    name: "NH-29 · Kohima – Dimapur",
    status: "possible_blockage",
    detail: "Demo: partial lane closure near Piphema due to slope slump.",
    alternateRoute: "Use Medziphema – Chumukedima diversion.",
  },
  {
    locationSlug: "kohima-nagaland",
    name: "Kohima – Mao (NH-2)",
    status: "normal",
    detail: "Demo: clear, routine patrolling in place.",
    alternateRoute: "",
  },
  {
    locationSlug: "itanagar-arunachal-pradesh",
    name: "Itanagar – Naharlagun corridor",
    status: "normal",
    detail: "Demo: clear; minor water logging near the foothill drain.",
    alternateRoute: "",
  },
  {
    locationSlug: "itanagar-arunachal-pradesh",
    name: "Itanagar – Ziro (NH-13 spur)",
    status: "possible_blockage",
    detail: "Demo: fresh tension cracks reported on an uphill cut-slope.",
    alternateRoute: "Prefer daytime travel; keep Yazali halt as fallback.",
  },
  {
    locationSlug: "tawang-arunachal-pradesh",
    name: "Sela Pass approach (NH-13)",
    status: "blocked",
    detail: "Demo: slush-and-boulder slide closing the pass approach.",
    alternateRoute: "Hold at Dirang until BRO clearance; Sela tunnel convoy only.",
  },
  {
    locationSlug: "sohra-cherrapunji-meghalaya",
    name: "Sohra – Shella escarpment road",
    status: "blocked",
    detail: "Demo: escarpment washout after a cloudburst event.",
    alternateRoute: "Divert via Mawsynram – Balat road.",
  },
  {
    locationSlug: "lunglei-mizoram",
    name: "NH-54 · Lunglei – Thenzawl",
    status: "possible_blockage",
    detail: "Demo: intermittent rockfall observed at two hairpin bends.",
    alternateRoute: "Travel in daylight; use Hnahthial link if blocked.",
  },
  {
    locationSlug: "imphal-manipur",
    name: "NH-2 · Imphal – Kangpokpi",
    status: "normal",
    detail: "Demo: clear across the valley section.",
    alternateRoute: "",
  },
  {
    locationSlug: "guwahati-assam",
    name: "Kharguli hill approach road",
    status: "possible_blockage",
    detail: "Demo: soil slip on an encroached hill slope; one lane narrowed.",
    alternateRoute: "Use the riverfront road for through traffic.",
  },
  {
    locationSlug: "agartala-tripura",
    name: "NH-08 · Agartala – Udaipur",
    status: "normal",
    detail: "Demo: flat terrain, no slope hazard reported.",
    alternateRoute: "",
  },
  {
    locationSlug: "dimapur-nagaland",
    name: "Dimapur – Chumukedima bypass",
    status: "normal",
    detail: "Demo: clear.",
    alternateRoute: "",
  },
];

export interface SeedRecord {
  locationName: string;
  state: string;
  observedOn: string;
  rainfall: number;
  soilMoisture: number;
  slope: number;
  elevation: number;
  previousLandslide: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

/** Sample historical dataset (prototype/demo records, monsoon-style values). */
export const SEED_RECORDS: SeedRecord[] = [
  { locationName: "Aizawl", state: "Mizoram", observedOn: "2025-06-14", rainfall: 192, soilMoisture: 91, slope: 39, elevation: 1132, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Aizawl", state: "Mizoram", observedOn: "2025-03-02", rainfall: 18, soilMoisture: 41, slope: 39, elevation: 1132, previousLandslide: true, riskLevel: "MEDIUM" },
  { locationName: "Gangtok", state: "Sikkim", observedOn: "2025-07-05", rainfall: 148, soilMoisture: 86, slope: 34, elevation: 1650, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Gangtok", state: "Sikkim", observedOn: "2025-11-19", rainfall: 9, soilMoisture: 34, slope: 34, elevation: 1650, previousLandslide: true, riskLevel: "MEDIUM" },
  { locationName: "Shillong", state: "Meghalaya", observedOn: "2025-06-28", rainfall: 88, soilMoisture: 74, slope: 22, elevation: 1496, previousLandslide: false, riskLevel: "MEDIUM" },
  { locationName: "Shillong", state: "Meghalaya", observedOn: "2025-01-11", rainfall: 4, soilMoisture: 28, slope: 22, elevation: 1496, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Kohima", state: "Nagaland", observedOn: "2025-08-02", rainfall: 121, soilMoisture: 83, slope: 31, elevation: 1444, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Kohima", state: "Nagaland", observedOn: "2025-04-16", rainfall: 33, soilMoisture: 52, slope: 31, elevation: 1444, previousLandslide: true, riskLevel: "MEDIUM" },
  { locationName: "Itanagar", state: "Arunachal Pradesh", observedOn: "2025-07-21", rainfall: 97, soilMoisture: 78, slope: 19, elevation: 320, previousLandslide: false, riskLevel: "MEDIUM" },
  { locationName: "Itanagar", state: "Arunachal Pradesh", observedOn: "2025-02-08", rainfall: 6, soilMoisture: 31, slope: 19, elevation: 320, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Tawang", state: "Arunachal Pradesh", observedOn: "2025-06-09", rainfall: 133, soilMoisture: 84, slope: 41, elevation: 3048, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Sohra (Cherrapunji)", state: "Meghalaya", observedOn: "2025-06-17", rainfall: 268, soilMoisture: 95, slope: 35, elevation: 1430, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Sohra (Cherrapunji)", state: "Meghalaya", observedOn: "2025-12-03", rainfall: 3, soilMoisture: 33, slope: 35, elevation: 1430, previousLandslide: true, riskLevel: "MEDIUM" },
  { locationName: "Lunglei", state: "Mizoram", observedOn: "2025-07-12", rainfall: 104, soilMoisture: 80, slope: 29, elevation: 1013, previousLandslide: false, riskLevel: "HIGH" },
  { locationName: "Lunglei", state: "Mizoram", observedOn: "2025-10-22", rainfall: 21, soilMoisture: 44, slope: 29, elevation: 1013, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Imphal", state: "Manipur", observedOn: "2025-08-14", rainfall: 62, soilMoisture: 66, slope: 11, elevation: 786, previousLandslide: false, riskLevel: "MEDIUM" },
  { locationName: "Imphal", state: "Manipur", observedOn: "2025-01-27", rainfall: 2, soilMoisture: 25, slope: 11, elevation: 786, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Guwahati", state: "Assam", observedOn: "2025-06-05", rainfall: 118, soilMoisture: 82, slope: 16, elevation: 55, previousLandslide: true, riskLevel: "HIGH" },
  { locationName: "Guwahati", state: "Assam", observedOn: "2025-03-19", rainfall: 14, soilMoisture: 40, slope: 16, elevation: 55, previousLandslide: true, riskLevel: "MEDIUM" },
  { locationName: "Agartala", state: "Tripura", observedOn: "2025-07-30", rainfall: 71, soilMoisture: 69, slope: 5, elevation: 22, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Agartala", state: "Tripura", observedOn: "2025-02-14", rainfall: 3, soilMoisture: 27, slope: 5, elevation: 22, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Dimapur", state: "Nagaland", observedOn: "2025-08-25", rainfall: 58, soilMoisture: 63, slope: 8, elevation: 145, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Dimapur", state: "Nagaland", observedOn: "2025-05-04", rainfall: 26, soilMoisture: 47, slope: 8, elevation: 145, previousLandslide: false, riskLevel: "LOW" },
  { locationName: "Gangtok", state: "Sikkim", observedOn: "2025-09-11", rainfall: 79, soilMoisture: 71, slope: 34, elevation: 1650, previousLandslide: true, riskLevel: "HIGH" },
];

/**
 * Deterministic 7-day demo trend so charts look realistic without a live feed.
 * Derived from the location's current values, no randomness (stable in SSR).
 */
export function buildTrend(
  slug: string,
  currentRainfall: number,
  currentSoilMoisture: number,
): Array<{ day: string; rainfall: number; soilMoisture: number }> {
  const seed = slug.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const days = ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Day -1", "Today"];
  return days.map((day, index) => {
    const wave = Math.sin((seed % 17) + index * 0.9);
    const ramp = 0.42 + (index / (days.length - 1)) * 0.58;
    const rainfall = Math.max(0, Math.round(currentRainfall * ramp + wave * 12));
    const soilMoisture = Math.max(
      12,
      Math.min(100, Math.round(currentSoilMoisture * (0.68 + (index / (days.length - 1)) * 0.32) + wave * 3)),
    );
    return { day, rainfall, soilMoisture };
  });
}
