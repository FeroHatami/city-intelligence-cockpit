import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import Ellipsoid from "terriajs-cesium/Source/Core/Ellipsoid";
import CesiumMath from "terriajs-cesium/Source/Core/Math";
import MenuPanel from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuPanel";
import {
  countDemandDrivers,
  parseCoordinate,
  scoreInvestorSignal
} from "../CityIntelligence/investorIntelligence";

const DEFAULT_ANALYSIS_POINT = {
  latitude: "48.13743",
  longitude: "11.57549",
  radiusKm: "1.0"
};

const MARKET_VALUE_OPTIONS = [
  ["unknown", "Unknown / verify manually"],
  ["official_land_value_visible", "Bodenrichtwerte / market context visible"],
  ["high_value_or_value_gradient", "High value or value transition visible"],
  ["low_value_or_unclear", "Low, weak, or unclear value context"]
];

const LEGAL_PLANNING_OPTIONS = [
  ["unknown", "Unknown / verify manually"],
  ["binding_plan_supports_use", "Bebauungsplan supports intended use"],
  ["plan_in_preparation", "Bebauungsplan in preparation"],
  ["restrictive_or_unclear", "Restrictive or unclear legal planning"]
];

const RESIDENTIAL_QUALITY_OPTIONS = [
  ["unknown", "Unknown / not residential"],
  ["good_or_very_good", "Good or very good Wohnlage"],
  ["average", "Average Wohnlage"],
  ["simple_or_weak", "Simple or weak Wohnlage"]
];

const STRATEGIC_LAND_USE_OPTIONS = [
  ["unknown", "Unknown / verify manually"],
  ["supports_commercial_mixed_use", "FNP supports mixed/commercial context"],
  ["residential_context", "FNP residential context"],
  ["green_open_protected", "FNP green, open, or protected context"]
];

const REAL_ESTATE_LEGEND = [
  [
    "Wohnbaufläche / Wohngebiet",
    "Residential / housing",
    "Useful for housing thesis; exact permissions still need Bebauungsplan checks."
  ],
  [
    "Reines Wohngebiet",
    "Pure residential",
    "Usually low tolerance for commercial uses; verify allowed uses."
  ],
  [
    "Allgemeines Wohngebiet",
    "General residential",
    "Residential with some compatible services possible; check details."
  ],
  [
    "Besonderes Wohngebiet",
    "Special residential",
    "Residential with compatible mixed uses; potentially interesting but plan-specific."
  ],
  [
    "Dorfgebiet",
    "Village area",
    "Mixed village-style uses; uncommon in core investment areas."
  ],
  [
    "Mischgebiet",
    "Mixed-use area",
    "Often interesting for services, retail, offices, and housing combinations."
  ],
  [
    "Kerngebiet",
    "Central / core urban area",
    "Strong urban/commercial signal; check exact rules and restrictions."
  ],
  [
    "Gewerbegebiet",
    "Commercial area",
    "Good for business, offices, light industry, and service demand research."
  ],
  [
    "Industriegebiet",
    "Industrial area",
    "Industrial/employment signal; residential thesis usually weaker."
  ],
  [
    "Sondergebiet",
    "Special-use area",
    "Use is specific to the plan; read official details carefully."
  ],
  [
    "Gemeinbedarfsfläche",
    "Public/community facility",
    "Public-use context; private investment use may be limited."
  ],
  [
    "Gemeinbedarfsfläche Gesundheit",
    "Health/public health facility",
    "Health facility context; useful for medical-service demand research."
  ],
  [
    "Gemeinbedarfsfläche Erziehung",
    "Education facility",
    "School/education context; check public-use limitations."
  ],
  [
    "Gemeinbedarfsfläche Kultur",
    "Culture facility",
    "Culture/community context; check operating and public-use constraints."
  ],
  [
    "Grünfläche",
    "Green/open space",
    "Restriction/risk flag for development thesis; verify protection status."
  ],
  [
    "Parkanlage",
    "Park",
    "Amenity for nearby areas, but usually not a developable parcel signal."
  ],
  [
    "Sportanlage",
    "Sports facility",
    "Amenity/public-use context; check land-use restrictions."
  ],
  ["Friedhof", "Cemetery", "Strong non-development context."],
  ["Wald", "Forest", "Strong environmental/open-space restriction flag."],
  [
    "Landwirtschaft",
    "Agriculture",
    "Low urban development signal unless planning changes are explicit."
  ],
  ["Wasserfläche", "Water", "Non-development/risk context."],
  [
    "Verkehrsfläche",
    "Transport/road/rail area",
    "Access can help demand, but land itself may be constrained."
  ],
  [
    "Erhaltungssatzung",
    "Preservation/restriction area",
    "Strong due-diligence flag for conversion, demolition, and modernization."
  ],
  [
    "Landschaftsschutzgebiet",
    "Landscape protection area",
    "Environmental restriction flag."
  ],
  [
    "Überschwemmungsgebiet",
    "Flood area",
    "Risk flag; check flood and insurance implications."
  ]
];

