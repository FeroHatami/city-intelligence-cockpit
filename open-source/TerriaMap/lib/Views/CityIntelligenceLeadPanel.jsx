import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import Ellipsoid from "terriajs-cesium/Source/Core/Ellipsoid";
import CesiumMath from "terriajs-cesium/Source/Core/Math";
import MenuPanel from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuPanel";
import {
  deleteLead,
  exportLeads,
  getLeads,
  saveLead,
  scoreLead,
  updateLead
} from "../CityIntelligence/leads";

const STATUSES = [
  "interesting",
  "research_later",
  "contact_soon",
  "contacted",
  "meeting_booked",
  "not_relevant"
];

const CATEGORIES = [
  "Pharmacy",
  "Office",
  "Law Firm",
  "Consultant",
  "Real Estate",
  "Insurance",
  "Government",
  "Company Office",
  "Office Building",
  "Clinic",
  "Coworking",
  "Restaurant",
  "Other"
];

const SOURCE_LAYERS = [
  "Munich Pharmacies",
  "Munich Offices — All",
  "Munich Law Firms",
  "Munich Consultants",
  "Munich Real Estate Offices",
  "Munich Insurance Offices",
  "Munich Government Offices",
  "Munich Company Offices",
  "Munich Generic Office Buildings",
  "Munich Other Offices",
  "Munich Clinics",
  "Munich Coworking Spaces",
  "Munich Restaurants",
  "Manual Lead"
];

const emptyForm = {
  name: "",
  category: "Pharmacy",
  address: "",
  phone: "",
  website: "",
  latitude: "",
  longitude: "",
  osm_id: "",
  osm_type: "",
  source: "",
  source_layer: "Munich Pharmacies",
  notes: "",
  status: "interesting"
};

const styles = {
  panel: {
    width: 460,
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
  full: {
    gridColumn: "1 / -1"
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
  textarea: {
    minHeight: 64,
    resize: "vertical"
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
  activeButton: {
    background: "#fff",
    borderColor: "#fff",
    color: "#111"
  },
  dangerButton: {
    borderColor: "rgba(255,120,120,0.62)",
    color: "#ffd7d7"
  },
  counterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    marginTop: 8
  },
  counter: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 4,
    padding: 8,
    background: "rgba(255,255,255,0.06)"
  },
  counterValue: {
    display: "block",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.1
  },
  counterLabel: {
    display: "block",
    marginTop: 2,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    lineHeight: 1.25
  },
  card: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    background: "rgba(255,255,255,0.06)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start"
  },
  leadName: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.3
  },
  meta: {
    margin: "2px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 1.35
  },
  score: {
    minWidth: 42,
    borderRadius: 4,
    padding: "4px 6px",
    textAlign: "center",
    background: "rgba(47,128,237,0.24)",
    fontWeight: 700
  },
  detail: {
    marginTop: 8,
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 1.4
  },
  message: {
    marginTop: 10,
    color: "#b6e3ff",
    fontSize: 12
  },
  exportPreview: {
    width: "100%",
    minHeight: 120,
    marginTop: 8,
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: 4,
    background: "rgba(0,0,0,0.22)",
    color: "#fff",
    padding: 8,
    font: "12px monospace"
  },
  downloadLink: {
    color: "#b6e3ff",
    fontSize: 12
  },
  empty: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 13
  }
};

function loadLeads() {
  return getLeads();
}

