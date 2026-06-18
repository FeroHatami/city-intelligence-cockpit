from __future__ import annotations

from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = ROOT_DIR / "backend" / "data" / "city-intelligence.sqlite"

LEAD_FIELDS = [
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
    "source_layer",
    "source",
    "opportunity_score",
    "score_reason",
    "suggested_offer",
    "suggested_first_message",
    "outreach_angle",
    "recommended_next_action",
    "risk_notes",
    "notes",
    "status",
    "verification_status",
    "last_checked_at",
    "verified_by",
    "created_at",
    "updated_at",
]

TEXT_FIELDS = [field for field in LEAD_FIELDS if field not in {"latitude", "longitude"}]
