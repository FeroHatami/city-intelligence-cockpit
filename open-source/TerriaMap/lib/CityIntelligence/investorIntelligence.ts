export type InvestorSignalLabel =
  | "Low Signal"
  | "Watch"
  | "Research"
  | "Strong Opportunity";

export type PlanningSignal =
  | "unknown"
  | "commercial_or_mixed_use"
  | "residential_weak_commercial"
  | "green_open_protected";

export interface DemandDriverLayer {
  key: string;
  label: string;
  url: string;
  sourceType: "OSM-derived GeoJSON" | "Official GeoJSON";
  weight: number;
}

export interface DemandDriverResult {
  key: string;
  label: string;
  count: number;
  sourceType: string;
}

export interface InvestorAnalysisInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  planningSignal: PlanningSignal;
  transitObserved: boolean;
  floodOrWaterRiskObserved: boolean;
  noiseOrEnvironmentalRiskObserved: boolean;
}

export interface InvestorAnalysisResult {
  score: number;
  label: InvestorSignalLabel;
  explanation: string;
  positiveDrivers: string[];
  riskFlags: string[];
  dataBasis: string[];
  nextSteps: string[];
  demandDrivers: DemandDriverResult[];
}

type GeoJsonPosition = [number, number, ...number[]];

interface GeoJsonFeature {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
}

export const DEMAND_DRIVER_LAYERS: DemandDriverLayer[] = [
  {
    key: "offices",
    label: "Offices",
    url: "data/city-intelligence/munich-offices.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 20
  },
  {
    key: "restaurants",
    label: "Restaurants",
    url: "data/city-intelligence/munich-restaurants.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 15
  },
  {
    key: "services",
    label: "Clinics, pharmacies, and services",
    url: "data/city-intelligence/munich-clinics.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 15
  },
  {
    key: "pharmacies",
    label: "Pharmacies",
    url: "data/city-intelligence/munich-pharmacies.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 15
  },
  {
    key: "coworking",
    label: "Coworking and business activity",
    url: "data/city-intelligence/munich-coworking.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 15
  }
];