function exportDataUri(format, content) {
  const type = format === "json" ? "application/json" : "text/csv";
  return `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
}

function stringValue(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean).join(", ");
  return "";
}

function normalizedKey(key) {
  return String(key).toLowerCase().replace(/[\s_:-]+/g, "");
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

function getAddress(properties) {
  const address = getProperty(properties, ["Address", "address", "full_address"]);
  if (address) return address;

  const street = getProperty(properties, ["addr:street", "addr_street"]);
  const houseNumber = getProperty(properties, [
    "addr:housenumber",
    "addr_housenumber"
  ]);
  const postcode = getProperty(properties, ["addr:postcode", "addr_postcode"]);
  const city = getProperty(properties, ["addr:city", "addr_city"]);
  const streetLine = [street, houseNumber].filter(Boolean).join(" ");
  const cityLine = [postcode, city].filter(Boolean).join(" ");
  return [streetLine, cityLine].filter(Boolean).join(", ");
}

function inferOfficeSubtypeCategory(text) {
  if (text.includes("law firm") || text.includes("lawyer") || text.includes("rechtsanw")) {
    return "Law Firm";
  }
  if (text.includes("consult")) return "Consultant";
  if (text.includes("real estate") || text.includes("estate_agent")) return "Real Estate";
  if (text.includes("insurance")) return "Insurance";
  if (text.includes("government")) return "Government";
  if (
    text.includes("company office") ||
    text.includes("company offices") ||
    text.trim() === "company" ||
    text.endsWith(" company")
  ) {
    return "Company Office";
  }
  if (text.includes("office building") || text.includes("office_building")) {
    return "Office Building";
  }
  return "";
}

function inferCategory(category, sourceLayer, officeType) {
  const categoryText = stringValue(category).trim();
  const text = `${sourceLayer} ${officeType}`.toLowerCase();
  const officeSubtype = inferOfficeSubtypeCategory(text);
  if (officeSubtype) return officeSubtype;
  if (categoryText) return categoryText;

  if (text.includes("pharmac")) return "Pharmacy";
  if (text.includes("office")) return "Office";
  if (text.includes("clinic") || text.includes("doctor") || text.includes("dentist")) {
    return "Clinic";
  }
  if (text.includes("cowork")) return "Coworking";
  if (text.includes("restaurant")) return "Restaurant";
  return "Other";
}

function getSourceLayer(feature) {
  return stringValue(
    feature?._catalogItem?.name ||
      feature?.entityCollection?.owner?.name ||
      feature?.cesiumEntity?.entityCollection?.owner?.name
  );
}

function cartesianToLatLon(position) {
  if (!position) return {};

  try {
    const cartographic = Ellipsoid.WGS84.cartesianToCartographic(position);
    if (!cartographic) return {};

    return {
      latitude: CesiumMath.toDegrees(cartographic.latitude),
      longitude: CesiumMath.toDegrees(cartographic.longitude)
    };
  } catch {
    return {};
  }
}

function getFeatureCoordinates(feature, terria, currentTime, properties) {
  const latitudeFromProperty = getProperty(properties, ["latitude", "lat"]);
  const longitudeFromProperty = getProperty(properties, ["longitude", "lon", "lng"]);
  if (latitudeFromProperty && longitudeFromProperty) {
    return { latitude: latitudeFromProperty, longitude: longitudeFromProperty };
  }

  const featurePosition =
    typeof feature?.position?.getValue === "function"
      ? feature.position.getValue(currentTime)
      : feature?.position;

  return cartesianToLatLon(featurePosition || terria?.pickedFeatures?.pickPosition);
}

function selectedFeatureToLead(viewState) {
  const terria = viewState?.terria;
  const pickedFeatures = terria?.pickedFeatures;
  const feature =
    terria?.selectedFeature ||
    pickedFeatures?.features?.find(
      (candidate) => candidate?.properties || candidate?.description || candidate?.name
    ) ||
    pickedFeatures?.features?.[0];

  if (!feature) return undefined;

  const currentTime = terria?.timelineClock?.currentTime;
  const properties = getFeatureProperties(feature, currentTime);
  const sourceLayer = getSourceLayer(feature) || "Manual Lead";
  const coordinates = getFeatureCoordinates(feature, terria, currentTime, properties);
  const category = inferCategory(
    getProperty(properties, ["Category", "category"]),
    sourceLayer,
    getProperty(properties, ["Office Type", "office_type", "office"])
  );

  return {
    name:
      getProperty(properties, ["Name", "name", "title"]) ||
      stringValue(feature.name) ||
      "Selected feature",
    category,
    address: getAddress(properties),
    phone: getProperty(properties, [
      "Phone",
      "phone",
      "contact:phone",
      "contact_phone",
      "contact:mobile",
      "mobile"
    ]),
    website: getProperty(properties, [
      "Website",
      "website",
      "contact:website",
      "contact_website",
      "url"
    ]),
    latitude: coordinates.latitude ?? "",
    longitude: coordinates.longitude ?? "",
    osm_id: getProperty(properties, ["Osm Id", "OSM ID", "osm_id", "osm:id"]) || feature.id || "",
    osm_type: getProperty(properties, ["Osm Type", "OSM Type", "osm_type", "osm:type"]),
    source: getProperty(properties, ["Source", "source"]),
    source_layer: sourceLayer,
    notes: getProperty(properties, ["notes", "Notes"]),
    status: "interesting"
  };
}

function sameOsmIdentity(left, right) {
  return (
    stringValue(left?.osm_id) !== "" &&
    stringValue(left?.osm_type) !== "" &&
    stringValue(left.osm_id) === stringValue(right?.osm_id) &&
    stringValue(left.osm_type).toLowerCase() === stringValue(right?.osm_type).toLowerCase()
  );
}

function findDuplicateLead(leads, lead) {
  return leads.find((existingLead) => sameOsmIdentity(existingLead, lead));
}

function formFromLead(lead) {
  return {
    ...emptyForm,
    ...lead,
    latitude: stringValue(lead.latitude),
    longitude: stringValue(lead.longitude),
    osm_id: stringValue(lead.osm_id),
    opportunity_score: lead.opportunity_score ?? ""
  };
}

function leadSearchText(lead) {
  return [
    lead.name,
    lead.category,
    lead.source_layer,
    lead.address,
    lead.phone,
    lead.website,
    lead.notes,
    lead.status
  ]
    .map(stringValue)
    .join(" ")
    .toLowerCase();
}

function numericScore(lead) {
  const score = Number(lead.opportunity_score);
  return Number.isFinite(score) ? score : undefined;
}

function Field({
  label,
  value,
  onChange,
  children,
  as = "input",
  wrapperStyle,
  ...props
}) {
  const Component = as;
  return (
    <label style={{ ...styles.label, ...wrapperStyle }}>
      <span>{label}</span>
      {children || (
        <Component
          style={{
            ...styles.input,
            ...(as === "textarea" ? styles.textarea : undefined)
          }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...props}
        />
      )}
    </label>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  children: PropTypes.node,
  as: PropTypes.string,
  wrapperStyle: PropTypes.object
};

export function CityIntelligenceLeadPanel({ viewState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [leads, setLeads] = useState([]);
  const [message, setMessage] = useState("");
  const [exportPreview, setExportPreview] = useState("");
  const [exportFormat, setExportFormat] = useState("json");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minimumScoreFilter, setMinimumScoreFilter] = useState("");

  const dropdownTheme = useMemo(() => ({ icon: "download" }), []);
  const leadCounters = useMemo(
    () => ({
      total: leads.length,
      contact_soon: leads.filter((lead) => lead.status === "contact_soon").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      meeting_booked: leads.filter((lead) => lead.status === "meeting_booked").length
    }),
    [leads]
  );
  const visibleLeads = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    const minimumScore =
      minimumScoreFilter === "" ? undefined : Number(minimumScoreFilter);

    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (categoryFilter !== "all" && lead.category !== categoryFilter) return false;
      if (query && !leadSearchText(lead).includes(query)) return false;
      if (Number.isFinite(minimumScore)) {
        const score = numericScore(lead);
        if (score === undefined || score < minimumScore) return false;
      }
      return true;
    });
  }, [categoryFilter, leads, minimumScoreFilter, searchFilter, statusFilter]);

  useEffect(() => {
    const syncLeads = () => setLeads(loadLeads());
    syncLeads();
    window.addEventListener("storage", syncLeads);
    window.addEventListener("city-intelligence-cockpit.leads.changed", syncLeads);
    return () => {
      window.removeEventListener("storage", syncLeads);
      window.removeEventListener("city-intelligence-cockpit.leads.changed", syncLeads);
    };
  }, []);

  const setFormValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setMessage("Name is required.");
      return;
    }

    const duplicateLead = findDuplicateLead(leads, form);
    const savedLead = saveLead({
      ...form,
      id: form.id || duplicateLead?.id,
      latitude: form.latitude,
      longitude: form.longitude,
      source_layer: form.source_layer || "Manual Lead"
    });
    setLeads(loadLeads());
    setForm({
      ...emptyForm,
      category: form.category,
      source_layer: form.source_layer
    });
    setMessage(`${form.id || duplicateLead ? "Updated" : "Saved"} ${savedLead.name}.`);
  };

  const handleImportSelectedFeature = async () => {
    const pickedFeatures = viewState.terria?.pickedFeatures;

    if (pickedFeatures?.allFeaturesAvailablePromise) {
      try {
        await pickedFeatures.allFeaturesAvailablePromise;
      } catch {
        setMessage("Selected map feature details could not be loaded.");
        return;
      }
    }

    const importedLead = selectedFeatureToLead(viewState);

    if (!importedLead) {
      setMessage("Select a map feature first, then import it as a lead.");
      return;
    }

    const currentLeads = loadLeads();
    const duplicateLead = findDuplicateLead(currentLeads, importedLead);
    const nextForm = duplicateLead
      ? formFromLead({
          ...importedLead,
          ...duplicateLead,
          id: duplicateLead.id,
          updated_at: importedLead.updated_at
        })
      : formFromLead(importedLead);

    setForm(nextForm);
    setLeads(currentLeads);
    setMessage(
      duplicateLead
        ? "Existing lead found for this OSM feature; loaded it for review instead of duplicating."
        : `Imported ${importedLead.name}. Review and save it as a lead.`
    );
  };

  const handleUpdate = (id, updates) => {
    updateLead(id, updates);
    setLeads(loadLeads());
  };

  const handleDelete = (id) => {
    deleteLead(id);
    setLeads(loadLeads());
    setMessage("Lead deleted.");
  };

  const handleScore = (lead) => {
    const scoring = scoreLead(lead);
    updateLead(lead.id, scoring);
    setLeads(loadLeads());
    setMessage(`Scored ${lead.name}.`);
  };

  const handleExport = (format) => {
    const content = exportLeads(format);
    setExportFormat(format);
    setExportPreview(content);
    setMessage(`Prepared ${format.toUpperCase()} export.`);
  };

  return (
    <MenuPanel
      theme={dropdownTheme}
      btnText="Saved Leads"
      btnTitle="Saved Leads"
      viewState={viewState}
      smallScreen={viewState.useSmallScreenInterface}
      isOpen={isOpen}
      onOpenChanged={setIsOpen}
      modalWidth={460}
      showDropdownInCenter
    >
      {isOpen && (
        <div style={styles.panel} data-testid="city-leads-panel">
          <h2 style={styles.header}>Saved Leads</h2>

          <div style={styles.sectionTitle}>New Lead</div>
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.button}
              onClick={handleImportSelectedFeature}
              data-testid="import-selected-feature-button"
            >
              Import Selected Feature
            </button>
          </div>
          <div style={styles.grid}>
            <Field
              label="Name"
              value={form.name}
              onChange={(value) => setFormValue("name", value)}
              data-testid="lead-name-input"
            />
            <Field label="Category">
              <select
                style={styles.input}
                value={form.category}
                onChange={(event) => setFormValue("category", event.target.value)}
                data-testid="lead-category-select"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Address"
              value={form.address}
              onChange={(value) => setFormValue("address", value)}
              wrapperStyle={styles.full}
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(value) => setFormValue("phone", value)}
            />
            <Field
              label="Website"
              value={form.website}
              onChange={(value) => setFormValue("website", value)}
            />
            <Field
              label="Latitude"
              value={form.latitude}
              onChange={(value) => setFormValue("latitude", value)}
            />
            <Field
              label="Longitude"
              value={form.longitude}
              onChange={(value) => setFormValue("longitude", value)}
            />
            <Field
              label="OSM ID"
              value={form.osm_id}
              onChange={(value) => setFormValue("osm_id", value)}
            />
            <Field
              label="OSM Type"
              value={form.osm_type}
              onChange={(value) => setFormValue("osm_type", value)}
            />
            <Field label="Source Layer">
              <select
                style={styles.input}
                value={form.source_layer}
                onChange={(event) => setFormValue("source_layer", event.target.value)}
              >
                {SOURCE_LAYERS.map((layer) => (
                  <option key={layer} value={layer}>
                    {layer}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Source"
              value={form.source}
              onChange={(value) => setFormValue("source", value)}
            />
            <Field label="Status">
              <select
                style={styles.input}
                value={form.status}
                onChange={(event) => setFormValue("status", event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <div style={styles.full}>
              <Field
                as="textarea"
                label="Notes"
                value={form.notes}
                onChange={(value) => setFormValue("notes", value)}
              />
            </div>
          </div>
          <div style={styles.actions}>
            <button
              type="button"
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={handleSave}
              data-testid="save-lead-button"
            >
              Save Lead
            </button>
            <button type="button" style={styles.button} onClick={() => setForm(emptyForm)}>
              Reset
            </button>
          </div>

          <div style={styles.sectionTitle}>Lead List</div>
          <div style={styles.counterGrid} data-testid="lead-status-counters">
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.total}</span>
              <span style={styles.counterLabel}>Total leads</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.contact_soon}</span>
              <span style={styles.counterLabel}>Contact soon</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.contacted}</span>
              <span style={styles.counterLabel}>Contacted</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.meeting_booked}</span>
              <span style={styles.counterLabel}>Meeting booked</span>
            </div>
          </div>

          <div style={styles.actions} data-testid="lead-status-tabs">
            {["all", ...STATUSES].map((status) => (
              <button
                key={status}
                type="button"
                style={{
                  ...styles.button,
                  ...(statusFilter === status ? styles.activeButton : undefined)
                }}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "All" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div style={styles.grid}>
            <Field
              label="Search Leads"
              value={searchFilter}
              onChange={setSearchFilter}
              wrapperStyle={styles.full}
              placeholder="Name, address, layer, notes"
              data-testid="lead-search-input"
            />
            <Field label="Category Filter">
              <select
                style={styles.input}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                data-testid="lead-category-filter"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Minimum Score"
              value={minimumScoreFilter}
              onChange={setMinimumScoreFilter}
              type="number"
              min="0"
              max="10"
              step="1"
              placeholder="Any"
              data-testid="lead-minimum-score-filter"
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.button}
              onClick={() => handleExport("json")}
              data-testid="export-leads-json-button"
            >
              Export JSON
            </button>
            <button type="button" style={styles.button} onClick={() => handleExport("csv")}>
              Export CSV
            </button>
          </div>

          {exportPreview && (
            <div>
              <textarea
                readOnly
                style={styles.exportPreview}
                value={exportPreview}
                aria-label="Lead export preview"
                data-testid="lead-export-preview"
              />
              <a
                style={styles.downloadLink}
                href={exportDataUri(exportFormat, exportPreview)}
                download={`city-intelligence-leads.${exportFormat}`}
              >
                Download {exportFormat.toUpperCase()}
              </a>
            </div>
          )}

          {leads.length === 0 ? (
            <p style={styles.empty}>No saved leads.</p>
          ) : visibleLeads.length === 0 ? (
            <p style={styles.empty}>No leads match the current filters.</p>
          ) : (
            visibleLeads.map((lead) => (
              <div key={lead.id} style={styles.card} data-testid="saved-lead-card">
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.leadName}>{lead.name || "Untitled lead"}</h3>
                    <p style={styles.meta}>
                      {lead.category || "Uncategorized"} | {lead.source_layer || "Manual Lead"}
                    </p>
                  </div>
                  <div style={styles.score}>{lead.opportunity_score || "-"}</div>
                </div>

                <div style={styles.grid}>
                  <Field label="Status">
                    <select
                      style={styles.input}
                      value={lead.status}
                      onChange={(event) =>
                        handleUpdate(lead.id, { status: event.target.value })
                      }
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div />
                  <div style={styles.full}>
                    <Field
                      as="textarea"
                      label="Notes"
                      value={lead.notes}
                      onChange={(value) => handleUpdate(lead.id, { notes: value })}
                    />
                  </div>
                </div>

                {lead.score_reason && (
                  <div style={styles.detail}>
                    <strong>Reason:</strong> {lead.score_reason}
                    <br />
                    <strong>Offer:</strong> {lead.suggested_offer}
                    <br />
                    {lead.suggested_first_message && (
                      <>
                        <strong>First message:</strong> {lead.suggested_first_message}
                        <br />
                      </>
                    )}
                    <strong>Next:</strong> {lead.recommended_next_action}
                    {lead.risk_notes && (
                      <>
                        <br />
                        <strong>Risk:</strong> {lead.risk_notes}
                      </>
                    )}
                  </div>
                )}

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.button}
                    onClick={() => handleScore(lead)}
                    data-testid="score-lead-button"
                  >
                    Score Lead
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.dangerButton }}
                    onClick={() => handleDelete(lead.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {message && <div style={styles.message}>{message}</div>}
        </div>
      )}
    </MenuPanel>
  );
}

CityIntelligenceLeadPanel.propTypes = {
  viewState: PropTypes.object.isRequired
};
