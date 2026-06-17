#!/usr/bin/env python3
"""Split the Munich offices GeoJSON into business-focused sublayers."""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = (
    PROJECT_ROOT
    / "open-source"
    / "TerriaMap"
    / "wwwroot"
    / "data"
    / "city-intelligence"
)
SOURCE_PATH = DATA_DIR / "munich-offices.geojson"

SUBLAYERS = [
    {
        "key": "law_firms",
        "name": "Munich Law Firms",
        "filename": "munich-law-firms.geojson",
        "office_types": {"lawyer"},
    },
    {
        "key": "consultants",
        "name": "Munich Consultants",
        "filename": "munich-consultants.geojson",
        "office_types": {"consulting", "consultant"},
    },
    {
        "key": "real_estate",
        "name": "Munich Real Estate Offices",
        "filename": "munich-real-estate-offices.geojson",
        "office_types": {"estate_agent"},
    },
    {
        "key": "insurance",
        "name": "Munich Insurance Offices",
        "filename": "munich-insurance-offices.geojson",
        "office_types": {"insurance"},
    },
    {
        "key": "government",
        "name": "Munich Government Offices",
        "filename": "munich-government-offices.geojson",
        "office_types": {"government"},
    },
    {
        "key": "company",
        "name": "Munich Company Offices",
        "filename": "munich-company-offices.geojson",
        "office_types": {"company"},
    },
    {
        "key": "generic_office_buildings",
        "name": "Munich Generic Office Buildings",
        "filename": "munich-generic-office-buildings.geojson",
        "office_types": {"office_building"},
    },
    {
        "key": "other",
        "name": "Munich Other Offices",
        "filename": "munich-other-offices.geojson",
        "office_types": set(),
    },
]

KNOWN_OFFICE_TYPES = set().union(
    *(layer["office_types"] for layer in SUBLAYERS if layer["key"] != "other")
)


def load_feature_collection(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        raise ValueError(f"{path} must contain a GeoJSON FeatureCollection.")
    if not isinstance(data.get("features"), list):
        raise ValueError(f"{path} must contain a features array.")
    return data


def layer_key_for_feature(feature: dict[str, Any]) -> str:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        return "other"

    office_type = str(properties.get("office_type") or "").strip().lower()
    for layer in SUBLAYERS:
        if office_type in layer["office_types"]:
            return str(layer["key"])

    return "other"


def feature_collection(name: str, source: str, features: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "type": "FeatureCollection",
        "name": name,
        "source": source,
        "features": features,
    }


def main() -> int:
    source = load_feature_collection(SOURCE_PATH)
    features = [feature for feature in source["features"] if isinstance(feature, dict)]
    source_name = str(source.get("source") or "OpenStreetMap / Overpass")

    buckets: dict[str, list[dict[str, Any]]] = {str(layer["key"]): [] for layer in SUBLAYERS}
    for feature in features:
        buckets[layer_key_for_feature(feature)].append(copy.deepcopy(feature))

    written_counts: dict[str, int] = {}
    for layer in SUBLAYERS:
        output_path = DATA_DIR / str(layer["filename"])
        collection = feature_collection(
            name=str(layer["name"]),
            source=source_name,
            features=buckets[str(layer["key"])],
        )
        output_path.write_text(
            json.dumps(collection, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        written_counts[str(layer["name"])] = len(collection["features"])

    total_written = sum(written_counts.values())
    if total_written != len(features):
        raise ValueError(
            f"Sublayer total {total_written} does not match source count {len(features)}."
        )

    print(f"Source offices: {len(features)}")
    for name, count in written_counts.items():
        print(f"{name}: {count}")
    print(f"Sublayer total: {total_written}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
