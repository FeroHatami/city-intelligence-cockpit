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
GeoJSON/WFS/WMS/TMS output. Broader portals, private data vendors, or uncertain
WMS/WFS URLs are documented here instead of being exposed as empty catalogue
groups.

### Catalog Categories

Munich public data is grouped into:

- Boundaries & Administration
- Transport & Mobility
- Environment & Green Space
- Infrastructure & Utilities

Germany public data is grouped into:

- Basemaps
- Administrative Boundaries

Europe public data is grouped into:

- Administrative / Statistical Boundaries
- Environment

Optional no-key demo visuals are kept in:

- Basemaps & Visual References
- 3D / Local Examples

### Real Public Layers

| Catalog layer | Type | Source |
| --- | --- | --- |
| Munich City Districts (Official GeoJSON) | GeoJSON/WFS | Munich GeoPortal, `vablock_stadtbezirk` |
| Munich Traffic Signals (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Lichtsignalanlagen` |
| Munich Construction Sites - Next 4 Weeks (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `baustellen_opendata` |
| Munich Disabled Parking (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `behindertenparkplaetze` |
| Munich EV Charging Locations (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_els_standort_point` |
| Munich EV Charging Pillars (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_els_saeule_point` |
| Munich Mobility Points (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mp_standort_point` |
| Munich Carsharing Parking (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_carsharing` |
| Munich Signed Cycling Network (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `rad_rsp_route_line` |
| Munich Old Town Cycling Ring (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `rad_altstadt_radlring_line` |
| Munich Bike-Sharing Parking Areas (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mim_abstellfl_bs` |
| Munich E-Scooter Parking Areas (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mim_abstellfl_ts` |
| Munich E-Moped Parking Areas (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mim_abstellfl_ms` |
| Munich Cargo-Bike Sharing Parking Areas (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mim_abstellfl_ls` |
| Munich E-Scooter Geofences (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `ruhver_mim_geofences_poly` |
| Munich Digital 3L Zones (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `digitale_3l_zonen` |
| Munich Drinking Fountains (Official GeoJSON) | GeoJSON/WFS | Munich Open Data / GeoPortal, `Stadtplan der staedtischen Trinkbrunnen` |
| Germany basemap.de Web Raster Color (Official WMS) | WMS | BKG / basemap.de, `de_basemapde_web_raster_farbe` |
| Germany basemap.de Web Raster Gray (Official WMS) | WMS | BKG / basemap.de, `de_basemapde_web_raster_grau` |
| Germany Federal States - VG250 (Official WMS) | WMS | BKG VG250, `vg250_lan` |
| Germany Districts - VG250 (Official WMS) | WMS | BKG VG250, `vg250_krs` |
| Germany Municipalities - VG250 (Official WMS) | WMS | BKG VG250, `vg250_gem` |
| Germany Administrative Boundary Lines - VG250 (Official WMS) | WMS | BKG VG250, `vg250_li` |
| Europe Countries 2024 (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO countries 2024 |
| EU NUTS 2024 Level 0 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 1 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 2 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| EU NUTS 2024 Level 3 Boundaries (GISCO GeoJSON) | GeoJSON | Eurostat/GISCO NUTS 2024 |
| Corine Land Cover 2018 Raster (Copernicus/EEA WMS) | WMS | EEA / Copernicus Land Monitoring Service |
| Corine Land Cover 2018 Vector (Copernicus/EEA WMS) | WMS | EEA / Copernicus Land Monitoring Service |

### Optional Demo Visuals

| Catalog layer | Type | Source |
| --- | --- | --- |
| Natural Earth II (Optional Visual Layer) | TMS imagery | Terria public Natural Earth raster tiles |
| Satellite View (Optional Visual Layer) | URL template imagery | EOX Sentinel-2 cloudless 2025 |
| Germany basemap.de Context (Optional WMS) | WMS | BKG / basemap.de |
| Munich LoD2 3D Buildings (Official CityGML Footprint) | GeoJSON footprint | Bavaria OpenData / LDBV, LoD2 CityGML metadata |
| Munich DGM1 Terrain Model (Official GeoTIFF Footprint) | GeoJSON footprint | Bavaria OpenData / LDBV, DGM1 metadata |
| Munich DOM20 Surface Model (Official GeoTIFF Footprint) | GeoJSON footprint | Bavaria OpenData / LDBV, DOM20 metadata |
| Munich Laser Point Cloud (Official LAZ Footprint) | GeoJSON footprint | Bavaria OpenData / LDBV, laser data metadata |
| Munich DOM Mesh Project Areas (Official SLPK Footprints) | GeoJSON footprint | Bavaria OpenData / LDBV, DOM Mesh project metadata |

The old non-Munich local CZML/glTF demo is removed from the custom catalogue.
The Munich 3D entries are official download footprints and metadata, not live
in-browser 3D Tiles streams. The large source datasets remain CityGML, GeoTIFF,
LAZ, and SLPK downloads for offline 3D/GIS workflows.

### Research-Only Sources

These sources are useful for future expansion, but they are not live catalog
layers yet because they need endpoint, licensing, key, or size checks:

- Munich Open Data and GeoPortal datasets for schools, kitas, public toilets, recycling, green space, noise, planning, demographics, and service facilities.
- GovData and Destatis datasets for national transport, economy, demographics, and public-service statistics.
- data.europa.eu and Eurostat statistical APIs for EU economy, population, business, mobility, and procurement indicators.
- Private/commercial candidates such as Google Places, Foursquare Places, HERE, TomTom, commercial footfall/location-intelligence vendors, company registry datasets, and real-estate market datasets. These should stay out of the app until licensing, cost, API-key, and privacy terms are explicitly approved.

## Terrain And Demo Init Policy

The local app loads only `init/city-intelligence.json`. The upstream `simple`
demo init is not loaded by default, so old sample datasets such as Australian
demo groups do not appear in the City Intelligence Cockpit catalog.

Cesium ion terrain is disabled by setting `useCesiumIonTerrain` to `false` in
`open-source/TerriaMap/wwwroot/config.json`. With no `cesiumTerrainUrl` or
`cesiumTerrainAssetId`, Terria uses smooth ellipsoid 3D instead of token-backed
terrain. Cesium ion Bing imagery and Cesium ion search are also disabled. No API
key or paid service is required.

The restored Natural Earth visual layer and Munich official 3D dataset
footprints are optional catalog items, not startup defaults. They are disabled
by default and do not re-enable Cesium ion terrain, Bing imagery, search,
external transport feeds, or API keys.

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

Refresh the official Munich 3D dataset footprints from Bavaria OpenData KML
metadata:

```bash
python3 scripts/fetch-munich-3d-datasets.py
```

## Lead Workflow

When a map feature is imported into `Saved Leads`, the lead form preserves:

- `data_source`
- `verification_status`
- `last_checked_at`

JSON and CSV exports include those fields so exported lead files carry the same provenance and verification state.
