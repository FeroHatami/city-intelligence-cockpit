#!/usr/bin/env python3
"""Dry-run opportunity scoring for City Intelligence Cockpit GeoJSON features."""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = (
    PROJECT_ROOT
    / "open-source"
    / "TerriaMap"
    / "wwwroot"
    / "data"
    / "city-intelligence"
    / "munich-pharmacies.geojson"
)

SCORE_FIELDS = [
    "opportunity_score",
    "score_reason",
    "suggested_offer",
    "suggested_first_message",
    "recommended_next_action",
    "risk_notes",
]


RULES = {
    "pharmacy": {
        "score": 8,
        "reason": "Pharmacies often have recurring procurement, inventory, and supplier communication workflows that can benefit from lightweight automation.",
        "offer": "Inventory and supplier communication workflow audit.",
        "message": "I noticed your pharmacy may handle recurring inventory and supplier coordination. Would a short workflow audit be useful to find admin tasks that can be automated safely?",
        "action": "Research current website/contact path, then prepare a pharmacy-specific workflow audit note.",
        "risk": "Healthcare-adjacent outreach should avoid patient data claims and stay focused on operations, procurement, and public business information.",
    },
    "law_firm": {
        "score": 8,
        "reason": "Law firms often have document intake, drafting, client follow-up, and knowledge-management workflows where careful automation can save time.",
        "offer": "Confidential document intake and follow-up workflow review.",
        "message": "I am mapping Munich law firms where document intake and follow-up workflows may be streamlined. Would a short non-confidential workflow review be useful?",
        "action": "Check practice focus and public contact path, then tailor outreach around intake, document status, or admin follow-up.",
        "risk": "Avoid legal advice claims and never request confidential matter details in initial outreach.",
    },
    "consultant": {
        "score": 7,
        "reason": "Consulting firms often rely on proposal, research, reporting, and CRM workflows that can benefit from repeatable automation.",
        "offer": "Proposal and client-reporting workflow review.",
        "message": "I am mapping Munich consulting teams that may benefit from proposal or reporting workflow automation. Would a short process review be useful?",
        "action": "Identify the firm's specialty and tailor outreach around proposal creation, research synthesis, or client reporting.",
        "risk": "Validate that the office record represents an active consulting business before outreach.",
    },
    "real_estate": {
        "score": 7,
        "reason": "Real estate offices often manage listings, inquiries, document packets, and follow-up sequences with clear automation potential.",
        "offer": "Listing inquiry and follow-up workflow audit.",
        "message": "I noticed your Munich real estate office and am mapping teams that may benefit from faster listing inquiry and follow-up workflows. Would a short audit be useful?",
        "action": "Review public listings and contact channels, then frame outreach around inquiry handling and document preparation.",
        "risk": "Real estate records change frequently; verify the office is active and avoid financial-advice claims.",
    },
    "insurance": {
        "score": 7,
        "reason": "Insurance offices often handle renewals, document collection, comparison, and customer follow-up workflows.",
        "offer": "Renewal and document-collection workflow review.",
        "message": "I am mapping Munich insurance offices where renewals and document collection may be made easier. Would a short workflow review be useful?",
        "action": "Check public contact details and tailor outreach around renewal reminders, document collection, or customer communication.",
        "risk": "Avoid claims about regulated advice or customer data processing before a proper compliance review.",
    },
    "government": {
        "score": 5,
        "reason": "Government offices can have form, document, and public-service workflows, but procurement and compliance constraints make qualification important.",
        "offer": "Public-service form and document workflow discovery.",
        "message": "I am mapping public-service offices in Munich and researching practical form or document workflow improvements. Is there a public contact for process-improvement discussions?",
        "action": "Find the official department contact and procurement path before any outreach.",
        "risk": "Government outreach requires extra care around procurement rules, public records, and official contact channels.",
    },
    "company_office": {
        "score": 7,
        "reason": "Company offices commonly have admin, sales, document, and internal operations workflows suitable for local automation offers.",
        "offer": "Admin and sales operations workflow review.",
        "message": "I am mapping Munich company offices that may benefit from practical admin or sales workflow automation. Would a short workflow review be useful?",
        "action": "Qualify the company type and tailor outreach around admin, sales operations, or document handling.",
        "risk": "Company office records may represent headquarters, branches, or generic office locations; validate the decision-maker.",
    },
    "office_building": {
        "score": 4,
        "reason": "Office-building records may identify a place rather than an operating organization, so they are lower-confidence leads until manually qualified.",
        "offer": "Tenant/operator qualification and operations discovery.",
        "message": "I am mapping Munich office locations and trying to identify the right operator or tenant contact for workflow improvement opportunities. Is there a public business contact for this location?",
        "action": "Identify a tenant, building operator, or management company before treating the record as a lead.",
        "risk": "Do not assume a building record is a reachable business lead.",
    },
    "office": {
        "score": 6,
        "reason": "Office-related organizations commonly need admin automation, document processing, and lead generation support.",
        "offer": "Admin automation and lead generation process review.",
        "message": "I am mapping Munich organizations that could benefit from practical admin automation. Would it be useful to compare a few document or lead workflows that might save time?",
        "action": "Identify the organization type and tailor the outreach around admin or sales operations.",
        "risk": "Office=building records can be generic; validate that the feature represents an operating organization before outreach.",
    },
    "clinic": {
        "score": 8,
        "reason": "Clinics often have appointment, patient communication, procurement, and document workflows with high operational value.",
        "offer": "Appointment and patient communication workflow assessment.",
        "message": "I am researching Munich clinics where appointment and communication workflows may be improved. Would a non-clinical operations review be useful for your team?",
        "action": "Check public website/contact details and frame outreach around operations, not medical advice or patient data.",
        "risk": "Medical privacy is sensitive. Do not request or process patient data without a compliant system and explicit authorization.",
    },
    "coworking": {
        "score": 6,
        "reason": "Coworking spaces can be strong partnership channels for founder networks, events, and community programming.",
        "offer": "Founder network and event partnership proposal.",
        "message": "I am mapping Munich founder communities and coworking spaces. Would you be open to a lightweight event or member-benefit partnership idea?",
        "action": "Look for community or events contacts and draft a partnership-oriented message.",
        "risk": "Some records may be locations rather than decision makers; confirm the operator and community activity first.",
    },
    "restaurant": {
        "score": 6,
        "reason": "Restaurants commonly benefit from local marketing, reservations, reviews, menu updates, and inventory workflows.",
        "offer": "Local marketing and operations quick audit.",
        "message": "I noticed your restaurant in Munich and am mapping local businesses that may benefit from small improvements in reservations, reviews, or inventory workflows. Would a short audit be useful?",
        "action": "Review website, reservation path, and public review presence before outreach.",
        "risk": "Restaurant data can change often; verify the business is still active before contacting.",
    },
    "default": {
        "score": 5,
        "reason": "The feature has basic public business data but needs manual qualification before outreach.",
        "offer": "Operational workflow discovery call.",
        "message": "I am mapping Munich organizations and looking for practical workflow improvement opportunities. Would a quick operations review be useful?",
        "action": "Manually qualify the organization and choose a category-specific offer.",
        "risk": "Insufficient category context; validate fit before outreach.",
    },
}


