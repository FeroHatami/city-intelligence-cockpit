#!/usr/bin/env python3
"""Add local verification metadata to City Intelligence Cockpit GeoJSON files."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = (
    PROJECT_ROOT
    / "open-source"
    / "TerriaMap"
    / "wwwroot"
    / "data"
    / "city-intelligence"
)
DEFAULT_DATA_SOURCE = "OpenStreetMap / Overpass"
DEFAULT_VERIFICATION_STATUS = "unverified_osm"


def utc_timestamp() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_geojson(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain a GeoJSON object.")
    if data.get("type") not in {"FeatureCollection", "Feature"}:
        raise ValueError(f"{path} must contain a GeoJSON Feature or FeatureCollection.")
    return data


def iter_features(data: dict[str, Any]) -> list[dict[str, Any]]:
    if data.get("type") == "Feature":
        return [data]

    features = data.get("features")
    if not isinstance(features, list):
        raise ValueError("FeatureCollection is missing a features array.")

    valid_features = [feature for feature in features if isinstance(feature, dict)]
    if len(valid_features) != len(features):
        raise ValueError("FeatureCollection contains a non-object feature.")
    return valid_features


def ensure_properties(feature: dict[str, Any]) -> dict[str, Any]:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        properties = {}
        feature["properties"] = properties
    return properties


def update_feature(feature: dict[str, Any], checked_at: str) -> int:
    properties = ensure_properties(feature)
    added = 0

    if "data_source" not in properties:
        properties["data_source"] = properties.get("source") or DEFAULT_DATA_SOURCE
        added += 1

    if "verification_status" not in properties:
        properties["verification_status"] = DEFAULT_VERIFICATION_STATUS
        added += 1

    if "last_checked_at" not in properties:
        properties["last_checked_at"] = checked_at
        added += 1

    return added


def update_geojson(path: Path, checked_at: str) -> tuple[int, int]:
    data = load_geojson(path)
    features = iter_features(data)
    added = sum(update_feature(feature, checked_at) for feature in features)

    if added:
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
            encoding="utf-8",
        )

    return len(features), added


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add missing local verification fields to city-intelligence GeoJSON files."
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="Directory containing City Intelligence Cockpit GeoJSON files.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.data_dir.is_dir():
        raise ValueError(f"{args.data_dir} is not a directory.")

    checked_at = utc_timestamp()
    paths = sorted(args.data_dir.glob("*.geojson"))
    if not paths:
        raise ValueError(f"No GeoJSON files found in {args.data_dir}.")

    total_features = 0
    total_added = 0
    for path in paths:
        feature_count, added = update_geojson(path, checked_at)
        total_features += feature_count
        total_added += added
        print(f"{path.relative_to(PROJECT_ROOT)}: {feature_count} features, {added} fields added")

    print(f"checked_at: {checked_at}")
    print(f"updated_files: {len(paths)}")
    print(f"features_seen: {total_features}")
    print(f"fields_added: {total_added}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
