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
- `Demo / Visual Examples`

Live catalog layers are added only when the endpoint is a stable no-key
GeoJSON/WFS output. Broader portals or uncertain WMS/WFS URLs are added as
empty non-loading reference groups so the catalog does not create broken layers.

### Catalog Categories

Munich public data is grouped into:

- Boundaries & Administration
- Transport & Mobility
- Environment & Green Space
- Infrastructure & Utilities
- Health & Public Services
- Buildings & Urban Planning
- Open Data Portals / References

Germany public data is grouped into:

- Basemaps
- Administrative Boundaries
- Transport
- Environment
- Statistics
- Infrastructure
- Open Data Portals / References

Europe public data is grouped into:

- Administrative / Statistical Boundaries
- Environment
- Transport
- Economy / Statistics
- Open Data Portals / References

Optional no-key demo visuals are kept in:

- Basemaps & Visual References
- 3D / Local Examples

### Real Public Layers

| Catalog layer | Type | Source |
| --- | --- | --- |
| Munich Traffic Signals (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Lichtsignalanlagen` |
| Munich Drinking Fountains (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Stadtplan der staedtischen Trinkbrunnen` |
| EU NUTS 2024 Level 0 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 1 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 2 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 3 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |

### Optional Demo Visuals

| Catalog layer | Type | Source |
| --- | --- | --- |
| Natural Earth II (Optional Visual Layer) | URL template imagery | Terria public Natural Earth raster tiles |
| Smooth Geelong Buildings glTF Mini Demo (Local) | CZML/glTF | Local upstream example assets in `wwwroot/test/3d/geelong/` |

The Geelong terrain-aligned demo is intentionally not enabled as a live layer.
The low-poly bus model is also kept as a reference only because the original
live vehicle example depends on an external transport API feed.

### Reference-Only Items

These items intentionally do not load map tiles or features:

- Munich district boundaries and administration references
- Munich Open Data Portal and GeoPortal OpenGeodata
- Munich mobility datasets
- Munich environment, green-zone, and green-space resources
- Munich charging infrastructure, public toilets, waste, and recycling resources
- Munich health, schools, kitas, and public-service resources
- Munich buildings and urban planning resources
- GovData transport, environment, infrastructure, and portal references
- Destatis regional/statistical references
- basemap.de / BKG and BKG Open Data references
- German administrative boundary references
- European Data Portal references for environment and transport
- Eurostat statistics and GISCO reference directory

Reference items should be promoted to live layers only after the exact endpoint,
layer name, licensing, expected size, and no-key behavior are verified.

## Terrain And Demo Init Policy

The local app loads only `init/city-intelligence.json`. The upstream `simple`
demo init is not loaded by default, so old sample datasets such as Australian
demo groups do not appear in the City Intelligence Cockpit catalog.

Cesium ion terrain is disabled by setting `useCesiumIonTerrain` to `false` in
`open-source/TerriaMap/wwwroot/config.json`. With no `cesiumTerrainUrl` or
`cesiumTerrainAssetId`, Terria uses smooth ellipsoid 3D instead of token-backed
terrain. Cesium ion Bing imagery and Cesium ion search are also disabled. No API
key or paid service is required.

The restored Natural Earth and 3D visual examples are optional catalog items,
not startup defaults. They are disabled by default and do not re-enable Cesium
ion terrain, Bing imagery, search, external transport feeds, or API keys.

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
