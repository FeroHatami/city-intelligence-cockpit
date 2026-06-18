from __future__ import annotations

import csv
import io
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from .models import DEFAULT_DB_PATH, LEAD_FIELDS, TEXT_FIELDS
except ImportError:  # pragma: no cover - direct script execution fallback
    from models import DEFAULT_DB_PATH, LEAD_FIELDS, TEXT_FIELDS


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_db_path(db_path: str | Path | None = None) -> Path:
    path = Path(db_path or DEFAULT_DB_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def connect(db_path: str | Path | None = None) -> sqlite3.Connection:
    connection = sqlite3.connect(ensure_db_path(db_path))
    connection.row_factory = sqlite3.Row
    return connection


def init_db(db_path: str | Path | None = None) -> Path:
    path = ensure_db_path(db_path)
    with connect(path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '',
                category TEXT NOT NULL DEFAULT '',
                address TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                website TEXT NOT NULL DEFAULT '',
                latitude REAL,
                longitude REAL,
                osm_id TEXT NOT NULL DEFAULT '',
                osm_type TEXT NOT NULL DEFAULT '',
                source_layer TEXT NOT NULL DEFAULT '',
                source TEXT NOT NULL DEFAULT '',
                opportunity_score TEXT NOT NULL DEFAULT '',
                score_reason TEXT NOT NULL DEFAULT '',
                suggested_offer TEXT NOT NULL DEFAULT '',
                suggested_first_message TEXT NOT NULL DEFAULT '',
                outreach_angle TEXT NOT NULL DEFAULT '',
                outreach_status TEXT NOT NULL DEFAULT '',
                outreach_channel TEXT NOT NULL DEFAULT '',
                outreach_message TEXT NOT NULL DEFAULT '',
                outreach_last_generated_at TEXT NOT NULL DEFAULT '',
                outreach_last_copied_at TEXT NOT NULL DEFAULT '',
                recommended_next_action TEXT NOT NULL DEFAULT '',
                risk_notes TEXT NOT NULL DEFAULT '',
                notes TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'interesting',
                verification_status TEXT NOT NULL DEFAULT '',
                last_checked_at TEXT NOT NULL DEFAULT '',
                verified_by TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        existing_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(leads)").fetchall()
        }
        for field in TEXT_FIELDS:
            if field not in existing_columns:
                connection.execute(
                    f"ALTER TABLE leads ADD COLUMN {field} TEXT NOT NULL DEFAULT ''"
                )
                existing_columns.add(field)
        connection.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_osm_identity
            ON leads(osm_type, osm_id)
            WHERE osm_type != '' AND osm_id != ''
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category)"
        )
    return path


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def clean_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_lead(payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    lead: dict[str, Any] = {}
    for field in TEXT_FIELDS:
        lead[field] = clean_text(payload.get(field))
    lead["latitude"] = clean_float(payload.get("latitude"))
    lead["longitude"] = clean_float(payload.get("longitude"))
    lead["id"] = lead["id"] or make_lead_id(lead)
    lead["status"] = lead["status"] or "interesting"
    lead["created_at"] = lead["created_at"] or now
    lead["updated_at"] = lead["updated_at"] or now
    return lead


def slug(value: str) -> str:
    cleaned = []
    previous_dash = False
    for char in value.lower():
        if char.isalnum():
            cleaned.append(char)
            previous_dash = False
        elif not previous_dash:
            cleaned.append("-")
            previous_dash = True
    return "".join(cleaned).strip("-") or "lead"


def make_lead_id(lead: dict[str, Any]) -> str:
    source = clean_text(lead.get("source_layer") or lead.get("category") or "manual")
    osm_type = clean_text(lead.get("osm_type"))
    osm_id = clean_text(lead.get("osm_id"))
    if osm_type and osm_id:
        return f"lead-{slug(source)}-{slug(osm_type)}-{slug(osm_id)}"
    return f"lead-{slug(source)}-{int(datetime.now(timezone.utc).timestamp())}"


def row_to_lead(row: sqlite3.Row) -> dict[str, Any]:
    return {field: row[field] for field in LEAD_FIELDS}


def list_leads(db_path: str | Path | None = None) -> list[dict[str, Any]]:
    init_db(db_path)
    with connect(db_path) as connection:
        rows = connection.execute(
            "SELECT * FROM leads ORDER BY updated_at DESC, created_at DESC"
        ).fetchall()
    return [row_to_lead(row) for row in rows]


def find_duplicate_id(
    connection: sqlite3.Connection, lead: dict[str, Any]
) -> str | None:
    if lead.get("osm_type") and lead.get("osm_id"):
        row = connection.execute(
            "SELECT id FROM leads WHERE osm_type = ? AND osm_id = ?",
            (lead["osm_type"], lead["osm_id"]),
        ).fetchone()
        if row:
            return str(row["id"])
    row = connection.execute(
        "SELECT id FROM leads WHERE id = ?", (lead["id"],)
    ).fetchone()
    return str(row["id"]) if row else None


def upsert_lead(
    payload: dict[str, Any], db_path: str | Path | None = None
) -> tuple[dict[str, Any], bool]:
    init_db(db_path)
    lead = normalize_lead(payload)
    with connect(db_path) as connection:
        duplicate_id = find_duplicate_id(connection, lead)
        if duplicate_id:
            existing = connection.execute(
                "SELECT * FROM leads WHERE id = ?", (duplicate_id,)
            ).fetchone()
            created_at = existing["created_at"] if existing else lead["created_at"]
            lead["id"] = duplicate_id
            lead["created_at"] = created_at
            lead["updated_at"] = utc_now()
            placeholders = ", ".join(f"{field} = ?" for field in LEAD_FIELDS)
            connection.execute(
                f"UPDATE leads SET {placeholders} WHERE id = ?",
                [lead[field] for field in LEAD_FIELDS] + [duplicate_id],
            )
            return lead, False

        connection.execute(
            f"""
            INSERT INTO leads ({", ".join(LEAD_FIELDS)})
            VALUES ({", ".join("?" for _ in LEAD_FIELDS)})
            """,
            [lead[field] for field in LEAD_FIELDS],
        )
        return lead, True


def update_lead(
    lead_id: str, updates: dict[str, Any], db_path: str | Path | None = None
) -> dict[str, Any] | None:
    init_db(db_path)
    with connect(db_path) as connection:
        row = connection.execute(
            "SELECT * FROM leads WHERE id = ?", (lead_id,)
        ).fetchone()
        if not row:
            return None
        payload = row_to_lead(row)
        payload.update(updates)
        payload["id"] = lead_id
        payload["created_at"] = row["created_at"]
        payload["updated_at"] = utc_now()
        lead = normalize_lead(payload)
        placeholders = ", ".join(f"{field} = ?" for field in LEAD_FIELDS)
        connection.execute(
            f"UPDATE leads SET {placeholders} WHERE id = ?",
            [lead[field] for field in LEAD_FIELDS] + [lead_id],
        )
    return lead


def delete_lead(lead_id: str, db_path: str | Path | None = None) -> bool:
    init_db(db_path)
    with connect(db_path) as connection:
        cursor = connection.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    return cursor.rowcount > 0


def import_leads(records: list[dict[str, Any]], db_path: str | Path | None = None):
    summary = {"total": len(records), "imported": 0, "updated": 0, "skipped": 0}
    for record in records:
        if not isinstance(record, dict):
            summary["skipped"] += 1
            continue
        _, created = upsert_lead(record, db_path)
        if created:
            summary["imported"] += 1
        else:
            summary["updated"] += 1
    return summary


def leads_to_json(leads: list[dict[str, Any]]) -> str:
    return json.dumps(leads, indent=2)


def leads_to_csv(leads: list[dict[str, Any]]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=LEAD_FIELDS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(leads)
    return output.getvalue()


def parse_leads_json(content: str) -> list[dict[str, Any]]:
    parsed = json.loads(content)
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict) and isinstance(parsed.get("leads"), list):
        return parsed["leads"]
    raise ValueError("Expected a JSON array or an object with a leads array.")
