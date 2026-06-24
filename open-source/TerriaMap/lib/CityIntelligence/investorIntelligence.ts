export type InvestorSignalLabel =
  | "Low Signal"
  | "Watch"
  | "Research"
  | "Strong Opportunity";

export type MarketValueSignal =
  | "unknown"
  | "official_land_value_visible"
  | "high_value_or_value_gradient"
  | "low_value_or_unclear";

export type LegalPlanningSignal =
  | "unknown"
  | "binding_plan_supports_use"
  | "plan_in_preparation"
  | "restrictive_or_unclear";

export type ResidentialQualitySignal =
  | "unknown"
  | "good_or_very_good"
  | "average"
  | "simple_or_weak";

export type StrategicLandUseSignal =
  | "unknown"
  | "supports_commercial_mixed_use"
  | "residential_context"
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

export interface FactualLayerInfo {
  sourceLayer: string;
  sourceService?: string;
  featureName?: string;
  attributes: Record<string, string>;
  summary: string;
}

export interface InvestorSubScores {
  marketContext: number;
  legalPlanning: number;
  demandDrivers: number;
  residentialQuality: number;
  riskRestrictions: number;
  strategicContext: number;
}

export interface InvestorAnalysisInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  coordinateSource?: string;
  selectedFeatureName?: string;
  marketValueSignal: MarketValueSignal;
  legalPlanningSignal: LegalPlanningSignal;
  residentialQualitySignal: ResidentialQualitySignal;
  strategicLandUseSignal: StrategicLandUseSignal;
  transitObserved: boolean;
  preservationAreaObserved: boolean;
  floodOrWaterRiskObserved: boolean;
  noiseOrEnvironmentalRiskObserved: boolean;
  factualLayerInfo?: FactualLayerInfo[];
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
  factualLayerInfo: FactualLayerInfo[];
  subScores: InvestorSubScores;
  suggestedThesis: string;
  reportText: string;
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
    weight: 16
  },
  {
    key: "restaurants",
    label: "Restaurants",
    url: "data/city-intelligence/munich-restaurants.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 12
  },
  {
    key: "services",
    label: "Clinics, pharmacies, and services",
    url: "data/city-intelligence/munich-clinics.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 12
  },
  {
    key: "pharmacies",
    label: "Pharmacies",
    url: "data/city-intelligence/munich-pharmacies.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 12
  },
  {
    key: "coworking",
    label: "Coworking and business activity",
    url: "data/city-intelligence/munich-coworking.geojson",
    sourceType: "OSM-derived GeoJSON",
    weight: 10
  }
];

