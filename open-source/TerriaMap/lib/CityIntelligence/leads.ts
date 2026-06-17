export const LEADS_STORAGE_KEY = "city-intelligence-cockpit.leads";

export type LeadStatus =
  | "interesting"
  | "research_later"
  | "contact_soon"
  | "contacted"
  | "meeting_booked"
  | "not_relevant";

export interface CityIntelligenceLead {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  osm_id: string | number;
  osm_type: string;
  source: string;
  source_layer: string;
  opportunity_score: string | number;
  score_reason: string;
  suggested_offer: string;
  recommended_next_action: string;
  notes: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type LeadInput = Partial<CityIntelligenceLead>;

const DEFAULT_STATUS: LeadStatus = "interesting";

const SCORE_RULES = {
  pharmacy: {
    opportunity_score: 8,
    score_reason:
      "Pharmacies often have procurement, inventory, and supplier comparison workflows that can benefit from practical automation.",
    suggested_offer: "Inventory and supplier comparison workflow audit.",
    recommended_next_action:
      "Review public contact details and prepare a pharmacy-specific operations note."
  },
  office: {
    opportunity_score: 7,
    score_reason:
      "Office organizations often have admin automation, document workflow, and lead generation opportunities.",
    suggested_offer: "Admin automation and document workflow review.",
    recommended_next_action:
      "Qualify the organization type and tailor outreach around admin or sales operations."
  },
  clinic: {
    opportunity_score: 8,
    score_reason:
      "Clinics often have appointment workflow, communication, and procurement needs with clear operational value.",
    suggested_offer: "Appointment and communication workflow assessment.",
    recommended_next_action:
      "Frame outreach around non-clinical operations and avoid patient-data assumptions."
  },
  coworking: {
    opportunity_score: 6,
    score_reason:
      "Coworking spaces can be useful partnership channels for founder networks, events, and community programming.",
    suggested_offer: "Founder network and event partnership proposal.",
    recommended_next_action:
      "Look for community or events contacts and draft a partnership-oriented note."
  },
  restaurant: {
    opportunity_score: 6,
    score_reason:
      "Restaurants often benefit from local marketing, reviews, reservations, and inventory workflow improvements.",
    suggested_offer: "Local marketing and operations quick audit.",
    recommended_next_action:
      "Check website, reservation path, and public review presence before outreach."
  },
  default: {
    opportunity_score: 5,
    score_reason:
      "This lead has basic public business data but needs manual qualification before outreach.",
    suggested_offer: "Operational workflow discovery call.",
    recommended_next_action:
      "Manually qualify the organization and choose a category-specific offer."
  }
};

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function cleanNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function cleanStatus(value: unknown): LeadStatus {
  const status = cleanString(value) as LeadStatus;
  return [
    "interesting",
    "research_later",
    "contact_soon",
    "contacted",
    "meeting_booked",
    "not_relevant"
  ].includes(status)
    ? status
    : DEFAULT_STATUS;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lead";
}

function createLeadId(lead: LeadInput) {
  const source = cleanString(lead.source_layer || lead.category || "manual");
  const osmType = cleanString(lead.osm_type);
  const osmId = cleanString(lead.osm_id);

  if (osmType && osmId) {
    return `lead-${slugify(source)}-${slugify(osmType)}-${osmId}`;
  }

  return `lead-${slugify(source)}-${Date.now()}`;
}

function normalizeLead(lead: LeadInput): CityIntelligenceLead {
  const timestamp = nowIso();
  const createdAt = cleanString(lead.created_at) || timestamp;

  return {
    id: cleanString(lead.id) || createLeadId(lead),
    name: cleanString(lead.name),
    category: cleanString(lead.category),
    address: cleanString(lead.address),
    phone: cleanString(lead.phone),
    website: cleanString(lead.website),
    latitude: cleanNumber(lead.latitude),
    longitude: cleanNumber(lead.longitude),
    osm_id: lead.osm_id ?? "",
    osm_type: cleanString(lead.osm_type),
    source: cleanString(lead.source),
    source_layer: cleanString(lead.source_layer),
    opportunity_score: lead.opportunity_score ?? "",
    score_reason: cleanString(lead.score_reason),
    suggested_offer: cleanString(lead.suggested_offer),
    recommended_next_action: cleanString(lead.recommended_next_action),
    notes: cleanString(lead.notes),
    status: cleanStatus(lead.status),
    created_at: createdAt,
    updated_at: cleanString(lead.updated_at) || timestamp
  };
}

function readStoredLeads(): CityIntelligenceLead[] {
  if (!storageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLead);
  } catch {
    return [];
  }
}

function writeStoredLeads(leads: CityIntelligenceLead[]) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  window.dispatchEvent(new CustomEvent("city-intelligence-cockpit.leads.changed"));
}

export function getLeads(): CityIntelligenceLead[] {
  return readStoredLeads();
}

export function saveLead(lead: LeadInput): CityIntelligenceLead {
  const normalizedLead = normalizeLead(lead);
  const leads = getLeads();
  const existingIndex = leads.findIndex((item) => item.id === normalizedLead.id);

  if (existingIndex >= 0) {
    leads[existingIndex] = {
      ...leads[existingIndex],
      ...normalizedLead,
      created_at: leads[existingIndex].created_at,
      updated_at: nowIso()
    };
  } else {
    leads.unshift(normalizedLead);
  }

  writeStoredLeads(leads);
  return existingIndex >= 0 ? leads[existingIndex] : normalizedLead;
}

export function updateLead(id: string, updates: LeadInput): CityIntelligenceLead | undefined {
  const leads = getLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index < 0) return undefined;

  leads[index] = normalizeLead({
    ...leads[index],
    ...updates,
    id,
    created_at: leads[index].created_at,
    updated_at: nowIso()
  });
  writeStoredLeads(leads);
  return leads[index];
}

export function deleteLead(id: string) {
  writeStoredLeads(getLeads().filter((lead) => lead.id !== id));
}

export function clearLeads() {
  writeStoredLeads([]);
}

function csvValue(value: unknown) {
  const text = cleanString(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportLeads(format: "json" | "csv" = "json") {
  const leads = getLeads();
  if (format === "json") {
    return JSON.stringify(leads, null, 2);
  }

  const fields: Array<keyof CityIntelligenceLead> = [
    "id",
    "name",
    "category",
    "address",
    "phone",
    "website",
    "latitude",
    "longitude",
    "osm_id",
    "osm_type",
    "source",
    "source_layer",
    "opportunity_score",
    "score_reason",
    "suggested_offer",
    "recommended_next_action",
    "notes",
    "status",
    "created_at",
    "updated_at"
  ];

  return [
    fields.join(","),
    ...leads.map((lead) => fields.map((field) => csvValue(lead[field])).join(","))
  ].join("\n");
}

function scoreRuleKey(lead: LeadInput): keyof typeof SCORE_RULES {
  const text = `${lead.category || ""} ${lead.source_layer || ""}`.toLowerCase();
  if (text.includes("pharmacy")) return "pharmacy";
  if (text.includes("office")) return "office";
  if (text.includes("clinic") || text.includes("doctor") || text.includes("dentist")) return "clinic";
  if (text.includes("cowork")) return "coworking";
  if (
    text.includes("restaurant") ||
    text.includes("cafe") ||
    text.includes("food") ||
    text.includes("bar") ||
    text.includes("pub")
  ) {
    return "restaurant";
  }
  return "default";
}

export function scoreLead(lead: LeadInput) {
  return SCORE_RULES[scoreRuleKey(lead)];
}