def load_geojson(path: Path) -> tuple[list[dict[str, Any]], str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        raise ValueError(f"{path} must contain a GeoJSON FeatureCollection.")

    features = data.get("features")
    if not isinstance(features, list):
        raise ValueError(f"{path} does not contain a features array.")

    return [feature for feature in features if isinstance(feature, dict)], str(data.get("name") or path.stem)


def office_subtype_category(text: str) -> str:
    if any(value in text for value in ["law firm", "lawyer", "attorney", "rechtsanw"]):
        return "Law Firm"
    if "consult" in text:
        return "Consultant"
    if any(value in text for value in ["real estate", "estate_agent", "property"]):
        return "Real Estate"
    if "insurance" in text:
        return "Insurance"
    if "government" in text:
        return "Government"
    if "company office" in text or "company offices" in text or text.endswith(" company"):
        return "Company Office"
    if "office building" in text or "office_building" in text or "generic office building" in text:
        return "Office Building"
    return ""


def infer_category(properties: dict[str, Any], source_layer: str) -> str:
    category = str(properties.get("category") or "").strip()
    subtype = office_subtype_category(
        f"{category} {source_layer} {properties.get('office_type') or ''} {properties.get('office') or ''}".lower()
    )
    if subtype:
        return subtype
    if category:
        return category

    layer = source_layer.lower()
    for candidate in ["pharmacy", "office", "clinic", "coworking", "restaurant"]:
        if candidate in layer:
            return candidate.title()
    return ""


def rule_key(category: str, source_layer: str) -> str:
    text = f"{category} {source_layer}".lower()
    if any(value in text for value in ["law firm", "lawyer", "attorney", "rechtsanw"]):
        return "law_firm"
    if "consult" in text:
        return "consultant"
    if any(value in text for value in ["real estate", "estate_agent", "property"]):
        return "real_estate"
    if "insurance" in text:
        return "insurance"
    if "government" in text:
        return "government"
    if "company office" in text or "company offices" in text or text.endswith(" company"):
        return "company_office"
    if "office building" in text or "office_building" in text or "generic office building" in text:
        return "office_building"
    if "pharmacy" in text:
        return "pharmacy"
    if "office" in text:
        return "office"
    if "clinic" in text or "doctor" in text or "dentist" in text:
        return "clinic"
    if "cowork" in text:
        return "coworking"
    if "restaurant" in text or "cafe" in text or "food" in text or "bar" in text or "pub" in text:
        return "restaurant"
    return "default"


def selected_features(
    features: list[dict[str, Any]],
    source_layer: str,
    indexes: list[int],
    category_filter: str,
    limit: int,
) -> list[tuple[int, dict[str, Any]]]:
    if indexes:
        selected = []
        for index in indexes:
            if index < 0 or index >= len(features):
                raise IndexError(f"Feature index {index} is outside the range 0..{len(features) - 1}.")
            selected.append((index, features[index]))
        return selected

    selected = []
    for index, feature in enumerate(features):
        properties = feature.get("properties")
        if not isinstance(properties, dict):
            properties = {}
        category = infer_category(properties, source_layer)
        if category_filter and category.lower() != category_filter.lower():
            continue
        selected.append((index, feature))
        if len(selected) >= limit:
            break
    return selected


def score_feature(index: int, feature: dict[str, Any], source_layer: str) -> dict[str, Any]:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        properties = {}

    category = infer_category(properties, source_layer)
    rule = RULES[rule_key(category, source_layer)]

    return {
        "feature_index": index,
        "feature_name": str(properties.get("name") or ""),
        "category": category,
        "osm_id": properties.get("osm_id", ""),
        "osm_type": str(properties.get("osm_type") or ""),
        "source_layer": source_layer,
        "opportunity_score": rule["score"],
        "score_reason": rule["reason"],
        "suggested_offer": rule["offer"],
        "suggested_first_message": rule["message"],
        "recommended_next_action": rule["action"],
        "risk_notes": rule["risk"],
    }


def write_json(records: list[dict[str, Any]], output: Path | None, dry_run: bool) -> None:
    payload = {
        "dry_run": dry_run,
        "scoring_method": "rule_based",
        "records": records,
    }
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")


def write_csv(records: list[dict[str, Any]], output: Path | None) -> None:
    fieldnames = [
        "feature_index",
        "feature_name",
        "category",
        "osm_id",
        "osm_type",
        "source_layer",
        *SCORE_FIELDS,
    ]

    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        return

    writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Score City Intelligence Cockpit GeoJSON features in dry-run mode."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Input GeoJSON FeatureCollection.")
    parser.add_argument("--output", type=Path, help="Optional output JSON or CSV path.")
    parser.add_argument("--format", choices=["json", "csv"], default="json", help="Output format.")
    parser.add_argument("--source-layer", default="", help="Layer name for output records.")
    parser.add_argument(
        "--feature-index",
        action="append",
        type=int,
        default=[],
        help="Feature index to score. Can be passed more than once.",
    )
    parser.add_argument("--category", default="", help="Optional category filter.")
    parser.add_argument("--limit", type=int, default=5, help="Maximum records when no index is provided.")
    parser.add_argument(
        "--mode",
        choices=["dry-run", "openai"],
        default="dry-run",
        help="dry-run uses local rules. openai is reserved for a future API-backed scorer.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.limit < 1:
        raise ValueError("--limit must be at least 1.")

    if args.mode == "openai":
        if not os.environ.get("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY is required for --mode openai.")
        raise NotImplementedError("--mode openai is reserved for a future implementation and does not call paid APIs yet.")

    features, collection_name = load_geojson(args.input)
    source_layer = args.source_layer or collection_name
    selected = selected_features(
        features=features,
        source_layer=source_layer,
        indexes=args.feature_index,
        category_filter=args.category,
        limit=args.limit,
    )
    records = [score_feature(index, feature, source_layer) for index, feature in selected]

    if args.format == "json":
        write_json(records, args.output, dry_run=True)
    else:
        write_csv(records, args.output)

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (IndexError, NotImplementedError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