const LAYER_EXPLANATIONS = [
  [
    "Bodenrichtwerte",
    "Official land-value zones. Useful for understanding land price context. Not the same as final property value."
  ],
  [
    "Bebauungspläne",
    "Legally more specific planning layer. Important for what may be built or used in detail."
  ],
  [
    "Bebauungspläne in Aufstellung",
    "Plans in preparation. Useful for detecting future planning changes, but not final permission."
  ],
  [
    "FNP",
    "Strategic citywide land-use plan. Useful for long-term context, not exact parcel-level permission."
  ],
  [
    "Mietspiegel / Wohnlagenkarte",
    "Residential rent/location quality context. Useful for rental attractiveness, not exact purchase price."
  ],
  [
    "Erhaltungssatzung",
    "Restriction/protection area. Can limit conversion, demolition, luxury modernization, or displacement-related changes."
  ],
  [
    "Buildings & Parcels references",
    "Physical building/parcel context where available. Ownership data is not included."
  ]
];

const styles = {
  panel: {
    width: 430,
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "72vh",
    overflowY: "auto",
    padding: 16,
    color: "#fff"
  },
  header: {
    margin: "0 0 12px",
    fontSize: 18,
    lineHeight: 1.25
  },
  note: {
    margin: "0 0 12px",
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 1.35
  },
  sectionTitle: {
    margin: "18px 0 8px",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 12,
    lineHeight: 1.25
  },
  input: {
    minHeight: 32,
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: 4,
    background: "rgba(0,0,0,0.22)",
    color: "#fff",
    padding: "6px 8px",
    font: "inherit"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 1.35
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  button: {
    minHeight: 32,
    border: "1px solid rgba(255,255,255,0.32)",
    borderRadius: 4,
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "6px 10px",
    cursor: "pointer",
    font: "inherit"
  },
  primaryButton: {
    background: "#2f80ed",
    borderColor: "#2f80ed"
  },
  resultBox: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    background: "rgba(255,255,255,0.06)"
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  scoreBadge: {
    minWidth: 64,
    borderRadius: 4,
    padding: "8px 10px",
    background: "#f59e0b",
    color: "#111827",
    textAlign: "center",
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1
  },
  signalLabel: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.25
  },
  list: {
    margin: "6px 0 0",
    paddingLeft: 18,
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    lineHeight: 1.4
  },
  message: {
    margin: "10px 0 0",
    color: "#b6e3ff",
    fontSize: 12,
    lineHeight: 1.35
  },
  warning: {
    margin: "10px 0 0",
    color: "#fde68a",
    fontSize: 12,
    lineHeight: 1.35
  },
  textarea: {
    width: "100%",
    minHeight: 96,
    marginTop: 8,
    boxSizing: "border-box",
    resize: "vertical"
  },
  details: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 6,
    padding: "8px 10px",
    marginTop: 10,
    background: "rgba(255,255,255,0.05)"
  },
  summary: {
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
    marginTop: 8
  },
  infoCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 5,
    padding: 9,
    background: "rgba(0,0,0,0.16)"
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.25
  },
  legendRow: {
    display: "grid",
    gridTemplateColumns: "minmax(120px, 0.9fr) minmax(100px, 0.8fr) 1.2fr",
    gap: 8,
    padding: "7px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    fontSize: 11,
    lineHeight: 1.3
  },
  legendTerm: {
    color: "#fff",
    fontWeight: 700
  },
  subScoreGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 8
  },
  subScore: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 5,
    padding: 8,
    background: "rgba(255,255,255,0.05)",
    fontSize: 12,
    lineHeight: 1.3
  },
  subScoreValue: {
    display: "block",
    marginTop: 3,
    fontSize: 18,
    fontWeight: 700
  },
  reportBox: {
    minHeight: 180,
    whiteSpace: "pre-wrap"
  }
};

