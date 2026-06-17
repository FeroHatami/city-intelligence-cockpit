import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import Ellipsoid from "terriajs-cesium/Source/Core/Ellipsoid";
import CesiumMath from "terriajs-cesium/Source/Core/Math";
import MenuPanel from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuPanel";
import {
  deleteLead,
  exportLeads,
  generateOutreach,
  getLeads,
  importLeadsFromJson,
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

const STATUS_LABELS = {
  interesting: "Interesting",
  research_later: "Research later",
  contact_soon: "Contact soon",
  contacted: "Contacted",
  meeting_booked: "Meeting booked",
  not_relevant: "Not relevant"
};

const VERIFICATION_STATUSES = [
  "unverified_osm",
  "needs_research",
  "website_checked",
  "manually_verified",
  "duplicate",
  "wrong_or_closed"
];

const OUTREACH_TEMPLATES = [
  ["english_email", "English email"],
  ["german_email", "German email"],
  ["english_linkedin", "English LinkedIn"],
  ["german_linkedin", "German LinkedIn"],
  ["phone_opener", "Phone-call opener"]
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
  data_source: "",
  verification_status: "",
  last_checked_at: "",
  verified_by: "",
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
  smallButton: {
    minHeight: 28,
    padding: "4px 8px",
    fontSize: 12
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    padding: 12,
    marginTop: 12,
    background: "rgba(255,255,255,0.06)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start"
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6
  },
  badge: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 4,
    padding: "2px 6px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    lineHeight: 1.3
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
  detailsDisclosure: {
    marginTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: 8,
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 1.4
  },
  summary: {
    cursor: "pointer",
    fontWeight: 700,
    marginBottom: 8
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(84px, 0.35fr) 1fr",
    gap: "4px 8px",
    wordBreak: "break-word"
  },
  detailLabel: {
    color: "rgba(255,255,255,0.62)"
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
  exportScopeText: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 1.35
  },
  warning: {
    margin: "0 0 8px",
    color: "#ffe3a3",
    fontSize: 12,
    lineHeight: 1.35
  },
  hiddenInput: {
    display: "none"
  },
  empty: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 1.45
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
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value))
    return value.map(stringValue).filter(Boolean).join(", ");
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