export const OFFICIAL_REAL_ESTATE_DATA_BASIS = [
  "Bodenrichtwerte Bayern 2026: official GDI Bayern / LDBV WMS, raw land-value zones.",
  "Gutachterausschuss / Lagekarte references: official Munich market context where a stable no-key embeddable layer was not confirmed.",
  "Munich Bebauungsplaene: official Munich GeoPortal WMS, legally specific planning areas in force or in preparation.",
  "Mietspiegel 2025 / Wohnlagenkarte references: official Munich residential rent/location-quality context, not purchase-price data.",
  "Munich Flachennutzungsplan / FNP: official strategic citywide land-use WMS, broad context only and not parcel-level permission.",
  "Restrictions and risk layers: official Munich preservation, flood, noise, green, and protected-area WMS context where enabled."
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

function factualText(factualLayerInfo: FactualLayerInfo[]) {
  return factualLayerInfo
    .map((info) =>
      [
        info.sourceLayer,
        info.featureName,
        info.summary,
        ...Object.entries(info.attributes || {}).flatMap(([key, value]) => [
          key,
          value
        ])
      ].join(" ")
    )
    .join(" ")
    .toLowerCase();
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function factualSourceSummary(factualLayerInfo: FactualLayerInfo[]) {
  if (factualLayerInfo.length === 0) {
    return [
      "No exact feature attributes available for this location. Using visible layers and nearby demand-driver data."
    ];
  }

  return factualLayerInfo.map((info) => {
    const attributes = Object.entries(info.attributes || {})
      .slice(0, 5)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
    return `${info.sourceLayer}: ${info.featureName || info.summary || attributes || "feature attributes available"}`;
  });
}

function suggestedThesis(label: InvestorSignalLabel, riskFlags: string[]) {
  if (riskFlags.some((risk) => /preservation|Erhaltungssatzung/i.test(risk))) {
    return "Restriction-led research thesis: demand may be interesting, but preservation rules must be checked before any conversion, demolition, modernization, or redevelopment idea.";
  }

  if (label === "Strong Opportunity") {
    return "Opportunity thesis: strong local demand-driver density and useful official context make this area worth deeper market, legal-planning, and valuation research.";
  }

  if (label === "Research") {
    return "Research thesis: the area has enough positive context to justify deeper checks, especially Bebauungsplan details, land-value comparison, and restrictions.";
  }

  if (label === "Watch") {
    return "Watch thesis: keep the area on a research list, but look for stronger market, legal-planning, or demand-driver evidence before prioritizing.";
  }

  return "Low-signal thesis: current local inputs do not show a strong opportunity cluster; verify official layers before discarding the area completely.";
}

function formatList(items: string[], fallback: string) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : fallback;
}

function generateAreaReport(result: {
  input: InvestorAnalysisInput;
  score: number;
  label: InvestorSignalLabel;
  explanation: string;
  positiveDrivers: string[];
  riskFlags: string[];
  dataBasis: string[];
  nextSteps: string[];
  demandDrivers: DemandDriverResult[];
  factualLayerInfo: FactualLayerInfo[];
  subScores: InvestorSubScores;
  suggestedThesis: string;
}) {
  const factualInfo =
    result.factualLayerInfo.length > 0
      ? result.factualLayerInfo
          .map((info) => {
            const attributes = Object.entries(info.attributes)
              .slice(0, 8)
              .map(([key, value]) => `${key}: ${value}`)
              .join("; ");
            return `- ${info.sourceLayer}: ${info.featureName || info.summary || attributes || "attributes available"}`;
          })
          .join("\n")
      : "- No exact feature attributes available for this location. Using visible layers and nearby demand-driver data.";

  const demandCounts = result.demandDrivers
    .map(
      (driver) =>
        `- ${driver.label}: ${driver.count} within approximately ${result.input.radiusKm} km (${driver.sourceType})`
    )
    .join("\n");

  return [
    "Munich Real Estate Area Report",
    `Location: ${result.input.selectedFeatureName || `${result.input.latitude.toFixed(5)}, ${result.input.longitude.toFixed(5)}`}`,
    `Coordinate source: ${result.input.coordinateSource || "manual/default analysis point"}`,
    `Signal: ${result.label}, ${result.score}/100`,
    "",
    "Summary:",
    result.explanation,
    "",
    "Sub-scores:",
    `- Market Context: ${result.subScores.marketContext}`,
    `- Legal Planning: ${result.subScores.legalPlanning}`,
    `- Demand Drivers: ${result.subScores.demandDrivers}`,
    `- Residential Quality: ${result.subScores.residentialQuality}`,
    `- Risk / Restrictions: ${result.subScores.riskRestrictions}`,
    `- Strategic Context: ${result.subScores.strategicContext}`,
    "",
    "Factual data:",
    factualInfo,
    "",
    "Demand drivers:",
    demandCounts || "- No strong nearby demand-driver cluster detected.",
    "",
    "Positive drivers:",
    formatList(result.positiveDrivers, "- No strong positive drivers found."),
    "",
    "Risks:",
    formatList(result.riskFlags, "- No risk flags selected or detected."),
    "",
    "Suggested thesis:",
    result.suggestedThesis,
    "",
    "Next research steps:",
    result.nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "Disclaimer:",
    "Derived investor signal. Not official city rating. Not legal, tax, or investment advice. Verify official documents and professional advice before decisions."
  ].join("\n");
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
  const factualLayerInfo = input.factualLayerInfo || [];
  const subScores: InvestorSubScores = {
    marketContext: 0,
    legalPlanning: 0,
    demandDrivers: 0,
    residentialQuality: 0,
    riskRestrictions: 0,
    strategicContext: 0
  };
  let score = 30;

  const addScore = (
    bucket: keyof InvestorSubScores,
    points: number,
    message: string
  ) => {
    subScores[bucket] += points;
    score += points;
    if (points >= 0) positiveDrivers.push(message);
    else riskFlags.push(message);
  };

  for (const driver of demandDrivers) {
    const layer = DEMAND_DRIVER_LAYERS.find((item) => item.key === driver.key);
    if (!layer) continue;
    const points = demandScore(driver.key, driver.count, layer.weight);
    subScores.demandDrivers += points;
    score += points;
    if (points > 0) {
      positiveDrivers.push(
        `${driver.label}: ${driver.count} nearby features within ${input.radiusKm} km.`
      );
    }
  }

  if (input.marketValueSignal === "official_land_value_visible") {
    addScore(
      "marketContext",
      8,
      "Market/value signal: official Bodenrichtwerte or market context is visible and should be compared with nearby zones."
    );
  }

  if (input.marketValueSignal === "high_value_or_value_gradient") {
    addScore(
      "marketContext",
      18,
      "Market/value signal: visible land-value strength or a nearby value transition may justify deeper pricing research."
    );
  }

  if (input.marketValueSignal === "low_value_or_unclear") {
    addScore(
      "marketContext",
      -5,
      "Market/value signal: land-value context appears weak, low, or unclear; compare official Bodenrichtwerte before prioritizing."
    );
  }

  if (input.legalPlanningSignal === "binding_plan_supports_use") {
    addScore(
      "legalPlanning",
      18,
      "Legal planning signal: a legally specific Bebauungsplan appears to support the intended use or development direction."
    );
  }

  if (input.legalPlanningSignal === "plan_in_preparation") {
    addScore(
      "legalPlanning",
      10,
      "Legal planning signal: a Bebauungsplan in preparation is visible, so the area may deserve monitoring before decisions."
    );
  }

  if (input.legalPlanningSignal === "restrictive_or_unclear") {
    addScore(
      "legalPlanning",
      -18,
      "Legal planning signal: Bebauungsplan context appears restrictive or unclear and should be checked before proceeding."
    );
  }

  if (input.residentialQualitySignal === "good_or_very_good") {
    addScore(
      "residentialQuality",
      10,
      "Residential quality signal: Mietspiegel/Wohnlage context appears good or very good for residential rent/location quality."
    );
  }

  if (input.residentialQualitySignal === "average") {
    addScore(
      "residentialQuality",
      4,
      "Residential quality signal: Mietspiegel/Wohnlage context appears average and should be compared with nearby areas."
    );
  }

  if (input.residentialQualitySignal === "simple_or_weak") {
    addScore(
      "residentialQuality",
      -6,
      "Residential quality signal: Mietspiegel/Wohnlage context appears simple or weak for residential positioning."
    );
  }

  if (input.strategicLandUseSignal === "supports_commercial_mixed_use") {
    addScore(
      "strategicContext",
      5,
      "Strategic land-use signal: FNP context appears supportive, but it is broad citywide context rather than parcel permission."
    );
  }

  if (input.strategicLandUseSignal === "residential_context") {
    addScore(
      "strategicContext",
      2,
      "Strategic land-use signal: FNP residential context is visible, useful only as broad long-term context."
    );
  }

  if (input.strategicLandUseSignal === "green_open_protected") {
    addScore(
      "strategicContext",
      -8,
      "Strategic land-use signal: FNP suggests green/open/protected context; verify with legal planning and restriction layers."
    );
  }

  if (input.transitObserved) {
    addScore(
      "demandDrivers",
      8,
      "Manual context signal: transit access appears nearby and should be checked against official transit layers."
    );
  }

  if (input.preservationAreaObserved) {
    addScore(
      "riskRestrictions",
      -22,
      "Restriction signal: Erhaltungssatzung / preservation area appears visible, which is a strong due-diligence flag."
    );
  }

  if (input.floodOrWaterRiskObserved) {
    addScore(
      "riskRestrictions",
      -15,
      "Manual risk signal: flood or water constraint appears visible in official/context layers."
    );
  }

  if (input.noiseOrEnvironmentalRiskObserved) {
    addScore(
      "riskRestrictions",
      -15,
      "Manual risk signal: noise or environmental constraint appears visible in official/context layers."
    );
  }

  const facts = factualText(factualLayerInfo);
  if (containsAny(facts, ["bodenrichtwert", "bodenrichtwerte", "richtwert"])) {
    addScore(
      "marketContext",
      6,
      "Factual layer info: Bodenrichtwerte / land-value context returned attributes for this location."
    );
  }
  if (containsAny(facts, ["bebauungsplan", "b-plan", "baulinie", "in kraft"])) {
    addScore(
      "legalPlanning",
      8,
      "Factual layer info: Bebauungsplan/legal-planning attributes are available for this location."
    );
  }
  if (
    containsAny(facts, [
      "mischgebiet",
      "kerngebiet",
      "gewerbegebiet",
      "industriegebiet",
      "mixed-use",
      "commercial",
      "core urban"
    ])
  ) {
    addScore(
      "legalPlanning",
      10,
      "Factual layer info: commercial, mixed-use, core, or employment-oriented planning terms appear in the selected attributes."
    );
  }
  if (
    containsAny(facts, [
      "wohnlage",
      "mietspiegel",
      "gute lage",
      "sehr gute lage"
    ])
  ) {
    addScore(
      "residentialQuality",
      6,
      "Factual layer info: residential quality or Mietspiegel/Wohnlage context is available."
    );
  }
  if (
    containsAny(facts, ["erhaltungssatzung", "preservation", "satz_erhalt"])
  ) {
    addScore(
      "riskRestrictions",
      -22,
      "Factual layer info: Erhaltungssatzung / preservation restriction appears present."
    );
  }
  if (
    containsAny(facts, [
      "überschwemmungsgebiet",
      "ueberschwemmungsgebiet",
      "flood",
      "landschaftsschutzgebiet",
      "naturschutzgebiet",
      "grünfläche",
      "gruenfläche",
      "gruenflaeche",
      "wald",
      "landwirtschaft",
      "wasserfläche",
      "wasserflaeche"
    ])
  ) {
    addScore(
      "riskRestrictions",
      -14,
      "Factual layer info: flood, protected, green, forest, agriculture, or water context appears present."
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
    `Coordinate source: ${input.coordinateSource || "manual/default analysis point"}.`,
    `Radius: ${input.radiusKm} km.`,
    ...OFFICIAL_REAL_ESTATE_DATA_BASIS,
    "Demand-driver counts: existing local OSM-derived GeoJSON layers from City Intelligence Cockpit.",
    ...factualSourceSummary(factualLayerInfo)
  ];
  const nextSteps = [
    "Start with the official Bodenrichtwerte layer and compare the selected zone with nearby zones.",
    "Check Gutachterausschuss / market-reference material where available before treating a value signal as actionable.",
    "Open the official Bebauungsplaene layers and inspect plans in force or in preparation before investment or development decisions.",
    "Use the Mietspiegel / Wohnlagenkarte reference for residential rent/location quality, not purchase price.",
    "Check Erhaltungssatzungen, flood, noise, protected/green, and transit layers where relevant.",
    "Use the FNP only as strategic citywide land-use context; it is not exact parcel-level permission.",
    "Investigate ownership separately through legal and verified public channels if available.",
    "Treat this as market / legal-planning / land-use investment-signal intelligence, not legal, tax, or investment advice."
  ];
  const explanation = [
    `Investor Signal: ${label}.`,
    "This is a derived investor signal based on available market/value, legal-planning, residential-quality, restriction, strategic land-use, and demand-driver data.",
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
    "Official WMS and reference layers are raw factual source context; this score is our own rule-based interpretation. Land-value and Bebauungsplan context are weighted ahead of broad FNP context, and every decision must be verified against official documents."
  ].join(" ");
  const thesis = suggestedThesis(label, riskFlags);
  const reportText = generateAreaReport({
    input,
    score: normalizedScore,
    label,
    explanation,
    positiveDrivers,
    riskFlags,
    dataBasis,
    nextSteps,
    demandDrivers,
    factualLayerInfo,
    subScores,
    suggestedThesis: thesis
  });

  return {
    score: normalizedScore,
    label,
    explanation,
    positiveDrivers,
    riskFlags,
    dataBasis,
    nextSteps,
    demandDrivers,
    factualLayerInfo,
    subScores,
    suggestedThesis: thesis,
    reportText
  };
}

export function parseCoordinate(value: unknown, fallback: number) {
  return toNumber(value) ?? fallback;
}