export const OFFICIAL_REAL_ESTATE_DATA_BASIS = [
  "Munich Flachennutzungsplan / FNP: official Munich GeoPortal WMS, raw planning visualization.",
  "Munich Bebauungsplane: official Munich GeoPortal WMS, raw legally binding / in-preparation plan areas.",
  "Bodenrichtwerte Bayern 2026: official GDI Bayern / LDBV WMS, raw land-value zones.",
  "Risk and constraints layers: official Munich planning/environment WMS context where enabled."
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isPosition(value: unknown): value is GeoJsonPosition {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function collectPositions(coordinates: unknown, positions: GeoJsonPosition[]) {
  if (isPosition(coordinates)) {
    positions.push(coordinates);
    return;
  }

  if (Array.isArray(coordinates)) {
    coordinates.forEach((child) => collectPositions(child, positions));
  }
}

function featureCentroid(feature: GeoJsonFeature) {
  const positions: GeoJsonPosition[] = [];
  collectPositions(feature.geometry?.coordinates, positions);
  if (positions.length === 0) return undefined;

  const totals = positions.reduce(
    (sum, position) => ({
      longitude: sum.longitude + position[0],
      latitude: sum.latitude + position[1]
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: totals.latitude / positions.length,
    longitude: totals.longitude / positions.length
  };
}

function distanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const radius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latDelta = toRadians(latitudeB - latitudeA);
  const lonDelta = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function demandScore(key: string, count: number, maxWeight: number) {
  if (key === "offices") {
    if (count >= 50) return maxWeight;
    if (count >= 20) return 15;
    if (count >= 5) return 8;
    return 0;
  }

  if (key === "restaurants") {
    if (count >= 30) return maxWeight;
    if (count >= 12) return 10;
    if (count >= 4) return 5;
    return 0;
  }

  if (key === "coworking") {
    if (count >= 2) return maxWeight;
    if (count >= 1) return 8;
    return 0;
  }

  if (count >= 18) return maxWeight;
  if (count >= 8) return 10;
  if (count >= 3) return 5;
  return 0;
}

function signalLabel(score: number): InvestorSignalLabel {
  if (score <= 30) return "Low Signal";
  if (score <= 55) return "Watch";
  if (score <= 75) return "Research";
  return "Strong Opportunity";
}

async function loadDemandDriver(layer: DemandDriverLayer) {
  const response = await fetch(layer.url);
  if (!response.ok) {
    throw new Error(`Could not load ${layer.label}: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.features)
    ? (data.features as GeoJsonFeature[])
    : [];
}

export async function countDemandDrivers(
  input: Pick<InvestorAnalysisInput, "latitude" | "longitude" | "radiusKm">
): Promise<DemandDriverResult[]> {
  const layers = await Promise.all(
    DEMAND_DRIVER_LAYERS.map(async (layer) => {
      const features = await loadDemandDriver(layer);
      const count = features.reduce((total, feature) => {
        const centroid = featureCentroid(feature);
        if (!centroid) return total;
        return distanceKm(
          input.latitude,
          input.longitude,
          centroid.latitude,
          centroid.longitude
        ) <= input.radiusKm
          ? total + 1
          : total;
      }, 0);

      return {
        key: layer.key,
        label: layer.label,
        count,
        sourceType: layer.sourceType
      };
    })
  );

  const services = layers.find((layer) => layer.key === "services");
  const pharmacies = layers.find((layer) => layer.key === "pharmacies");
  if (services && pharmacies) {
    services.count += pharmacies.count;
  }

  return layers.filter((layer) => layer.key !== "pharmacies");
}

export function scoreInvestorSignal(
  input: InvestorAnalysisInput,
  demandDrivers: DemandDriverResult[]
): InvestorAnalysisResult {
  const positiveDrivers: string[] = [];
  const riskFlags: string[] = [];
  let score = 35;

  for (const driver of demandDrivers) {
    const layer = DEMAND_DRIVER_LAYERS.find((item) => item.key === driver.key);
    if (!layer) continue;
    const points = demandScore(driver.key, driver.count, layer.weight);
    score += points;
    if (points > 0) {
      positiveDrivers.push(
        `${driver.label}: ${driver.count} nearby features within ${input.radiusKm} km.`
      );
    }
  }

  if (input.planningSignal === "commercial_or_mixed_use") {
    score += 20;
    positiveDrivers.push(
      "Manual planning signal: official planning layer appears to support commercial or mixed-use potential."
    );
  }

  if (input.planningSignal === "residential_weak_commercial") {
    score -= 10;
    riskFlags.push(
      "Manual planning signal: area appears primarily residential with weaker commercial signal."
    );
  }

  if (input.planningSignal === "green_open_protected") {
    score -= 20;
    riskFlags.push(
      "Manual planning signal: green, open-space, or protected land appears present."
    );
  }

  if (input.transitObserved) {
    score += 10;
    positiveDrivers.push(
      "Manual context signal: transit access appears nearby and should be checked against official transit layers."
    );
  }

  if (input.floodOrWaterRiskObserved) {
    score -= 15;
    riskFlags.push(
      "Manual risk signal: flood or water constraint appears visible in official/context layers."
    );
  }

  if (input.noiseOrEnvironmentalRiskObserved) {
    score -= 15;
    riskFlags.push(
      "Manual risk signal: noise or environmental constraint appears visible in official/context layers."
    );
  }

  const totalDemandDrivers = demandDrivers.reduce(
    (total, driver) => total + driver.count,
    0
  );
  if (totalDemandDrivers < 5) {
    score -= 10;
    riskFlags.push(
      `Weak demand-driver density: only ${totalDemandDrivers} nearby demand-driver features found.`
    );
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);
  const label = signalLabel(normalizedScore);
  const dataBasis = [
    `Analysis point: ${input.latitude.toFixed(5)}, ${input.longitude.toFixed(5)}.`,
    `Radius: ${input.radiusKm} km.`,
    ...OFFICIAL_REAL_ESTATE_DATA_BASIS,
    "Demand-driver counts: existing local OSM-derived GeoJSON layers from City Intelligence Cockpit."
  ];
  const nextSteps = [
    "Open the official Munich Flachennutzungsplan layer and verify the land-use category.",
    "Open the official Bebauungsplane layer and inspect the legally binding plan area or plan in preparation.",
    "Compare the official Bodenrichtwerte zone with nearby zones.",
    "Check transit access and active public transport layers where available.",
    "Investigate ownership separately through legal and verified public channels if available.",
    "Treat this as planning-zone / land-use / investment-signal intelligence, not legal, tax, or investment advice."
  ];
  const explanation = [
    `Investor Signal: ${label}.`,
    "This is a derived investor signal based on available planning and demand-driver data.",
    positiveDrivers.length
      ? `Positive drivers include ${positiveDrivers
          .map((driver) => driver.replace(/\.$/, ""))
          .join("; ")}.`
      : "Few positive demand-driver signals were found within the selected radius.",
    riskFlags.length
      ? `Risk flags include ${riskFlags
          .map((flag) => flag.replace(/\.$/, ""))
          .join("; ")}.`
      : "No manual risk flags were selected.",
    "Official WMS layers are raw factual visualizations; this score is our own rule-based interpretation and must be verified against official planning documents before any decision."
  ].join(" ");

  return {
    score: normalizedScore,
    label,
    explanation,
    positiveDrivers,
    riskFlags,
    dataBasis,
    nextSteps,
    demandDrivers
  };
}

export function parseCoordinate(value: unknown, fallback: number) {
  return toNumber(value) ?? fallback;
}
