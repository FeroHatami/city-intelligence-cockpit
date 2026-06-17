#!/usr/bin/env python3
"""Fetch official Munich 3D dataset footprints from Bavaria OpenData KML."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "open-source" / "TerriaMap" / "wwwroot" / "data" / "city-intelligence"

USER_AGENT = "City Intelligence Cockpit local dataset fetcher"
KML_NS = {"k": "http://www.opengis.net/kml/2.2"}
MUNICH_NAME = "München"
MUNICH_BBOX = (11.35, 48.02, 11.85, 48.28)

MUNICIPALITY_DATASETS = [
    {
        "output": "munich-3d-lod2-buildings.geojson",
        "source_url": "https://geodaten.bayern.de/odd/a/lod2/citygml/meta/kml/gemeinde.kml?service=kml",
        "name": "Munich LoD2 3D Buildings",
        "dataset_type": "3D buildings",
        "format": "CityGML",
        "official_product": "3D-Gebaeudemodelle (LoD2)",
        "update_frequency": "weekly",
        "description": "Official Bavarian LoD2 building-model download footprint for the City of Munich.",
    },
    {
        "output": "munich-3d-dgm1-terrain.geojson",
        "source_url": "https://geodaten.bayern.de/odd/a/dgm/dgm1/meta/kml/gemeinde.kml?service=kml",
        "name": "Munich DGM1 Terrain Model",
        "dataset_type": "terrain model",
        "format": "GeoTIFF",
        "official_product": "Digitales Gelaendemodell 1m (DGM1)",
        "update_frequency": "batch-based",
        "description": "Official Bavarian 1 m terrain-model download footprint for the City of Munich.",
    },
    {
        "output": "munich-3d-dom20-surface.geojson",
        "source_url": "https://geodaten.bayern.de/odd/a/dom20/meta/DOM/kml/gemeinde.kml?service=kml",
        "name": "Munich DOM20 Surface Model",
        "dataset_type": "surface model",
        "format": "GeoTIFF",
        "official_product": "Digitales Oberflaechenmodell 20cm (DOM20)",
        "update_frequency": "batch-based",
        "description": "Official Bavarian 20 cm surface-model download footprint for the City of Munich.",
    },
    {
        "output": "munich-3d-laser-point-cloud.geojson",
        "source_url": "https://geodaten.bayern.de/odd/a/laser/meta/kml/gemeinde.kml?service=kml",
        "name": "Munich Laser Point Cloud",
        "dataset_type": "laser point cloud",
        "format": "LAZ",
        "official_product": "Laserdaten",
        "update_frequency": "batch-based",
        "description": "Official Bavarian laser point-cloud download footprint for the City of Munich.",
    },
]

DOM_MESH_DATASET = {
    "output": "munich-3d-dom-mesh-project-areas.geojson",
    "source_url": "https://geodaten.bayern.de/odd/m/3/daten/DOMMesh/DOM_Mesh_projektgebiete_2026.kml?service=kml",
    "name": "Munich DOM Mesh Project Areas",
    "dataset_type": "textured surface mesh",
    "format": "SLPK",
    "official_product": "Digitales Oberflaechenmodell Mesh (DOM-Mesh)",
    "update_frequency": "project-based",
    "description": "Official Bavarian DOM Mesh project areas that intersect the Munich prototype bounds.",
}


def fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read().decode("utf-8")


def strip_tags(value: str) -> str:
    return unescape(re.sub(r"<[^>]+>", "", value)).strip()


def parse_description(description: str) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for label, value in re.findall(
        r"<tr>\s*<td>(.*?)</td>\s*<td>(.*?)(?:</td>|<td>|</tr>)",
        description,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        clean_label = strip_tags(label).rstrip(":")
        clean_value = strip_tags(value)
        if clean_label and clean_value:
            metadata[clean_label] = clean_value

    link = re.search(r'href=["\']?([^"\' >]+)', description, flags=re.IGNORECASE)
    if link:
        metadata["download_url"] = unescape(link.group(1))
    return metadata


def parse_coordinates(text: str | None) -> list[list[float]]:
    coordinates: list[list[float]] = []
    if not text:
        return coordinates
    for token in text.split():
        parts = token.split(",")
        if len(parts) >= 2:
            coordinates.append([float(parts[0]), float(parts[1])])
    if coordinates and coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])
    return coordinates


def placemark_geometry(placemark: ET.Element) -> dict[str, Any]:
    polygons: list[list[list[list[float]]]] = []
    for polygon in placemark.findall(".//k:Polygon", KML_NS):
        outer = polygon.find(".//k:outerBoundaryIs/k:LinearRing/k:coordinates", KML_NS)
        outer_ring = parse_coordinates(outer.text if outer is not None else None)
        if not outer_ring:
            continue

        rings = [outer_ring]
        for inner in polygon.findall(".//k:innerBoundaryIs/k:LinearRing/k:coordinates", KML_NS):
            inner_ring = parse_coordinates(inner.text)
            if inner_ring:
                rings.append(inner_ring)
        polygons.append(rings)

    if not polygons:
        raise ValueError("Placemark has no polygon geometry")
    if len(polygons) == 1:
        return {"type": "Polygon", "coordinates": polygons[0]}
    return {"type": "MultiPolygon", "coordinates": polygons}


def geometry_bbox(geometry: dict[str, Any]) -> tuple[float, float, float, float]:
    values: list[list[float]] = []

    def collect(node: Any) -> None:
        if isinstance(node, list) and len(node) >= 2 and all(isinstance(v, float) for v in node[:2]):
            values.append(node[:2])
        elif isinstance(node, list):
            for child in node:
                collect(child)

    collect(geometry["coordinates"])
    xs = [point[0] for point in values]
    ys = [point[1] for point in values]
    return min(xs), min(ys), max(xs), max(ys)


def intersects_munich(geometry: dict[str, Any]) -> bool:
    west, south, east, north = geometry_bbox(geometry)
    munich_west, munich_south, munich_east, munich_north = MUNICH_BBOX
    return not (
        east < munich_west
        or west > munich_east
        or north < munich_south
        or south > munich_north
    )


def base_properties(dataset: dict[str, str], generated_at: str) -> dict[str, str]:
    return {
        "category": "Official 3D Dataset",
        "dataset_type": dataset["dataset_type"],
        "format": dataset["format"],
        "official_product": dataset["official_product"],
        "update_frequency": dataset["update_frequency"],
        "source": "Bavarian OpenData / LDBV",
        "data_source": "Bavarian OpenData / LDBV",
        "verification_status": "official_source_metadata",
        "last_checked_at": generated_at,
        "source_kml": dataset["source_url"],
    }


def feature_from_placemark(
    placemark: ET.Element,
    dataset: dict[str, str],
    generated_at: str,
    name: str | None = None,
) -> dict[str, Any]:
    description = placemark.findtext("k:description", default="", namespaces=KML_NS)
    metadata = parse_description(description)
    properties = base_properties(dataset, generated_at)
    properties.update(
        {
            "name": name or dataset["name"],
            "description": dataset["description"],
            "official_area": metadata.get("Fläche", ""),
            "file_count": metadata.get("Anzahl Dateien", ""),
            "download_size": metadata.get("Größe Download", ""),
            "data_currentness": metadata.get("Aktualität", ""),
            "download_url": metadata.get("download_url", ""),
            "notes": "Dataset is published as official download metadata, not as an in-browser 3D Tiles stream.",
        }
    )
    return {
        "type": "Feature",
        "geometry": placemark_geometry(placemark),
        "properties": properties,
    }


def find_munich_placemark(root: ET.Element) -> ET.Element:
    for placemark in root.findall(".//k:Placemark", KML_NS):
        if placemark.findtext("k:name", default="", namespaces=KML_NS) == MUNICH_NAME:
            return placemark
    raise ValueError("Could not find exact Munich placemark")


def write_feature_collection(path: Path, features: list[dict[str, Any]], generated_at: str) -> None:
    collection = {
        "type": "FeatureCollection",
        "name": path.stem,
        "generated_at": generated_at,
        "features": features,
    }
    path.write_text(json.dumps(collection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_municipality_dataset(dataset: dict[str, str], generated_at: str) -> int:
    root = ET.fromstring(fetch_text(dataset["source_url"]))
    feature = feature_from_placemark(find_munich_placemark(root), dataset, generated_at)
    write_feature_collection(OUTPUT_DIR / dataset["output"], [feature], generated_at)
    return 1


def write_dom_mesh_dataset(generated_at: str) -> int:
    dataset = DOM_MESH_DATASET
    root = ET.fromstring(fetch_text(dataset["source_url"]))
    features: list[dict[str, Any]] = []
    for placemark in root.findall(".//k:Placemark", KML_NS):
        geometry = placemark_geometry(placemark)
        if not intersects_munich(geometry):
            continue
        placemark_id = placemark.findtext("k:name", default="", namespaces=KML_NS)
        feature = feature_from_placemark(
            placemark,
            dataset,
            generated_at,
            name=f"Munich DOM Mesh Project Area {placemark_id}",
        )
        feature["properties"]["project_area_id"] = placemark_id
        feature["properties"]["intersects_munich_prototype_bounds"] = "true"
        feature["properties"]["notes"] = (
            "Official DOM Mesh project area intersects Munich; footprint is not clipped to the city boundary."
        )
        features.append(feature)

    if not features:
        raise ValueError("Could not find DOM Mesh project areas intersecting Munich")
    write_feature_collection(OUTPUT_DIR / dataset["output"], features, generated_at)
    return len(features)


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

    counts: dict[str, int] = {}
    for dataset in MUNICIPALITY_DATASETS:
        counts[dataset["output"]] = write_municipality_dataset(dataset, generated_at)
    counts[DOM_MESH_DATASET["output"]] = write_dom_mesh_dataset(generated_at)

    for filename, count in counts.items():
        print(f"{filename}: {count} feature(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