function stringValue(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value))
    return value.map(stringValue).filter(Boolean).join(", ");
  if (typeof value?.getValue === "function")
    return stringValue(value.getValue());
  return "";
}

function normalizedKey(key) {
  return String(key)
    .toLowerCase()
    .replace(/[\s_:-]+/g, "");
}

function getProperty(properties, aliases) {
  const wanted = aliases.map(normalizedKey);
  const match = Object.entries(properties).find(([key]) =>
    wanted.includes(normalizedKey(key))
  );
  return match ? stringValue(match[1]) : "";
}

function getFeatureProperties(feature, currentTime) {
  const properties = {};
  const dataProperties = feature?.data?.properties;

  if (dataProperties && typeof dataProperties === "object") {
    Object.assign(properties, dataProperties);
  }

  const featureProperties = feature?.properties;
  if (featureProperties) {
    const value =
      typeof featureProperties.getValue === "function"
        ? featureProperties.getValue(currentTime)
        : featureProperties;

    if (value && typeof value === "object") {
      Object.assign(properties, value);
    }
  }

  return properties;
}

function compactAttributes(properties) {
  return Object.fromEntries(
    Object.entries(properties)
      .map(([key, value]) => {
        const text = stringValue(value).replace(/\s+/g, " ").trim();
        if (!text) return undefined;
        return [key, text.length > 240 ? `${text.slice(0, 237)}...` : text];
      })
      .filter(Boolean)
      .slice(0, 24)
  );
}

function getFeatureName(feature, properties) {
  return (
    getProperty(properties, [
      "Name",
      "name",
      "title",
      "bez",
      "bezeichnung",
      "planname",
      "layer"
    ]) ||
    stringValue(feature?.name) ||
    ""
  );
}

function getSourceLayer(feature) {
  return stringValue(
    feature?._catalogItem?.name ||
      feature?.catalogItem?.name ||
      feature?.entityCollection?.owner?.name ||
      feature?.cesiumEntity?.entityCollection?.owner?.name ||
      feature?.imageryLayer?.imageryProvider?.layers
  );
}

function featureSummary(sourceLayer, featureName, attributes) {
  if (featureName) return featureName;
  const firstAttributes = Object.entries(attributes)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
  return firstAttributes || `${sourceLayer || "Selected layer"} attributes`;
}

function cartesianToLatLon(position) {
  if (!position) return undefined;

  try {
    const cartographic = Ellipsoid.WGS84.cartesianToCartographic(position);
    if (!cartographic) return undefined;

    return {
      latitude: CesiumMath.toDegrees(cartographic.latitude),
      longitude: CesiumMath.toDegrees(cartographic.longitude)
    };
  } catch {
    return undefined;
  }
}

function getFeatureCoordinates(feature, terria, currentTime, properties) {
  const latitudeFromProperty = getProperty(properties, ["latitude", "lat"]);
  const longitudeFromProperty = getProperty(properties, [
    "longitude",
    "lon",
    "lng"
  ]);
  if (latitudeFromProperty && longitudeFromProperty) {
    const latitude = Number(latitudeFromProperty);
    const longitude = Number(longitudeFromProperty);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return undefined;
    }

    return {
      latitude,
      longitude
    };
  }

  const featurePosition =
    typeof feature?.position?.getValue === "function"
      ? feature.position.getValue(currentTime)
      : feature?.position;

  return cartesianToLatLon(
    featurePosition || terria?.pickedFeatures?.pickPosition || undefined
  );
}

