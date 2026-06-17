# Data Sources

City Intelligence Cockpit uses two kinds of sources:

- local business intelligence GeoJSON generated from OpenStreetMap via Overpass API
- official public dataset catalog entries for Munich, Germany, and Europe

The business source files live in:

`open-source/TerriaMap/wwwroot/data/city-intelligence/`

## Business Layers

These layers are local GeoJSON files and power the in-app lead workflow:

- Munich Pharmacies
- Munich Offices - All
- Munich office sublayers
- Munich Clinics
- Munich Coworking Spaces
- Munich Restaurants

They are sourced from OpenStreetMap / Overpass and include local verification
metadata. They are useful for prospecting and city intelligence, but they are not
official municipal records.

## Public Dataset Catalog

The public catalog is organized into:

- `Munich Public Datasets`
- `Germany Public Datasets`
- `Europe Public Datasets`

Live catalog layers are added only when the endpoint is a stable no-key
GeoJSON/WFS output. Broader portals or uncertain WMS/WFS URLs are added as
empty non-loading reference groups so the catalog does not create broken layers.

### Real Public Layers

| Catalog layer | Type | Source |
| --- | --- | --- |
| Munich Traffic Signals (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Lichtsignalanlagen` |
| Munich Drinking Fountains (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Stadtplan der staedtischen Trinkbrunnen` |
| EU NUTS 2024 Level 0 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |

### Reference-Only Items

These items intentionally do not load map tiles or features:

- Munich Open Data Portal
- Munich GeoPortal OpenGeodata
- Munich mobility datasets
- Munich environment, green-zone, and charging resources
- GovData
- Destatis regional statistics
- basemap.de / BKG
- German administrative boundary references
- European Data Portal
- Eurostat/GISCO reference directory

Reference items should be promoted to live layers only after the exact endpoint,
layer name, licensing, expected size, and no-key behavior are verified.

## Terrain And Demo Init Policy

The local app loads only `init/city-intelligence.json`. The upstream `simple`
demo init is not loaded by default, so old sample datasets such as Australian
demo groups, 3D train/demo assets, and Natural Earth preview content do not
appear in the City Intelligence Cockpit catalog.

Cesium ion terrain is disabled by setting `useCesiumIonTerrain` to `false` in
`open-source/TerriaMap/wwwroot/config.json`. With no `cesiumTerrainUrl` or
`cesiumTerrainAssetId`, Terria uses smooth ellipsoid 3D instead of token-backed
terrain. Cesium ion Bing imagery and Cesium ion search are also disabled. No API
key or paid service is required.

## Verification Fields

Each GeoJSON feature should include:

- `data_source`: existing `source` when available, otherwise `OpenStreetMap / Overpass`
- `verification_status`: `unverified_osm`
- `last_checked_at`: UTC timestamp from the last local verification-field script run

These fields are local metadata. They do not verify that a business is currently active; they mark the record as OSM-derived and not yet independently verified.

## Update Command

Run:

```bash
python3 scripts/add-verification-fields.py
```

The script updates every `*.geojson` file in `open-source/TerriaMap/wwwroot/data/city-intelligence/` in place, preserving existing properties and only adding missing verification fields.

## Lead Workflow

When a map feature is imported into `Saved Leads`, the lead form preserves:

- `data_source`
- `verification_status`
- `last_checked_at`

JSON and CSV exports include those fields so exported lead files carry the same provenance and verification state.
