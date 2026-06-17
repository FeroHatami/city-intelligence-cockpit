#!/usr/bin/env python3
"""Convert a GeoJSON feature into a City Intelligence Cockpit lead record."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FEATURE_FILE = (
    PROJECT_ROOT
    / "open-source"
    / "TerriaMap"
    / "wwwroot"
    / "data"
    / "city-intelligence"
    / "munich-pharmacies.geojson"
)

STATUS_VALUES = [
    "interesting",
    "research_later",
    "contact_soon",
    "contacted",
    "meeting_booked",
    "not_relevant",
]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "feature"


def stable_fallback_id(feature: dict[str, Any], source_layer: str) -> str:
    payload = json.dumps(feature, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]
    return f"lead-{slugify(source_layer)}-{digest}"


def lead_id(properties: dict[str, Any], feature: dict[str, Any], source_layer: str) -> str:
    osm_type = properties.get("osm_type")
    osm_id = properties.get("osm_id")
    if osm_type and osm_id:
        return f"lead-{slugify(source_layer)}-{slugify(str(osm_type))}-{osm_id}"
    return stable_fallback_id(feature, source_layer)


def load_feature(path: Path, feature_index: int) -> tuple[dict[str, Any], str]:
    data = json.loads(path.read_text(encoding="utf-8"))

    if isinstance(data, dict) and data.get("type") == "Feature":
        return data, ""

    if isinstance(data, dict) and data.get("type") == "FeatureCollection":
        features = data.get("features")
        if not isinstance(features, list):
            raise ValueError(f"{path} is a FeatureCollection without a features array.")
        if feature_index < 0 or feature_index >= len(features):
            raise IndexError(
                f"Feature index {feature_index} is outside the range 0..{len(features) - 1}."
            )
        feature = features[feature_index]
        if not isinstance(feature, dict):
            raise ValueError(f"Feature index {feature_index} is not an object.")
        return feature, str(data.get("name") or "")

    raise ValueError(f"{path} must contain a GeoJSON Feature or FeatureCollection.")


def point_coordinates(feature: dict[str, Any]) -> tuple[float | None, float | None]:
    geometry = feature.get("geometry")
    if not isinstance(geometry, dict):
        return None, None

    if geometry.get("type") != "Point":
        return None, None

    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list) or len(coordinates) < 2:
        return None, None

    longitude, latitude = coordinates[:2]
    return float(latitude), float(longitude)


def create_lead(
    feature: dict[str, Any],
    source_layer: str,
    status: str,
    notes: str,
    opportunity_score: str,
) -> dict[str, Any]:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        properties = {}

    latitude, longitude = point_coordinates(feature)
    timestamp = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    return {
        "id": lead_id(properties, feature, source_layer),
        "name": str(properties.get("name") or ""),
        "category": str(properties.get("category") or ""),
        "address": str(properties.get("address") or ""),
        "phone": str(properties.get("phone") or ""),
        "website": str(properties.get("website") or ""),
        "latitude": latitude,
        "longitude": longitude,
        "osm_id": properties.get("osm_id", ""),
        "osm_type": str(properties.get("osm_type") or ""),
        "source": str(properties.get("source") or ""),
        "source_layer": source_layer,
        "data_source": str(
            properties.get("data_source")
            or properties.get("source")
            or "OpenStreetMap / Overpass"
        ),
        "verification_status": str(properties.get("verification_status") or ""),
        "last_checked_at": str(properties.get("last_checked_at") or ""),
        "opportunity_score": opportunity_score or str(properties.get("opportunity_score") or ""),
        "score_reason": str(properties.get("score_reason") or ""),
        "suggested_offer": str(properties.get("suggested_offer") or ""),
        "suggested_first_message": str(properties.get("suggested_first_message") or ""),
        "recommended_next_action": str(properties.get("recommended_next_action") or ""),
        "risk_notes": str(properties.get("risk_notes") or ""),
        "notes": notes or str(properties.get("notes") or ""),
        "status": status,
        "created_at": timestamp,
        "updated_at": timestamp,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a lead record from a GeoJSON feature."
    )
    parser.add_argument(
        "--feature-file",
        type=Path,
        default=DEFAULT_FEATURE_FILE,
        help="GeoJSON Feature or FeatureCollection path.",
    )
    parser.add_argument(
        "--feature-index",
        type=int,
        default=0,
        help="Feature index to use when the input is a FeatureCollection.",
    )
    parser.add_argument(
        "--source-layer",
        default="",
        help="City Intelligence Cockpit layer name, such as 'Munich Pharmacies'.",
    )
    parser.add_argument(
        "--status",
        choices=STATUS_VALUES,
        default="interesting",
        help="Initial lead status.",
    )
    parser.add_argument("--notes", default="", help="Optional analyst notes.")
    parser.add_argument(
        "--opportunity-score",
        default="",
        help="Optional opportunity score value.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional output path. Defaults to standard output.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    feature, collection_name = load_feature(args.feature_file, args.feature_index)
    source_layer = args.source_layer or collection_name or args.feature_file.stem
    lead = create_lead(
        feature=feature,
        source_layer=source_layer,
        status=args.status,
        notes=args.notes,
        opportunity_score=args.opportunity_score,
    )
    output = json.dumps(lead, ensure_ascii=False, indent=2) + "\n"

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (IndexError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