function selectedFeatureContext(viewState) {
  const terria = viewState?.terria;
  const pickedFeatures = terria?.pickedFeatures;
  const currentTime = terria?.timelineClock?.currentTime;
  const features = [
    terria?.selectedFeature,
    ...(pickedFeatures?.features || [])
  ].filter(Boolean);
  const uniqueFeatures = [...new Set(features)];

  if (uniqueFeatures.length === 0) {
    return {
      coordinates: cartesianToLatLon(pickedFeatures?.pickPosition),
      selectedFeatureName: "",
      factualLayerInfo: []
    };
  }

  const factualLayerInfo = uniqueFeatures
    .map((feature) => {
      const properties = getFeatureProperties(feature, currentTime);
      const attributes = compactAttributes(properties);
      const sourceLayer = getSourceLayer(feature) || "Selected map feature";
      const featureName = getFeatureName(feature, properties);

      return {
        sourceLayer,
        sourceService: stringValue(feature?._catalogItem?.url),
        featureName,
        attributes,
        summary: featureSummary(sourceLayer, featureName, attributes)
      };
    })
    .filter(
      (info) =>
        info.featureName ||
        Object.keys(info.attributes).length > 0 ||
        info.sourceLayer !== "Selected map feature"
    );

  const primaryFeature = uniqueFeatures.find((feature) => {
    const properties = getFeatureProperties(feature, currentTime);
    return getFeatureCoordinates(feature, terria, currentTime, properties);
  });
  const primaryProperties = primaryFeature
    ? getFeatureProperties(primaryFeature, currentTime)
    : {};
  const coordinates = primaryFeature
    ? getFeatureCoordinates(
        primaryFeature,
        terria,
        currentTime,
        primaryProperties
      )
    : cartesianToLatLon(pickedFeatures?.pickPosition);

  return {
    coordinates,
    selectedFeatureName:
      getFeatureName(primaryFeature, primaryProperties) ||
      factualLayerInfo[0]?.featureName ||
      factualLayerInfo[0]?.summary ||
      "",
    factualLayerInfo
  };
}

function ResultList({ title, items, emptyText }) {
  return (
    <>
      <div style={styles.sectionTitle}>{title}</div>
      {items.length > 0 ? (
        <ul style={styles.list}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={styles.note}>{emptyText}</p>
      )}
    </>
  );
}

ResultList.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  emptyText: PropTypes.string.isRequired
};

