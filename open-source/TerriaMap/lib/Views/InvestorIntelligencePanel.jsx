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

const PLANNING_SIGNAL_OPTIONS = [
  ["unknown", "Unknown / verify manually"],
  ["commercial_or_mixed_use", "Commercial or mixed-use visible"],
  ["residential_weak_commercial", "Mostly residential / weak commercial"],
  ["green_open_protected", "Green, open, or protected land visible"]
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
  }
};

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

function selectedFeatureCoordinates(viewState) {
  const terria = viewState?.terria;
  const pickedFeatures = terria?.pickedFeatures;
  const feature =
    terria?.selectedFeature ||
    pickedFeatures?.features?.find((candidate) => candidate?.position) ||
    pickedFeatures?.features?.[0];
  const currentTime = terria?.timelineClock?.currentTime;
  const featurePosition =
    typeof feature?.position?.getValue === "function"
      ? feature.position.getValue(currentTime)
      : feature?.position;

  return cartesianToLatLon(
    featurePosition || pickedFeatures?.pickPosition || undefined
  );
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
  const [planningSignal, setPlanningSignal] = useState("unknown");
  const [transitObserved, setTransitObserved] = useState(false);
  const [floodOrWaterRiskObserved, setFloodOrWaterRiskObserved] =
    useState(false);
  const [
    noiseOrEnvironmentalRiskObserved,
    setNoiseOrEnvironmentalRiskObserved
  ] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [useLocalAi, setUseLocalAi] = useState(false);
  const [ollamaModel, setOllamaModel] = useState("llama3.1");
  const [aiExplanation, setAiExplanation] = useState("");

  const dropdownTheme = useMemo(() => ({ icon: "chart" }), []);

  const setPointValue = (key, value) => {
    setAnalysisPoint((current) => ({ ...current, [key]: value }));
  };

  const handleUseSelectedFeature = () => {
    const coordinates = selectedFeatureCoordinates(viewState);
    if (!coordinates) {
      setMessage(
        "Select a map feature first, or enter latitude/longitude manually."
      );
      return;
    }

    setAnalysisPoint((current) => ({
      ...current,
      latitude: coordinates.latitude.toFixed(6),
      longitude: coordinates.longitude.toFixed(6)
    }));
    setMessage("Selected feature coordinates loaded for analysis.");
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
        planningSignal,
        transitObserved,
        floodOrWaterRiskObserved,
        noiseOrEnvironmentalRiskObserved
      };
      const demandDrivers = await countDemandDrivers(input);
      const nextResult = scoreInvestorSignal(input, demandDrivers);
      setResult(nextResult);
      setMessage(
        "Derived investor signal calculated from local demand-driver data and selected planning/risk assumptions."
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
      setMessage(
        "Using rule-based explanation. Local AI unavailable or blocked."
      );
    } finally {
      setBusy(false);
    }
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
            Derived investor signal based on available planning and
            demand-driver data. This is not legal, tax, or investment advice.
            Verify with official planning documents before making decisions.
          </p>

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

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.button}
              onClick={handleUseSelectedFeature}
            >
              Use Selected Feature
            </button>
          </div>

          <div style={styles.sectionTitle}>Manual Planning Signals</div>
          <label style={styles.label}>
            Official planning-layer signal
            <select
              style={styles.input}
              value={planningSignal}
              onChange={(event) => setPlanningSignal(event.target.value)}
            >
              {PLANNING_SIGNAL_OPTIONS.map(([value, label]) => (
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
              <ul style={styles.list}>
                {result.demandDrivers.map((driver) => (
                  <li key={driver.key}>
                    {driver.label}: {driver.count} ({driver.sourceType})
                  </li>
                ))}
              </ul>

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
