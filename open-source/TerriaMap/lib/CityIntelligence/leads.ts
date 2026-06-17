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
  data_source: string;
  verification_status: string;
  last_checked_at: string;
  opportunity_score: string | number;
  score_reason: string;
  suggested_offer: string;
  suggested_first_message: string;
  outreach_angle: string;
  recommended_next_action: string;
  risk_notes: string;
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
    suggested_first_message:
      "I noticed your pharmacy may handle recurring inventory and supplier coordination. Would a short workflow audit be useful to find admin tasks that can be automated safely?",
    outreach_angle: "Operations workflow audit for inventory, procurement, and supplier coordination.",
    recommended_next_action:
      "Review public contact details and prepare a pharmacy-specific operations note.",
    risk_notes:
      "Keep outreach focused on operations, procurement, and public business information. Do not reference or request patient data."
  },
  law_firm: {
    opportunity_score: 8,
    score_reason:
      "Law firms often have document intake, drafting, client follow-up, and knowledge-management workflows where careful automation can save time.",
    suggested_offer: "Confidential document intake and follow-up workflow review.",
    suggested_first_message:
      "I am mapping Munich law firms where document intake and follow-up workflows may be streamlined. Would a short non-confidential workflow review be useful?",
    outreach_angle: "Non-confidential workflow review for intake, document status, and admin follow-up.",
    recommended_next_action:
      "Check practice focus and public contact path, then tailor outreach around intake, document status, or admin follow-up.",
    risk_notes:
      "Avoid legal advice claims and never request confidential matter details in initial outreach."
  },
  consultant: {
    opportunity_score: 7,
    score_reason:
      "Consulting firms often rely on proposal, research, reporting, and CRM workflows that can benefit from repeatable automation.",
    suggested_offer: "Proposal and client-reporting workflow review.",
    suggested_first_message:
      "I am mapping Munich consulting teams that may benefit from proposal or reporting workflow automation. Would a short process review be useful?",
    outreach_angle: "Proposal, research, and client-reporting workflow improvement.",
    recommended_next_action:
      "Identify the firm's specialty and tailor outreach around proposal creation, research synthesis, or client reporting.",
    risk_notes:
      "Validate that the office record represents an active consulting business before outreach."
  },
  real_estate: {
    opportunity_score: 7,
    score_reason:
      "Real estate offices often manage listings, inquiries, document packets, and follow-up sequences with clear automation potential.",
    suggested_offer: "Listing inquiry and follow-up workflow audit.",
    suggested_first_message:
      "I noticed your Munich real estate office and am mapping teams that may benefit from faster listing inquiry and follow-up workflows. Would a short audit be useful?",
    outreach_angle: "Listing inquiry, document packet, and follow-up workflow cleanup.",
    recommended_next_action:
      "Review public listings and contact channels, then frame outreach around inquiry handling and document preparation.",
    risk_notes:
      "Real estate records change frequently; verify the office is active and avoid financial-advice claims."
  },
  insurance: {
    opportunity_score: 7,
    score_reason:
      "Insurance offices often handle renewals, document collection, comparison, and customer follow-up workflows.",
    suggested_offer: "Renewal and document-collection workflow review.",
    suggested_first_message:
      "I am mapping Munich insurance offices where renewals and document collection may be made easier. Would a short workflow review be useful?",
    outreach_angle: "Renewal reminder, document collection, and customer follow-up workflow review.",
    recommended_next_action:
      "Check public contact details and tailor outreach around renewal reminders, document collection, or customer communication.",
    risk_notes:
      "Avoid claims about regulated advice or customer data processing before a proper compliance review."
  },
  government: {
    opportunity_score: 5,
    score_reason:
      "Government offices can have form, document, and public-service workflows, but procurement and compliance constraints make qualification important.",
    suggested_offer: "Public-service form and document workflow discovery.",
    suggested_first_message:
      "I am mapping public-service offices in Munich and researching practical form or document workflow improvements. Is there a public contact for process-improvement discussions?",
    outreach_angle: "Public-service form and document workflow discovery through official channels.",
    recommended_next_action:
      "Find the official department contact and procurement path before any outreach.",
    risk_notes:
      "Government outreach requires extra care around procurement rules, public records, and official contact channels."
  },
  company_office: {
    opportunity_score: 7,
    score_reason:
      "Company offices commonly have admin, sales, document, and internal operations workflows suitable for local automation offers.",
    suggested_offer: "Admin and sales operations workflow review.",
    suggested_first_message:
      "I am mapping Munich company offices that may benefit from practical admin or sales workflow automation. Would a short workflow review be useful?",
    outreach_angle: "Admin, sales operations, and document workflow review.",
    recommended_next_action:
      "Qualify the company type and tailor outreach around admin, sales operations, or document handling.",
    risk_notes:
      "Company office records may represent headquarters, branches, or generic office locations; validate the decision-maker."
  },
  office_building: {
    opportunity_score: 4,
    score_reason:
      "Office-building records may identify a place rather than an operating organization, so they are lower-confidence leads until manually qualified.",
    suggested_offer: "Tenant/operator qualification and operations discovery.",
    suggested_first_message:
      "I am mapping Munich office locations and trying to identify the right operator or tenant contact for workflow improvement opportunities. Is there a public business contact for this location?",
    outreach_angle: "Operator or tenant qualification before business workflow outreach.",
    recommended_next_action:
      "Identify a tenant, building operator, or management company before treating the record as a lead.",
    risk_notes:
      "Do not assume a building record is a reachable business lead."
  },
  office: {
    opportunity_score: 6,
    score_reason:
      "Office organizations often have admin automation, document workflow, and lead generation opportunities.",
    suggested_offer: "Admin automation and document workflow review.",
    suggested_first_message:
      "I am mapping Munich offices that may benefit from practical admin or document workflow automation. Would a short process review be useful?",
    outreach_angle: "Admin automation, document workflow, and sales operations qualification.",
    recommended_next_action:
      "Qualify the organization type and tailor outreach around admin or sales operations.",
    risk_notes:
      "Generic office records need manual qualification before outreach."
  },
  clinic: {
    opportunity_score: 8,
    score_reason:
      "Clinics often have appointment workflow, communication, and procurement needs with clear operational value.",
    suggested_offer: "Appointment and communication workflow assessment.",
    suggested_first_message:
      "I am researching Munich clinics where appointment and communication workflows may be improved. Would a non-clinical operations review be useful for your team?",
    outreach_angle: "Non-clinical appointment, communication, and procurement workflow review.",
    recommended_next_action:
      "Frame outreach around non-clinical operations and avoid patient-data assumptions.",
    risk_notes:
      "Medical privacy is sensitive. Do not request or process patient data without a compliant system and explicit authorization."
  },
  coworking: {
    opportunity_score: 6,
    score_reason:
      "Coworking spaces can be useful partnership channels for founder networks, events, and community programming.",
    suggested_offer: "Founder network and event partnership proposal.",
    suggested_first_message:
      "I am mapping Munich founder communities and coworking spaces. Would you be open to a lightweight event or member-benefit partnership idea?",
    outreach_angle: "Founder community, member benefit, and event partnership.",
    recommended_next_action:
      "Look for community or events contacts and draft a partnership-oriented note.",
    risk_notes:
      "Some coworking records are locations rather than decision makers; confirm the operator and community activity first."
  },
  restaurant: {
    opportunity_score: 6,
    score_reason:
      "Restaurants often benefit from local marketing, reviews, reservations, and inventory workflow improvements.",
    suggested_offer: "Local marketing and operations quick audit.",
    suggested_first_message:
      "I noticed your restaurant in Munich and am mapping local businesses that may benefit from small improvements in reservations, reviews, or inventory workflows. Would a short audit be useful?",
    outreach_angle: "Local marketing, reservations, reviews, and inventory quick audit.",
    recommended_next_action:
      "Check website, reservation path, and public review presence before outreach.",
    risk_notes:
      "Restaurant data can change often; verify the business is still active before contacting."
  },
  default: {
    opportunity_score: 5,
    score_reason:
      "This lead has basic public business data but needs manual qualification before outreach.",
    suggested_offer: "Operational workflow discovery call.",
    suggested_first_message:
      "I am mapping Munich organizations and looking for practical workflow improvement opportunities. Would a quick operations review be useful?",
    outreach_angle: "Manual qualification for practical workflow improvement fit.",
    recommended_next_action:
      "Manually qualify the organization and choose a category-specific offer.",
    risk_notes:
      "Insufficient category context; validate fit before outreach."
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
    data_source: cleanString(lead.data_source),
    verification_status: cleanString(lead.verification_status),
    last_checked_at: cleanString(lead.last_checked_at),
    opportunity_score: lead.opportunity_score ?? "",
    score_reason: cleanString(lead.score_reason),
    suggested_offer: cleanString(lead.suggested_offer),
    suggested_first_message: cleanString(lead.suggested_first_message),
    outreach_angle: cleanString(lead.outreach_angle),
    recommended_next_action: cleanString(lead.recommended_next_action),
    risk_notes: cleanString(lead.risk_notes),
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

export function exportLeads(
  format: "json" | "csv" = "json",
  leads: CityIntelligenceLead[] = getLeads()
) {
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
    "data_source",
    "verification_status",
    "last_checked_at",
    "opportunity_score",
    "score_reason",
    "suggested_offer",
    "suggested_first_message",
    "outreach_angle",
    "recommended_next_action",
    "risk_notes",
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
  const officeType = cleanString((lead as { office_type?: unknown }).office_type);
  const text = `${lead.category || ""} ${lead.source_layer || ""} ${officeType}`.toLowerCase();
  if (
    text.includes("law firm") ||
    text.includes("lawyer") ||
    text.includes("attorney") ||
    text.includes("rechtsanw")
  ) {
    return "law_firm";
  }
  if (text.includes("consult")) return "consultant";
  if (text.includes("real estate") || text.includes("estate_agent") || text.includes("property")) {
    return "real_estate";
  }
  if (text.includes("insurance")) return "insurance";
  if (text.includes("government")) return "government";
  if (
    text.includes("company office") ||
    text.includes("company offices") ||
    text.endsWith(" company")
  ) {
    return "company_office";
  }
  if (
    text.includes("office building") ||
    text.includes("office_building") ||
    text.includes("generic office building")
  ) {
    return "office_building";
  }
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

export function generateOutreach(lead: LeadInput) {
  const rule = SCORE_RULES[scoreRuleKey(lead)];
  return {
    suggested_first_message: rule.suggested_first_message,
    outreach_angle: rule.outreach_angle,
    recommended_next_action: rule.recommended_next_action
  };
}
