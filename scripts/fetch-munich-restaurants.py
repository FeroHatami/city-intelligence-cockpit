#!/usr/bin/env python3
"""Fetch Munich restaurant and food-service locations from Overpass."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
]
SOURCE = "OpenStreetMap / Overpass"

# South, west, north, east. Matches the Munich prototype view bounds.
MUNICH_BBOX = (48.02, 11.35, 48.28, 11.85)


def build_query() -> str:
    south, west, north, east = MUNICH_BBOX
    bbox = f"{south},{west},{north},{east}"
    return f"""
[out:json][timeout:180];
(
  node["amenity"="restaurant"]({bbox});
  way["amenity"="restaurant"]({bbox});
  relation["amenity"="restaurant"]({bbox});
  node["amenity"="cafe"]({bbox});
  way["amenity"="cafe"]({bbox});
  relation["amenity"="cafe"]({bbox});
  node["amenity"="fast_food"]({bbox});
  way["amenity"="fast_food"]({bbox});
  relation["amenity"="fast_food"]({bbox});
  node["amenity"="bar"]({bbox});
  way["amenity"="bar"]({bbox});
  relation["amenity"="bar"]({bbox});
  node["amenity"="pub"]({bbox});
  way["amenity"="pub"]({bbox});
  relation["amenity"="pub"]({bbox});
  node["amenity"="food_court"]({bbox});
  way["amenity"="food_court"]({bbox});
  relation["amenity"="food_court"]({bbox});
);
out center tags;
""".strip()


def fetch_from_endpoint(endpoint: str, query: str) -> dict[str, Any]:
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "User-Agent": "CityIntelligenceCockpit/0.1 (local prototype)",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=210) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_overpass(query: str, endpoints: list[str]) -> dict[str, Any]:
    last_error: Exception | None = None
    for endpoint in endpoints:
        try:
            print(f"Querying {endpoint}", file=sys.stderr)
            return fetch_from_endpoint(endpoint, query)
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = error
            print(f"Overpass endpoint failed: {endpoint}: {error}", file=sys.stderr)

    if last_error is not None:
        raise last_error
    raise RuntimeError("No Overpass endpoints configured.")


def first_tag(tags: dict[str, Any], *names: str) -> str:
    for name in names:
        value = tags.get(name)
        if value:
            return str(value)
    return ""


def format_address(tags: dict[str, Any]) -> str:
    full_address = first_tag(tags, "addr:full")
    if full_address:
        return full_address

    street = first_tag(tags, "addr:street")
    house_number = first_tag(tags, "addr:housenumber")
    postcode = first_tag(tags, "addr:postcode")
    city = first_tag(tags, "addr:city")

    street_line = " ".join(part for part in [street, house_number] if part)
    city_line = " ".join(part for part in [postcode, city] if part)
    return ", ".join(part for part in [street_line, city_line] if part)


def food_type(tags: dict[str, Any]) -> str:
    return first_tag(tags, "amenity")


def element_coordinates(element: dict[str, Any]) -> tuple[float, float] | None:
    if "lon" in element and "lat" in element:
        return float(element["lon"]), float(element["lat"])

    center = element.get("center")
    if isinstance(center, dict) and "lon" in center and "lat" in center:
        return float(center["lon"]), float(center["lat"])

    return None


def element_to_feature(element: dict[str, Any]) -> dict[str, Any] | None:
    coordinates = element_coordinates(element)
    if coordinates is None:
        return None

    tags = element.get("tags")
    if not isinstance(tags, dict):
        tags = {}

    properties = {
        "name": first_tag(tags, "name", "official_name", "brand", "operator")
        or "Unnamed restaurant",
        "category": "Restaurant",
        "food_type": food_type(tags),
        "cuisine": first_tag(tags, "cuisine"),
        "address": format_address(tags),
        "phone": first_tag(tags, "contact:phone", "phone"),
        "website": first_tag(tags, "contact:website", "website", "url"),
        "opening_hours": first_tag(tags, "opening_hours"),
        "osm_id": element.get("id", ""),
        "osm_type": element.get("type", ""),
        "source": SOURCE,
        "opportunity_score": "",
        "notes": "",
    }

    return {
        "type": "Feature",
        "properties": properties,
        "geometry": {"type": "Point", "coordinates": list(coordinates)},
    }


def to_geojson(overpass_data: dict[str, Any]) -> dict[str, Any]:
    elements = overpass_data.get("elements", [])
    if not isinstance(elements, list):
        elements = []

    features = []
    seen = set()
    for element in elements:
        if not isinstance(element, dict):
            continue
        key = (element.get("type"), element.get("id"))
        if key in seen:
            continue
        seen.add(key)
        feature = element_to_feature(element)
        if feature is not None:
            features.append(feature)

    features.sort(
        key=lambda feature: (
            str(feature["properties"]["name"]).lower(),
            str(feature["properties"]["food_type"]).lower(),
            str(feature["properties"]["cuisine"]).lower(),
            str(feature["properties"]["osm_type"]),
            str(feature["properties"]["osm_id"]),
        )
    )

    return {
        "type": "FeatureCollection",
        "name": "Munich Restaurants",
        "source": SOURCE,
        "features": features,
    }


def default_output_path() -> Path:
    project_root = Path(__file__).resolve().parents[1]
    return (
        project_root
        / "open-source"
        / "TerriaMap"
        / "wwwroot"
        / "data"
        / "city-intelligence"
        / "munich-restaurants.geojson"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch real Munich restaurant data from OpenStreetMap Overpass."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output_path(),
        help="GeoJSON output path.",
    )
    parser.add_argument(
        "--endpoint",
        action="append",
        dest="endpoints",
        help="Overpass endpoint URL. Can be passed more than once.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    query = build_query()
    overpass_data = fetch_overpass(query, args.endpoints or OVERPASS_ENDPOINTS)
    geojson = to_geojson(overpass_data)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(geojson, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(geojson['features'])} restaurants to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