function getAddress(properties) {
  const address = getProperty(properties, [
    "Address",
    "address",
    "full_address"
  ]);
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
  if (
    text.includes("law firm") ||
    text.includes("lawyer") ||
    text.includes("rechtsanw")
  ) {
    return "Law Firm";
  }
  if (text.includes("consult")) return "Consultant";
  if (text.includes("real estate") || text.includes("estate_agent"))
    return "Real Estate";
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
  if (
    text.includes("clinic") ||
    text.includes("doctor") ||
    text.includes("dentist")
  ) {
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

function sourceLayerForCategory(category) {
  switch (category) {
    case "Pharmacy":
      return "Munich Pharmacies";
    case "Law Firm":
      return "Munich Law Firms";
    case "Consultant":
      return "Munich Consultants";
    case "Real Estate":
      return "Munich Real Estate Offices";
    case "Insurance":
      return "Munich Insurance Offices";
    case "Government":
      return "Munich Government Offices";
    case "Company Office":
      return "Munich Company Offices";
    case "Office Building":
      return "Munich Generic Office Buildings";
    case "Office":
      return "Munich Offices — All";
    case "Clinic":
      return "Munich Clinics";
    case "Coworking":
      return "Munich Coworking Spaces";
    case "Restaurant":
      return "Munich Restaurants";
    default:
      return "Manual Lead";
  }
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
  const longitudeFromProperty = getProperty(properties, [
    "longitude",
    "lon",
    "lng"
  ]);
  if (latitudeFromProperty && longitudeFromProperty) {
    return { latitude: latitudeFromProperty, longitude: longitudeFromProperty };
  }

  const featurePosition =
    typeof feature?.position?.getValue === "function"
      ? feature.position.getValue(currentTime)
      : feature?.position;

  return cartesianToLatLon(
    featurePosition || terria?.pickedFeatures?.pickPosition
  );
}

function selectedFeatureToLead(viewState) {
  const terria = viewState?.terria;
  const pickedFeatures = terria?.pickedFeatures;
  const feature =
    terria?.selectedFeature ||
    pickedFeatures?.features?.find(
      (candidate) =>
        candidate?.properties || candidate?.description || candidate?.name
    ) ||
    pickedFeatures?.features?.[0];

  if (!feature) return undefined;

  const currentTime = terria?.timelineClock?.currentTime;
  const properties = getFeatureProperties(feature, currentTime);
  const rawSourceLayer = getSourceLayer(feature);
  const coordinates = getFeatureCoordinates(
    feature,
    terria,
    currentTime,
    properties
  );
  const category = inferCategory(
    getProperty(properties, ["Category", "category"]),
    rawSourceLayer,
    getProperty(properties, ["Office Type", "office_type", "office"])
  );
  const sourceLayer = rawSourceLayer || sourceLayerForCategory(category);

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
    osm_id:
      getProperty(properties, ["Osm Id", "OSM ID", "osm_id", "osm:id"]) ||
      feature.id ||
      "",
    osm_type: getProperty(properties, [
      "Osm Type",
      "OSM Type",
      "osm_type",
      "osm:type"
    ]),
    source: getProperty(properties, ["Source", "source"]),
    source_layer: sourceLayer,
    data_source:
      getProperty(properties, ["Data Source", "data_source"]) ||
      getProperty(properties, ["Source", "source"]),
    verification_status: getProperty(properties, [
      "Verification Status",
      "verification_status"
    ]),
    last_checked_at: getProperty(properties, [
      "Last Checked At",
      "last_checked_at"
    ]),
    verified_by: getProperty(properties, ["Verified By", "verified_by"]),
    notes: getProperty(properties, ["notes", "Notes"]),
    status: "interesting"
  };
}

function sameOsmIdentity(left, right) {
  return (
    stringValue(left?.osm_id) !== "" &&
    stringValue(left?.osm_type) !== "" &&
    stringValue(left.osm_id) === stringValue(right?.osm_id) &&
    stringValue(left.osm_type).toLowerCase() ===
      stringValue(right?.osm_type).toLowerCase()
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
    lead.status,
    lead.verification_status,
    lead.verified_by,
    lead.data_source,
    lead.score_reason,
    lead.suggested_first_message
  ]
    .map(stringValue)
    .join(" ")
    .toLowerCase();
}

function numericScore(lead) {
  const score = Number(lead.opportunity_score);
  return Number.isFinite(score) ? score : undefined;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || stringValue(status).replace(/_/g, " ");
}

function verificationLabel(status) {
  return stringValue(status).replace(/_/g, " ") || "No verification status";
}

function outreachTemplateLabel(template) {
  return (
    OUTREACH_TEMPLATES.find(([value]) => value === template)?.[1] ||
    "English email"
  );
}

function statusSortIndex(status) {
  const index = STATUSES.indexOf(status);
  return index === -1 ? STATUSES.length : index;
}

function dateValue(value) {
  const timestamp = Date.parse(stringValue(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizedWebsiteUrl(value) {
  const website = stringValue(value).trim();
  if (!website) return "";
  if (/^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed.");
  }
}

function DetailRow({ label, value }) {
  if (!stringValue(value)) return null;
  return (
    <>
      <span style={styles.detailLabel}>{label}</span>
      <span>{stringValue(value)}</span>
    </>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

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
  const [verificationStatusFilter, setVerificationStatusFilter] =
    useState("all");
  const [sourceLayerFilter, setSourceLayerFilter] = useState("all");
  const [minimumScoreFilter, setMinimumScoreFilter] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [exportScope, setExportScope] = useState("all");
  const [outreachTemplateByLead, setOutreachTemplateByLead] = useState({});
  const [importJsonText, setImportJsonText] = useState("");
  const importFileInputRef = useRef(null);

  const dropdownTheme = useMemo(() => ({ icon: "download" }), []);
  const leadCounters = useMemo(
    () => ({
      total: leads.length,
      contact_soon: leads.filter((lead) => lead.status === "contact_soon")
        .length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      meeting_booked: leads.filter((lead) => lead.status === "meeting_booked")
        .length,
      manually_verified: leads.filter(
        (lead) => lead.verification_status === "manually_verified"
      ).length,
      needs_research: leads.filter(
        (lead) => lead.verification_status === "needs_research"
      ).length
    }),
    [leads]
  );
  const sourceLayerOptions = useMemo(() => {
    const layerSet = new Set(SOURCE_LAYERS);
    leads.forEach((lead) => {
      if (lead.source_layer) layerSet.add(lead.source_layer);
    });
    return Array.from(layerSet).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [leads]);

  const verificationStatusOptions = useMemo(() => {
    const statusSet = new Set(VERIFICATION_STATUSES);
    leads.forEach((lead) => {
      if (lead.verification_status) statusSet.add(lead.verification_status);
    });
    return Array.from(statusSet).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    const minimumScore =
      minimumScoreFilter === "" ? undefined : Number(minimumScoreFilter);

    const filteredLeads = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (categoryFilter !== "all" && lead.category !== categoryFilter)
        return false;
      if (
        verificationStatusFilter !== "all" &&
        lead.verification_status !== verificationStatusFilter
      ) {
        return false;
      }
      if (
        sourceLayerFilter !== "all" &&
        lead.source_layer !== sourceLayerFilter
      )
        return false;
      if (query && !leadSearchText(lead).includes(query)) return false;
      if (Number.isFinite(minimumScore)) {
        const score = numericScore(lead);
        if (score === undefined || score < minimumScore) return false;
      }
      return true;
    });

    return [...filteredLeads].sort((left, right) => {
      switch (sortMode) {
        case "highest_score":
          return (numericScore(right) ?? -1) - (numericScore(left) ?? -1);
        case "category":
          return stringValue(left.category).localeCompare(
            stringValue(right.category)
          );
        case "status":
          return (
            statusSortIndex(left.status) - statusSortIndex(right.status) ||
            stringValue(left.name).localeCompare(stringValue(right.name))
          );
        case "last_updated":
          return dateValue(right.updated_at) - dateValue(left.updated_at);
        case "newest":
        default:
          return dateValue(right.created_at) - dateValue(left.created_at);
      }
    });
  }, [
    categoryFilter,
    leads,
    minimumScoreFilter,
    searchFilter,
    sortMode,
    sourceLayerFilter,
    statusFilter,
    verificationStatusFilter
  ]);

  useEffect(() => {
    const syncLeads = () => setLeads(loadLeads());
    syncLeads();
    window.addEventListener("storage", syncLeads);
    window.addEventListener(
      "city-intelligence-cockpit.leads.changed",
      syncLeads
    );
    return () => {
      window.removeEventListener("storage", syncLeads);
      window.removeEventListener(
        "city-intelligence-cockpit.leads.changed",
        syncLeads
      );
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
    setMessage(
      `${form.id || duplicateLead ? "Updated" : "Saved"} ${savedLead.name}.`
    );
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

  const handleVerificationStatusChange = (lead, verificationStatus) => {
    updateLead(lead.id, {
      verification_status: verificationStatus,
      last_checked_at: new Date().toISOString()
    });
    setLeads(loadLeads());
    setMessage(`Updated verification status for ${lead.name}.`);
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

  const handleGenerateOutreach = (lead) => {
    const template = outreachTemplateByLead[lead.id] || "english_email";
    const outreach = generateOutreach(lead, template);
    updateLead(lead.id, outreach);
    setLeads(loadLeads());
    setMessage(
      `Generated ${outreachTemplateLabel(template)} outreach for ${lead.name}.`
    );
  };

  const handleCopyMessage = async (lead) => {
    if (!lead.suggested_first_message) {
      setMessage("Generate an outreach message first.");
      return;
    }

    try {
      await copyTextToClipboard(lead.suggested_first_message);
      setMessage(`Copied outreach message for ${lead.name}.`);
    } catch {
      setMessage("Copy failed. The message remains visible for manual copy.");
    }
  };

  const handleCopyText = async (value, label) => {
    const text = stringValue(value).trim();
    if (!text) {
      setMessage(`${label} is empty.`);
      return;
    }

    try {
      await copyTextToClipboard(text);
      setMessage(`Copied ${label.toLowerCase()}.`);
    } catch {
      setMessage(`Copy failed. ${label} remains visible for manual copy.`);
    }
  };

  const handleOpenWebsite = (lead) => {
    const website = normalizedWebsiteUrl(lead.website);
    if (!website) {
      setMessage("Website is empty.");
      return;
    }

    window.open(website, "_blank", "noopener,noreferrer");
    setMessage(`Opened website for ${lead.name}.`);
  };

  const handleExport = (format) => {
    const exportedLeads = exportScope === "filtered" ? visibleLeads : leads;
    const content = exportLeads(format, exportedLeads);
    setExportFormat(format);
    setExportPreview(content);
    setMessage(
      `Prepared ${format.toUpperCase()} export for ${
        exportScope === "filtered" ? "filtered leads" : "all saved leads"
      } (${exportedLeads.length}).`
    );
  };

  const handleBackupExport = () => {
    const content = exportLeads("json", leads);
    setExportFormat("json");
    setExportPreview(content);
    setMessage(`Prepared full JSON backup for ${leads.length} saved leads.`);
  };

  const handleImportJsonContent = (content) => {
    const summary = importLeadsFromJson(content);
    setLeads(loadLeads());
    setExportPreview("");
    setImportJsonText("");
    setMessage(
      `Imported leads JSON: ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} skipped.${
        summary.errors[0] ? ` ${summary.errors[0]}` : ""
      }`
    );
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const content = await file.text();
      handleImportJsonContent(content);
    } catch {
      setMessage(
        "Import failed. Choose a valid City Intelligence leads JSON file."
      );
    }
  };

  const handleImportPastedJson = () => {
    const content = importJsonText.trim();
    if (!content) {
      setMessage("Paste a City Intelligence leads JSON backup first.");
      return;
    }

    handleImportJsonContent(content);
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
                onChange={(event) =>
                  setFormValue("category", event.target.value)
                }
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
                onChange={(event) =>
                  setFormValue("source_layer", event.target.value)
                }
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
            <Field
              label="Data Source"
              value={form.data_source}
              onChange={(value) => setFormValue("data_source", value)}
            />
            <Field
              label="Verification Status"
              value={form.verification_status}
              onChange={(value) => setFormValue("verification_status", value)}
            />
            <Field
              label="Last Checked At"
              value={form.last_checked_at}
              onChange={(value) => setFormValue("last_checked_at", value)}
            />
            <Field
              label="Verified By"
              value={form.verified_by}
              onChange={(value) => setFormValue("verified_by", value)}
              placeholder="Local analyst"
            />
            <Field label="Status">
              <select
                style={styles.input}
                value={form.status}
                onChange={(event) => setFormValue("status", event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
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
            <button
              type="button"
              style={styles.button}
              onClick={() => setForm(emptyForm)}
            >
              Reset
            </button>
          </div>

          <div style={styles.sectionTitle}>Lead List</div>
          <p style={styles.warning}>
            Leads are stored locally in this browser. Export backups regularly.
          </p>
          <div style={styles.counterGrid} data-testid="lead-status-counters">
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.total}</span>
              <span style={styles.counterLabel}>Total leads</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>
                {leadCounters.contact_soon}
              </span>
              <span style={styles.counterLabel}>Contact soon</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>{leadCounters.contacted}</span>
              <span style={styles.counterLabel}>Contacted</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>
                {leadCounters.meeting_booked}
              </span>
              <span style={styles.counterLabel}>Meeting booked</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>
                {leadCounters.manually_verified}
              </span>
              <span style={styles.counterLabel}>Manually verified</span>
            </div>
            <div style={styles.counter}>
              <span style={styles.counterValue}>
                {leadCounters.needs_research}
              </span>
              <span style={styles.counterLabel}>Needs research</span>
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
                {status === "all" ? "All" : statusLabel(status)}
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
            <Field label="Verification Filter">
              <select
                style={styles.input}
                value={verificationStatusFilter}
                onChange={(event) =>
                  setVerificationStatusFilter(event.target.value)
                }
                data-testid="lead-verification-filter"
              >
                <option value="all">All verification statuses</option>
                {verificationStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {verificationLabel(status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Source Layer Filter">
              <select
                style={styles.input}
                value={sourceLayerFilter}
                onChange={(event) => setSourceLayerFilter(event.target.value)}
                data-testid="lead-source-layer-filter"
              >
                <option value="all">All source layers</option>
                {sourceLayerOptions.map((layer) => (
                  <option key={layer} value={layer}>
                    {layer}
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
            <Field label="Sort Leads">
              <select
                style={styles.input}
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
                data-testid="lead-sort-select"
              >
                <option value="newest">Newest first</option>
                <option value="highest_score">Highest score</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
                <option value="last_updated">Last updated</option>
              </select>
            </Field>
          </div>

          <div style={styles.grid}>
            <Field label="Export Scope">
              <select
                style={styles.input}
                value={exportScope}
                onChange={(event) => setExportScope(event.target.value)}
                data-testid="lead-export-scope-select"
              >
                <option value="all">All saved leads</option>
                <option value="filtered">Current filtered leads</option>
              </select>
            </Field>
            <p style={{ ...styles.exportScopeText, ...styles.full }}>
              Export scope:{" "}
              {exportScope === "filtered"
                ? `${visibleLeads.length} filtered lead${
                    visibleLeads.length === 1 ? "" : "s"
                  }`
                : `${leads.length} saved lead${leads.length === 1 ? "" : "s"}`}
              .
            </p>
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
            <button
              type="button"
              style={styles.button}
              onClick={handleBackupExport}
              data-testid="backup-leads-json-button"
            >
              Backup Leads JSON
            </button>
            <button
              type="button"
              style={styles.button}
              onClick={() => importFileInputRef.current?.click()}
              data-testid="import-leads-json-button"
            >
              Import Leads JSON
            </button>
            <button
              type="button"
              style={styles.button}
              onClick={() => handleExport("csv")}
            >
              Export CSV
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept="application/json,.json"
              style={styles.hiddenInput}
              onChange={handleImportBackup}
              data-testid="import-leads-json-input"
            />
          </div>
          <div style={styles.grid}>
            <Field
              as="textarea"
              label="Lead JSON Import"
              value={importJsonText}
              onChange={setImportJsonText}
              wrapperStyle={styles.full}
              placeholder="Paste a City Intelligence leads JSON backup here"
              data-testid="lead-json-import-textarea"
            />
          </div>
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.button}
              onClick={handleImportPastedJson}
              data-testid="import-pasted-leads-json-button"
            >
              Import Pasted JSON
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
                download={`city-intelligence-leads-${exportScope}.${exportFormat}`}
              >
                Download {exportFormat.toUpperCase()}
              </a>
            </div>
          )}

          {leads.length === 0 ? (
            <p style={styles.empty}>
              Select a map feature, click Import Selected Feature, then save it
              as a lead. You can also use the manual form above when a feature
              does not expose enough map data.
            </p>
          ) : visibleLeads.length === 0 ? (
            <p style={styles.empty}>No leads match the current filters.</p>
          ) : (
            visibleLeads.map((lead) => (
              <div
                key={lead.id}
                style={styles.card}
                data-testid="saved-lead-card"
              >
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.leadName}>
                      {lead.name || "Untitled lead"}
                    </h3>
                    <p style={styles.meta}>
                      {lead.category || "Uncategorized"} |{" "}
                      {lead.source_layer || "Manual Lead"}
                    </p>
                    <div style={styles.badgeRow}>
                      <span style={styles.badge}>
                        {statusLabel(lead.status)}
                      </span>
                      {lead.verification_status && (
                        <span style={styles.badge}>
                          {verificationLabel(lead.verification_status)}
                        </span>
                      )}
                      {lead.website && (
                        <span style={styles.badge}>Website</span>
                      )}
                      {lead.phone && <span style={styles.badge}>Phone</span>}
                    </div>
                  </div>
                  <div style={styles.score}>
                    {lead.opportunity_score || "-"}
                  </div>
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
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Verification">
                    <select
                      style={styles.input}
                      value={lead.verification_status || ""}
                      onChange={(event) =>
                        handleVerificationStatusChange(lead, event.target.value)
                      }
                    >
                      <option value="">No verification status</option>
                      {verificationStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {verificationLabel(status)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Verified By"
                    value={lead.verified_by}
                    onChange={(value) =>
                      handleUpdate(lead.id, { verified_by: value })
                    }
                    placeholder="Local analyst"
                  />
                  <div style={styles.full}>
                    <Field
                      as="textarea"
                      label="Notes"
                      value={lead.notes}
                      onChange={(value) =>
                        handleUpdate(lead.id, { notes: value })
                      }
                    />
                  </div>
                </div>

                <details style={styles.detailsDisclosure}>
                  <summary style={styles.summary}>Details</summary>
                  <div style={styles.detailGrid}>
                    <DetailRow label="Address" value={lead.address} />
                    <DetailRow label="Phone" value={lead.phone} />
                    <DetailRow label="Website" value={lead.website} />
                    <DetailRow
                      label="OSM"
                      value={[lead.osm_type, lead.osm_id]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <DetailRow
                      label="Source"
                      value={lead.source || lead.data_source}
                    />
                    <DetailRow label="Verified by" value={lead.verified_by} />
                    <DetailRow label="Checked" value={lead.last_checked_at} />
                    <DetailRow label="Updated" value={lead.updated_at} />
                  </div>
                </details>

                {(lead.score_reason ||
                  lead.suggested_offer ||
                  lead.suggested_first_message ||
                  lead.outreach_angle ||
                  lead.recommended_next_action ||
                  lead.risk_notes) && (
                  <div style={styles.detail}>
                    {lead.score_reason && (
                      <>
                        <strong>Reason:</strong> {lead.score_reason}
                        <br />
                      </>
                    )}
                    {lead.suggested_offer && (
                      <>
                        <strong>Offer:</strong> {lead.suggested_offer}
                        <br />
                      </>
                    )}
                    {lead.outreach_angle && (
                      <>
                        <strong>Angle:</strong> {lead.outreach_angle}
                        <br />
                      </>
                    )}
                    {lead.suggested_first_message && (
                      <>
                        <strong>First message:</strong>{" "}
                        {lead.suggested_first_message}
                        <br />
                      </>
                    )}
                    {lead.recommended_next_action && (
                      <>
                        <strong>Next:</strong> {lead.recommended_next_action}
                      </>
                    )}
                    {lead.risk_notes && (
                      <>
                        <br />
                        <strong>Risk:</strong> {lead.risk_notes}
                      </>
                    )}
                  </div>
                )}

                <div style={styles.grid}>
                  <Field label="Outreach Template">
                    <select
                      style={styles.input}
                      value={outreachTemplateByLead[lead.id] || "english_email"}
                      onChange={(event) =>
                        setOutreachTemplateByLead((current) => ({
                          ...current,
                          [lead.id]: event.target.value
                        }))
                      }
                    >
                      {OUTREACH_TEMPLATES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {lead.suggested_first_message && (
                    <div style={styles.full}>
                      <Field
                        as="textarea"
                        label="Outreach Message"
                        value={lead.suggested_first_message}
                        onChange={(value) =>
                          handleUpdate(lead.id, {
                            suggested_first_message: value
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div style={styles.actions}>
                  {lead.website && (
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.smallButton }}
                      onClick={() => handleOpenWebsite(lead)}
                    >
                      Open Website
                    </button>
                  )}
                  {lead.phone && (
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.smallButton }}
                      onClick={() => handleCopyText(lead.phone, "Phone")}
                    >
                      Copy Phone
                    </button>
                  )}
                  {lead.website && (
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.smallButton }}
                      onClick={() => handleCopyText(lead.website, "Website")}
                    >
                      Copy Website
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.smallButton }}
                    onClick={() => handleScore(lead)}
                    data-testid="score-lead-button"
                  >
                    Score Lead
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.smallButton }}
                    onClick={() => handleGenerateOutreach(lead)}
                    data-testid="generate-outreach-button"
                  >
                    Generate Outreach Message
                  </button>
                  {lead.suggested_first_message && (
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.smallButton }}
                      onClick={() => handleCopyMessage(lead)}
                      data-testid="copy-outreach-message-button"
                    >
                      Copy Message
                    </button>
                  )}
                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      ...styles.smallButton,
                      ...styles.dangerButton
                    }}
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