export function InvestorIntelligencePanel({ viewState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisPoint, setAnalysisPoint] = useState(DEFAULT_ANALYSIS_POINT);
  const [marketValueSignal, setMarketValueSignal] = useState("unknown");
  const [legalPlanningSignal, setLegalPlanningSignal] = useState("unknown");
  const [residentialQualitySignal, setResidentialQualitySignal] =
    useState("unknown");
  const [strategicLandUseSignal, setStrategicLandUseSignal] =
    useState("unknown");
  const [transitObserved, setTransitObserved] = useState(false);
  const [preservationAreaObserved, setPreservationAreaObserved] =
    useState(false);
  const [floodOrWaterRiskObserved, setFloodOrWaterRiskObserved] =
    useState(false);
  const [
    noiseOrEnvironmentalRiskObserved,
    setNoiseOrEnvironmentalRiskObserved
  ] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [coordinateSource, setCoordinateSource] = useState(
    "Default Munich center"
  );
  const [selectedFeatureName, setSelectedFeatureName] = useState("");
  const [factualLayerInfo, setFactualLayerInfo] = useState([]);
  const [factualLayerMessage, setFactualLayerMessage] = useState(
    "Select an official layer feature and load it here, or use the map center/manual coordinates."
  );
  const [areaReport, setAreaReport] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [useLocalAi, setUseLocalAi] = useState(false);
  const [ollamaModel, setOllamaModel] = useState("llama3.1");
  const [aiExplanation, setAiExplanation] = useState("");

  const dropdownTheme = useMemo(() => ({ icon: "chart" }), []);

  const setPointValue = (key, value) => {
    setAnalysisPoint((current) => ({ ...current, [key]: value }));
    setCoordinateSource("Manual coordinates");
    setSelectedFeatureName("");
  };

  const loadSelectedFeatureContext = async () => {
    const pickedFeatures = viewState.terria?.pickedFeatures;

    if (pickedFeatures?.allFeaturesAvailablePromise) {
      await pickedFeatures.allFeaturesAvailablePromise;
    }

    return selectedFeatureContext(viewState);
  };

  const handleUseSelectedFeature = async () => {
    try {
      const context = await loadSelectedFeatureContext();
      if (!context.coordinates) {
        setMessage(
          "Select a map feature first, or enter latitude/longitude manually."
        );
        setFactualLayerMessage(
          "No selected feature coordinates are available yet."
        );
        return;
      }

      setAnalysisPoint((current) => ({
        ...current,
        latitude: context.coordinates.latitude.toFixed(6),
        longitude: context.coordinates.longitude.toFixed(6)
      }));
      setCoordinateSource(
        context.selectedFeatureName
          ? `Selected map feature: ${context.selectedFeatureName}`
          : "Selected map feature"
      );
      setSelectedFeatureName(context.selectedFeatureName);
      setFactualLayerInfo(context.factualLayerInfo);
      setFactualLayerMessage(
        context.factualLayerInfo.length
          ? `Loaded ${context.factualLayerInfo.length} factual layer record(s) from the selected feature.`
          : "Selected feature coordinates loaded. No feature attributes were exposed by the active layer."
      );
      setMessage("Selected feature loaded for analysis.");
      setAreaReport("");
      setReportMessage("");
    } catch {
      setMessage(
        "Selected map feature details could not be loaded. Try clicking the feature again or use manual coordinates."
      );
    }
  };

  const handleRefreshFactualLayerInfo = async () => {
    try {
      const context = await loadSelectedFeatureContext();
      setFactualLayerInfo(context.factualLayerInfo);
      setSelectedFeatureName(context.selectedFeatureName);
      setFactualLayerMessage(
        context.factualLayerInfo.length
          ? `Loaded ${context.factualLayerInfo.length} factual layer record(s) from the selected feature.`
          : "No selected feature attributes are available. Terria may not expose GetFeatureInfo details for the clicked layer."
      );
      if (context.selectedFeatureName) {
        setCoordinateSource(
          `Selected map feature: ${context.selectedFeatureName}`
        );
      }
      setAreaReport("");
      setReportMessage("");
    } catch {
      setFactualLayerMessage(
        "Selected feature details could not be loaded. Try clicking the feature again."
      );
    }
  };

  const handleScoreArea = async () => {
    setBusy(true);
    setMessage("");
    setAiExplanation("");

    try {
      const input = {
        latitude: parseCoordinate(analysisPoint.latitude, 48.13743),
        longitude: parseCoordinate(analysisPoint.longitude, 11.57549),
        radiusKm: Math.max(0.1, parseCoordinate(analysisPoint.radiusKm, 1.0)),
        coordinateSource,
        selectedFeatureName,
        marketValueSignal,
        legalPlanningSignal,
        residentialQualitySignal,
        strategicLandUseSignal,
        transitObserved,
        preservationAreaObserved,
        floodOrWaterRiskObserved,
        noiseOrEnvironmentalRiskObserved,
        factualLayerInfo
      };
      const demandDrivers = await countDemandDrivers(input);
      const nextResult = scoreInvestorSignal(input, demandDrivers);
      setResult(nextResult);
      setAreaReport("");
      setReportMessage("");
      setMessage(
        "Derived investor signal calculated from local demand-driver data and selected market, legal-planning, residential-quality, and risk assumptions."
      );
    } catch (error) {
      setMessage(`Could not calculate investor signal: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleLocalAiRewrite = async () => {
    if (!result) {
      setMessage("Run Score Area before using local AI.");
      return;
    }

    if (!useLocalAi) {
      setMessage("Enable local AI first. Rule-based explanation is active.");
      return;
    }

    setBusy(true);
    setMessage("");
    setAiExplanation("");

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          prompt: [
            "Rewrite this real-estate investor analysis in clear practical language.",
            "Do not add facts. Keep the legal/investment advice disclaimer.",
            result.explanation,
            `Positive drivers: ${result.positiveDrivers.join("; ")}`,
            `Risk flags: ${result.riskFlags.join("; ")}`,
            `Next steps: ${result.nextSteps.join("; ")}`
          ].join("\n\n")
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}`);
      }

      const data = await response.json();
      setAiExplanation(data.response || "");
      setMessage("Local AI rewrite generated with Ollama.");
    } catch {
      setMessage("Using rule-based explanation. Local AI unavailable.");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateAreaReport = () => {
    if (!result) {
      setReportMessage("Run Score Area before generating a report.");
      return;
    }

    setAreaReport(result.reportText);
    setReportMessage("Area report generated locally.");
  };

  const handleCopyReport = async () => {
    const text = areaReport || result?.reportText || "";
    if (!text) {
      setReportMessage("Generate a report first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setReportMessage("Report copied to clipboard.");
    } catch {
      setReportMessage(
        "Clipboard copy was blocked. The report text remains visible for manual copy."
      );
    }
  };

  const handleDownloadReport = () => {
    const text = areaReport || result?.reportText || "";
    if (!text) {
      setReportMessage("Generate a report first.");
      return;
    }

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `munich-real-estate-area-report-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setReportMessage("Report exported as Markdown.");
  };

  return (
    <MenuPanel
      theme={dropdownTheme}
      btnText="Investor Intelligence"
      btnTitle="Investor Intelligence"
      viewState={viewState}
      smallScreen={viewState.useSmallScreenInterface}
      isOpen={isOpen}
      onOpenChanged={setIsOpen}
      modalWidth={430}
      showDropdownInCenter
    >
      {isOpen && (
        <div style={styles.panel} data-testid="investor-intelligence-panel">
          <h2 style={styles.header}>Investor Intelligence</h2>
          <p style={styles.warning}>
            Derived investor signal based on market/value, legal-planning,
            residential-quality, restriction, strategic land-use, and
            demand-driver context. FNP is broad strategic context only. This is
            not legal, tax, or investment advice. Verify with official planning
            documents before making decisions.
          </p>

          <details style={styles.details}>
            <summary style={styles.summary}>Layer explanation cards</summary>
            <div style={styles.cardGrid}>
              {LAYER_EXPLANATIONS.map(([title, text]) => (
                <div key={title} style={styles.infoCard}>
                  <p style={styles.cardTitle}>{title}</p>
                  <p style={styles.note}>{text}</p>
                </div>
              ))}
            </div>
          </details>

          <details style={styles.details}>
            <summary style={styles.summary}>Real Estate Legend</summary>
            <p style={styles.note}>
              German planning terms translated into plain English and practical
              investor interpretation.
            </p>
            {REAL_ESTATE_LEGEND.map(([term, english, interpretation]) => (
              <div key={term} style={styles.legendRow}>
                <span style={styles.legendTerm}>{term}</span>
                <span>{english}</span>
                <span>{interpretation}</span>
              </div>
            ))}
          </details>

          <div style={styles.sectionTitle}>Analysis Area</div>
          <div style={styles.grid}>
            <label style={styles.label}>
              Latitude
              <input
                style={styles.input}
                value={analysisPoint.latitude}
                onChange={(event) =>
                  setPointValue("latitude", event.target.value)
                }
              />
            </label>
            <label style={styles.label}>
              Longitude
              <input
                style={styles.input}
                value={analysisPoint.longitude}
                onChange={(event) =>
                  setPointValue("longitude", event.target.value)
                }
              />
            </label>
            <label style={styles.label}>
              Radius km
              <input
                style={styles.input}
                value={analysisPoint.radiusKm}
                onChange={(event) =>
                  setPointValue("radiusKm", event.target.value)
                }
              />
            </label>
          </div>
          <p style={styles.note}>
            Source: {coordinateSource}
            {selectedFeatureName ? ` (${selectedFeatureName})` : ""}
          </p>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.button}
              onClick={handleUseSelectedFeature}
            >
              Use Selected Feature
            </button>
            <button
              type="button"
              style={styles.button}
              onClick={handleRefreshFactualLayerInfo}
            >
              Refresh Factual Layer Info
            </button>
          </div>
          <p style={styles.message}>{factualLayerMessage}</p>

          <div style={styles.sectionTitle}>Clicked / Area Intelligence</div>
          {factualLayerInfo.length > 0 ? (
            <div style={styles.cardGrid}>
              {factualLayerInfo.map((info, index) => (
                <div
                  key={`${info.sourceLayer}-${info.featureName || index}`}
                  style={styles.infoCard}
                >
                  <p style={styles.cardTitle}>
                    {info.sourceLayer}
                    {info.featureName ? `: ${info.featureName}` : ""}
                  </p>
                  <p style={styles.note}>{info.summary}</p>
                  <ul style={styles.list}>
                    {Object.entries(info.attributes)
                      .slice(0, 8)
                      .map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.note}>
              No factual layer attributes loaded yet. Click a visible official
              layer feature, then use selected feature or refresh factual info.
              If the service does not expose GetFeatureInfo, use the manual
              observations below.
            </p>
          )}

          <div style={styles.sectionTitle}>Manual Source Observations</div>
          <p style={styles.note}>
            Use official layers as source context. The score is derived; it does
            not read parcel permission or exact property value from WMS pixels.
          </p>
          <label style={styles.label}>
            Market & land value signal
            <select
              style={styles.input}
              value={marketValueSignal}
              onChange={(event) => setMarketValueSignal(event.target.value)}
            >
              {MARKET_VALUE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Legal planning signal
            <select
              style={styles.input}
              value={legalPlanningSignal}
              onChange={(event) => setLegalPlanningSignal(event.target.value)}
            >
              {LEGAL_PLANNING_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Residential quality signal
            <select
              style={styles.input}
              value={residentialQualitySignal}
              onChange={(event) =>
                setResidentialQualitySignal(event.target.value)
              }
            >
              {RESIDENTIAL_QUALITY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Strategic FNP context
            <select
              style={styles.input}
              value={strategicLandUseSignal}
              onChange={(event) =>
                setStrategicLandUseSignal(event.target.value)
              }
            >
              {STRATEGIC_LAND_USE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={transitObserved}
              onChange={(event) => setTransitObserved(event.target.checked)}
            />
            Transit or strong public-transport access appears nearby.
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={preservationAreaObserved}
              onChange={(event) =>
                setPreservationAreaObserved(event.target.checked)
              }
            />
            Erhaltungssatzung / preservation area appears visible.
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={floodOrWaterRiskObserved}
              onChange={(event) =>
                setFloodOrWaterRiskObserved(event.target.checked)
              }
            />
            Flood, water, or drainage constraint appears visible.
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={noiseOrEnvironmentalRiskObserved}
              onChange={(event) =>
                setNoiseOrEnvironmentalRiskObserved(event.target.checked)
              }
            />
            Noise, environmental, green, or protected-area constraint appears
            visible.
          </label>

          <div style={styles.actions}>
            <button
              type="button"
              style={{ ...styles.button, ...styles.primaryButton }}
              disabled={busy}
              onClick={handleScoreArea}
              data-testid="score-investor-area-button"
            >
              {busy ? "Scoring..." : "Score Area"}
            </button>
          </div>

          {message ? <p style={styles.message}>{message}</p> : null}

          {result ? (
            <div style={styles.resultBox}>
              <div style={styles.scoreRow}>
                <div>
                  <div style={styles.signalLabel}>{result.label}</div>
                  <p style={styles.note}>Derived investor signal</p>
                </div>
                <div style={styles.scoreBadge}>{result.score}</div>
              </div>

              <div style={styles.sectionTitle}>Explanation</div>
              <p style={styles.note}>{aiExplanation || result.explanation}</p>

              <div style={styles.sectionTitle}>Sub-scores</div>
              <div style={styles.subScoreGrid}>
                {Object.entries(result.subScores).map(([key, value]) => (
                  <div key={key} style={styles.subScore}>
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (letter) => letter.toUpperCase())}
                    <span style={styles.subScoreValue}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={styles.sectionTitle}>Suggested Thesis</div>
              <p style={styles.note}>{result.suggestedThesis}</p>

              <ResultList
                title="Positive Drivers"
                items={result.positiveDrivers}
                emptyText="No strong positive drivers found in the selected radius."
              />
              <ResultList
                title="Risk Flags"
                items={result.riskFlags}
                emptyText="No risk flags selected or detected by the local rules."
              />
              <ResultList
                title="Data Basis"
                items={result.dataBasis}
                emptyText="No data basis available."
              />
              <ResultList
                title="Next Research Steps"
                items={result.nextSteps}
                emptyText="No next steps available."
              />

              <div style={styles.sectionTitle}>Demand-Driver Counts</div>
              <p style={styles.note}>
                Counts are calculated from the selected point/source within{" "}
                {analysisPoint.radiusKm} km using local demand-driver GeoJSON
                files.
              </p>
              <ul style={styles.list}>
                {result.demandDrivers.map((driver) => (
                  <li key={driver.key}>
                    {driver.label}: {driver.count} ({driver.sourceType})
                  </li>
                ))}
              </ul>

              <div style={styles.sectionTitle}>Factual Layer Info</div>
              {result.factualLayerInfo.length > 0 ? (
                <ul style={styles.list}>
                  {result.factualLayerInfo.map((info, index) => (
                    <li key={`${info.sourceLayer}-${index}`}>
                      {info.sourceLayer}: {info.featureName || info.summary}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.note}>
                  No clicked feature attributes were available for this score.
                  The score still uses manual observations and demand-driver
                  counts.
                </p>
              )}

              <div style={styles.sectionTitle}>Area Report</div>
              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.button}
                  onClick={handleGenerateAreaReport}
                >
                  Generate Area Report
                </button>
                <button
                  type="button"
                  style={styles.button}
                  onClick={handleCopyReport}
                >
                  Copy Report
                </button>
                <button
                  type="button"
                  style={styles.button}
                  onClick={handleDownloadReport}
                >
                  Export Markdown
                </button>
              </div>
              {reportMessage ? (
                <p style={styles.message}>{reportMessage}</p>
              ) : null}
              <textarea
                readOnly
                style={{
                  ...styles.input,
                  ...styles.textarea,
                  ...styles.reportBox
                }}
                value={areaReport || result.reportText}
              />

              <div style={styles.sectionTitle}>Optional Local AI</div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useLocalAi}
                  onChange={(event) => setUseLocalAi(event.target.checked)}
                />
                Use local AI explanation if Ollama is available.
              </label>
              <label style={styles.label}>
                Ollama model
                <input
                  style={styles.input}
                  value={ollamaModel}
                  onChange={(event) => setOllamaModel(event.target.value)}
                />
              </label>
              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.button}
                  disabled={busy}
                  onClick={handleLocalAiRewrite}
                >
                  Generate Local AI Rewrite
                </button>
              </div>
              <textarea
                readOnly
                style={{ ...styles.input, ...styles.textarea }}
                value={aiExplanation || result.explanation}
              />
            </div>
          ) : null}
        </div>
      )}
    </MenuPanel>
  );
}

InvestorIntelligencePanel.propTypes = {
  viewState: PropTypes.object.isRequired
};
