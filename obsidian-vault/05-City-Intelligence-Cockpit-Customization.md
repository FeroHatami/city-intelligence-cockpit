# City Intelligence Cockpit Customization

## What Changed

- Set the City Intelligence Cockpit local prototype to load only the focused `city-intelligence` init.
- Disabled token-dependent Cesium ion terrain, Cesium ion Bing imagery, and Cesium ion search so the app opens without terrain 401 popups or API keys.
- Added `Natural Earth` and `Satellite View` as selectable no-key basemaps in Map Settings while keeping `OpenStreetMap` as the default startup basemap. Natural Earth uses a public raster tile template; Satellite View uses EOX Sentinel-2 cloudless WMTS tile imagery.
- Removed the default sample init from startup, hiding the old Australian sample catalog and brittle sample layers from the cockpit.
- Added Munich default `homeCamera` and `initialCamera` bounds.
- Set the initial viewer mode to `2d` for a stable Munich-first local prototype. 3D mode remains available through Map Settings.
- Renamed visible app branding to `City Intelligence Cockpit`.
- Added a `City Intelligence Cockpit` catalog group with a real `Munich Pharmacies` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Offices` GeoJSON layer from OpenStreetMap.
- Split `Munich Offices` into focused business sublayers while keeping `Munich Offices — All`.
- Added a real `Munich Coworking Spaces` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Clinics` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Restaurants` GeoJSON layer from OpenStreetMap.
- Cleaned the `City Intelligence Cockpit` catalog group so all current layers use real-data descriptions and a consistent layer order.
- Added top-level public dataset catalog groups for `Munich Public Datasets`, `Germany Public Datasets`, and `Europe Public Datasets`, with verified no-key live layers instead of empty placeholder groups.
- Added official Munich public live layers for city districts, traffic signals, construction sites, disabled parking, EV charging, mobility points, carsharing parking, cycling routes, shared-mobility parking/geofences, digital 3L zones, and drinking fountains.
- Added official Germany public live layers for basemap.de raster context and BKG VG250 administrative boundaries.
- Added official Europe public live layers for GISCO countries, GISCO NUTS 2024 levels 0-3, and Copernicus/EEA Corine Land Cover 2018.
- Restored optional `Natural Earth II (Optional Visual Layer)`, `Satellite View (Optional Visual Layer)`, `Germany basemap.de Context (Optional WMS)`, and Munich-only official 3D dataset footprints under `Visual Reference Layers`, disabled by default and without token-dependent terrain.
- Added an offline AI opportunity scoring foundation with dry-run rule-based scoring.
- Added a first in-app `Saved Leads` workflow backed by browser localStorage.
- Connected selected map features to the `Saved Leads` workflow with `Import Selected Feature`.
- Added in-app rule-based lead scoring with the `Score Lead` button.
- Backed up the original starter pharmacy file to `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.starter.backup.geojson`.
- Added `scripts/fetch-munich-3d-datasets.py` to refresh Munich-only official 3D dataset footprints from Bavaria OpenData KML metadata.
- Added `scripts/fetch-munich-pharmacies.py` to refresh the Munich pharmacy layer from Overpass.
- Added `scripts/fetch-munich-offices.py` to refresh the Munich offices layer from Overpass.
- Added `scripts/split-munich-offices.py` to regenerate local office sublayers from `munich-offices.geojson`.
- Added `scripts/fetch-munich-coworking.py` to refresh the Munich coworking layer from Overpass.
- Added `scripts/fetch-munich-clinics.py` to refresh the Munich clinics layer from Overpass.
- Added `scripts/fetch-munich-restaurants.py` to refresh the Munich restaurant layer from Overpass.
- Added `scripts/score-opportunity.py` to generate dry-run opportunity scores from GeoJSON features.
- Added `open-source/TerriaMap/lib/CityIntelligence/leads.ts` for local lead storage, export, and scoring.
- Added `open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx` for the in-app `Saved Leads` panel.

## Files Changed

- `open-source/TerriaMap/wwwroot/config.json`
- `open-source/TerriaMap/wwwroot/index.ejs`
- `open-source/TerriaMap/wwwroot/init/city-intelligence.json`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.starter.backup.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-law-firms.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-consultants.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-real-estate-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-insurance-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-government-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-company-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-generic-office-buildings.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-other-offices.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-coworking.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-clinics.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-restaurants.geojson`
- `open-source/TerriaMap/wwwroot/favicons/manifest.json`
- `open-source/TerriaMap/lib/CityIntelligence/leads.ts`
- `open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx`
- `open-source/TerriaMap/lib/Views/UserInterface.jsx`
- `scripts/fetch-munich-pharmacies.py`
- `scripts/fetch-munich-offices.py`
- `scripts/split-munich-offices.py`
- `scripts/fetch-munich-coworking.py`
- `scripts/fetch-munich-clinics.py`
- `scripts/fetch-munich-restaurants.py`
- `scripts/score-opportunity.py`
- `docs/ai-opportunity-scoring.md`
- `prompts/opportunity-scoring-prompt.md`
- `data/processed/opportunity-scores.sample.json`
- `README.md`

Backup copies with `.backup-city-cockpit` suffix were created before editing existing files.

## How To Run

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
```

## Current Working URL

http://localhost:3001

## Known Warnings

- Sass deprecation warnings may appear during development builds. They are non-fatal.
- The previous map configuration error was caused by an invalid init structure. The custom init is now a plain application init source and the only default init loaded by the app.
- The previous terrain server 401 popup was caused by token-dependent terrain behavior. The local prototype now uses no-token smooth ellipsoid 3D instead of Cesium ion terrain.

## Catalog Organization

The catalog has five top-level groups:

- `City Intelligence Cockpit`
- `Munich Public Datasets`
- `Germany Public Datasets`
- `Europe Public Datasets`
- `Visual Reference Layers`

All business and lead-workflow layers remain grouped under `City Intelligence Cockpit`.

Current layer order:

- `Munich Pharmacies`
- `Munich Offices — All`
- `Munich Law Firms`
- `Munich Consultants`
- `Munich Real Estate Offices`
- `Munich Insurance Offices`
- `Munich Government Offices`
- `Munich Company Offices`
- `Munich Generic Office Buildings`
- `Munich Other Offices`
- `Munich Clinics`
- `Munich Coworking Spaces`
- `Munich Restaurants`

Startup behavior:

- `Munich Pharmacies` is the only layer enabled by default.
- Offices, office sublayers, clinics, coworking spaces, and restaurants are available in the catalog but disabled by default to avoid crowding the startup map.

Category filtering is currently handled by separate catalog layers. Office sublayers are generated locally from `office_type` in `munich-offices.geojson`.

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- The `City Intelligence Cockpit` catalog group appeared clearly in Data.
- Layer order appeared as `Munich Pharmacies`, `Munich Offices — All`, the office sublayers, `Munich Clinics`, `Munich Coworking Spaces`, and `Munich Restaurants`.
- Startup workbench count was `1`, confirming only `Munich Pharmacies` was enabled by default.
- `Munich Coworking Spaces` was enabled manually from the catalog and increased the workbench count from `1` to `2`.

## Public Dataset Catalog

The public dataset catalog separates official public data from the OSM/Overpass business layers used for lead generation.

Real public layers:

- `Munich City Districts (Official GeoJSON)` from Munich GeoPortal WFS.
- `Munich Traffic Signals (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Construction Sites - Next 4 Weeks (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Disabled Parking (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich EV Charging Locations (Official GeoJSON)` and `Munich EV Charging Pillars (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Mobility Points (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Carsharing Parking (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Signed Cycling Network (Official GeoJSON)` and `Munich Old Town Cycling Ring (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Munich Bike-Sharing Parking Areas`, `Munich E-Scooter Parking Areas`, `Munich E-Moped Parking Areas`, `Munich Cargo-Bike Sharing Parking Areas`, `Munich E-Scooter Geofences`, and `Munich Digital 3L Zones` from Munich Open Data / GeoPortal WFS.
- `Munich Drinking Fountains (Official GeoJSON)` from Munich Open Data / GeoPortal WFS.
- `Germany basemap.de Web Raster Color (Official WMS)` and `Germany basemap.de Web Raster Gray (Official WMS)` from BKG / basemap.de.
- `Germany Federal States`, `Germany Districts`, `Germany Municipalities`, and `Germany Administrative Boundary Lines` from BKG VG250 WMS.
- `Europe Countries 2024 (GISCO GeoJSON)` from Eurostat/GISCO.
- `EU NUTS 2024 Level 0 Boundaries (GISCO GeoJSON)` from Eurostat/GISCO.
- `EU NUTS 2024 Level 1 Boundaries (GISCO GeoJSON)` from Eurostat/GISCO.
- `EU NUTS 2024 Level 2 Boundaries (GISCO GeoJSON)` from Eurostat/GISCO.
- `EU NUTS 2024 Level 3 Boundaries (GISCO GeoJSON)` from Eurostat/GISCO.
- `Corine Land Cover 2018 Raster (Copernicus/EEA WMS)` and `Corine Land Cover 2018 Vector (Copernicus/EEA WMS)`.

Munich public categories:

- `Boundaries & Administration`
- `Transport & Mobility`
- `Environment & Green Space`
- `Infrastructure & Utilities`

Germany public categories:

- `Basemaps`
- `Administrative Boundaries`

Europe public categories:

- `Administrative / Statistical Boundaries`
- `Environment`

Optional visual reference layers:

- `Natural Earth II (Optional Visual Layer)` from public Natural Earth raster tiles.
- `Satellite View (Optional Visual Layer)` from EOX Sentinel-2 cloudless tiles.
- `Germany basemap.de Context (Optional WMS)` from BKG / basemap.de.
- `Munich LoD2 3D Buildings (Official CityGML Footprint)` from Bavaria OpenData / LDBV.
- `Munich DGM1 Terrain Model (Official GeoTIFF Footprint)` from Bavaria OpenData / LDBV.
- `Munich DOM20 Surface Model (Official GeoTIFF Footprint)` from Bavaria OpenData / LDBV.
- `Munich Laser Point Cloud (Official LAZ Footprint)` from Bavaria OpenData / LDBV.
- `Munich DOM Mesh Project Areas (Official SLPK Footprints)` from Bavaria OpenData / LDBV.

Research-only sources are documented in `docs/data-sources.md` instead of being
shown as empty catalogue groups. This includes private/commercial candidates
such as Google Places, Foursquare, HERE, TomTom, commercial footfall datasets,
company registry data, and real-estate market data.

Promotion rule:

- Add a public source as a real layer only after confirming the exact official endpoint, layer name, format, licensing, size, and no-key behavior.
- Keep uncertain WMS/WFS/portal resources as reference-only entries to avoid broken catalog layers.
- Keep optional demo visuals disabled by default and separate from the main public data catalog.

## AI Opportunity Scoring Foundation

The current scoring foundation is offline and rule-based. It does not require an API key, does not call paid APIs, and does not overwrite source GeoJSON files unless an explicit output path is provided.

Files:

- `scripts/score-opportunity.py`
- `docs/ai-opportunity-scoring.md`
- `prompts/opportunity-scoring-prompt.md`
- `data/processed/opportunity-scores.sample.json`

The score output structure includes:

- `opportunity_score`
- `score_reason`
- `suggested_offer`
- `suggested_first_message`
- `recommended_next_action`
- `risk_notes`

Run dry-run scoring with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/score-opportunity.py \
  --input open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --source-layer "Munich Pharmacies" \
  --limit 5
```

Verification notes:

- `scripts/score-opportunity.py` parsed successfully.
- Dry-run JSON scoring ran against `Munich Pharmacies` with no API key.
- Dry-run CSV scoring ran against `Munich Restaurants` with no API key.
- Sample output was generated at `data/processed/opportunity-scores.sample.json`.
- Browser loaded `http://localhost:3001/` with no map configuration error after adding the scoring files.

## In-App Local Lead Workflow

The current in-app lead workflow is a localStorage v1 implementation. It does not use authentication, a backend, a database, API keys, or paid API calls.

Storage key:

`city-intelligence-cockpit.leads`

Files:

- `open-source/TerriaMap/lib/CityIntelligence/leads.ts`
- `open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx`
- `open-source/TerriaMap/lib/Views/UserInterface.jsx`

The `Saved Leads` panel supports:

- importing the currently selected map feature into the lead form
- manual lead creation
- saved lead list
- status updates
- notes
- delete
- JSON export
- CSV export
- category-based `Score Lead`

The score button fills:

- `opportunity_score`
- `score_reason`
- `suggested_offer`
- `recommended_next_action`

Selected-feature import reads the active `viewState.terria.selectedFeature`, falls back to `viewState.terria.pickedFeatures.features`, maps known OSM properties into the lead form, and keeps the manual form available as a fallback.

Mapped fields include:

- `name`
- `category`
- `address`
- `phone`
- `website`
- `latitude`
- `longitude`
- `osm_id`
- `osm_type`
- `source`
- `source_layer`

Duplicate protection uses `osm_type` + `osm_id`. If an imported feature already exists in localStorage, the existing lead is loaded for review instead of blindly creating another saved record.

## Real OpenStreetMap Pharmacy Data

The current `Munich Pharmacies` layer is generated from OpenStreetMap via Overpass. It uses the Munich prototype bounds and exports pharmacies tagged with `amenity=pharmacy`.

Each feature includes:

- `name`
- `category`
- `address`
- `phone`
- `website`
- `opening_hours`
- `source`
- `opportunity_score`
- `notes`
- `osm_type`
- `osm_id`

Refresh the layer with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/fetch-munich-pharmacies.py
```

Then run City Intelligence Cockpit:

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
```

The script writes:

`open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson`

## Real OpenStreetMap Office Data

The current `Munich Offices` layer is generated from OpenStreetMap via Overpass. It uses the Munich prototype bounds and exports locations tagged with `office=*` or `building=office`.

The latest fetch wrote `6,706` office features.

The all-offices layer is split into local sublayers with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/split-munich-offices.py
```

Latest split counts:

- `Munich Law Firms`: `184`
- `Munich Consultants`: `82`
- `Munich Real Estate Offices`: `182`
- `Munich Insurance Offices`: `247`
- `Munich Government Offices`: `167`
- `Munich Company Offices`: `1,757`
- `Munich Generic Office Buildings`: `2,204`
- `Munich Other Offices`: `1,883`
- Sublayer total: `6,706`

Each feature includes:

- `name`
- `category`
- `office_type`
- `address`
- `phone`
- `website`
- `opening_hours`
- `osm_id`
- `osm_type`
- `source`
- `opportunity_score`
- `notes`

Refresh the layer with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/fetch-munich-offices.py
```

The script writes:

`open-source/TerriaMap/wwwroot/data/city-intelligence/munich-offices.geojson`

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- `Munich Pharmacies` stayed enabled in the workbench.
- `Munich Offices` appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Offices` was enabled manually from the catalog and increased the workbench count from `1` to `2`.
- Clicking the map opened Feature Information with office records; expanding `Munich Offices - Site Data` showed fields including `Name`, `Category`, `Office Type`, `Address`, `Phone`, `Website`, `Opening Hours`, `Osm Id`, `Osm Type`, and `Source`.

## Real OpenStreetMap Coworking Data

The current `Munich Coworking Spaces` layer is generated from OpenStreetMap via Overpass. It uses the Munich prototype bounds and exports locations tagged with `amenity=coworking_space`, `office=coworking`, `coworking=*`, or coworking-related name matches.

The latest fetch wrote `49` coworking features.

Each feature includes:

- `name`
- `category`
- `coworking_type`
- `address`
- `phone`
- `website`
- `opening_hours`
- `osm_id`
- `osm_type`
- `source`
- `opportunity_score`
- `notes`

Refresh the layer with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/fetch-munich-coworking.py
```

The script writes:

`open-source/TerriaMap/wwwroot/data/city-intelligence/munich-coworking.geojson`

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- `Munich Pharmacies` stayed enabled in the workbench.
- `Munich Offices` still appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Coworking Spaces` appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Coworking Spaces` was enabled manually from the catalog and increased the workbench count from `1` to `2`.
- Clicking the map opened Feature Information with coworking records; expanding `Munich Coworking Spaces - Site Data` showed fields including `Name`, `Category`, `Coworking Type`, `Address`, `Website`, `Opening Hours`, `Osm Id`, `Osm Type`, and `Source`.

## Real OpenStreetMap Clinic Data

The current `Munich Clinics` layer is generated from OpenStreetMap via Overpass. It uses the Munich prototype bounds and exports locations tagged with `amenity=clinic`, `healthcare=clinic`, `amenity=doctors`, `healthcare=doctor`, `amenity=dentist`, or `healthcare=dentist`.

The latest fetch wrote `1,845` clinic features.

Each feature includes:

- `name`
- `category`
- `healthcare_type`
- `address`
- `phone`
- `website`
- `opening_hours`
- `osm_id`
- `osm_type`
- `source`
- `opportunity_score`
- `notes`

Refresh the layer with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/fetch-munich-clinics.py
```

The script writes:

`open-source/TerriaMap/wwwroot/data/city-intelligence/munich-clinics.geojson`

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- `Munich Pharmacies` stayed enabled in the workbench.
- `Munich Offices` still appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Clinics` appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Clinics` was enabled manually from the catalog and increased the workbench count from `1` to `2`.
- Clicking the map opened Feature Information with clinic records; expanding `Munich Clinics - Site Data` showed fields including `Name`, `Category`, `Healthcare Type`, `Address`, `Phone`, `Website`, `Opening Hours`, `Osm Id`, `Osm Type`, and `Source`.

## Real OpenStreetMap Restaurant Data

The current `Munich Restaurants` layer is generated from OpenStreetMap via Overpass. It uses the Munich prototype bounds and exports locations tagged with `amenity=restaurant`, `amenity=cafe`, `amenity=fast_food`, `amenity=bar`, `amenity=pub`, or `amenity=food_court`.

The latest fetch wrote `5,406` restaurant and food-service features.

Each feature includes:

- `name`
- `category`
- `food_type`
- `cuisine`
- `address`
- `phone`
- `website`
- `opening_hours`
- `osm_id`
- `osm_type`
- `source`
- `opportunity_score`
- `notes`

Refresh the layer with:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/fetch-munich-restaurants.py
```

The script writes:

`open-source/TerriaMap/wwwroot/data/city-intelligence/munich-restaurants.geojson`

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- `Munich Pharmacies` stayed enabled in the workbench.
- `Munich Offices`, `Munich Clinics`, and `Munich Coworking Spaces` still appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Restaurants` appeared in the `City Intelligence Cockpit` catalog group.
- `Munich Restaurants` was enabled manually from the catalog and increased the workbench count from `1` to `2`.
- Clicking the map opened Feature Information with restaurant records; expanding `Munich Restaurants - Site Data` showed fields including `Name`, `Category`, `Food Type`, `Cuisine`, `Address`, `Phone`, `Website`, `Opening Hours`, `Osm Id`, `Osm Type`, and `Source`.

## Local Data Verification Fields

All city-intelligence GeoJSON files are locally marked with verification metadata using:

```bash
cd ~/Projects/city-intelligence-cockpit
python3 scripts/add-verification-fields.py
```

The script preserves existing feature properties and adds missing:

- `data_source`
- `verification_status`
- `last_checked_at`

Defaults:

- `data_source`: existing `source`, otherwise `OpenStreetMap / Overpass`
- `verification_status`: `unverified_osm`
- `last_checked_at`: UTC timestamp from the script run

The in-app `Saved Leads` import/export flow preserves these fields so lead exports carry the same local source and verification state.

## Local Outreach Message Generator

The `Saved Leads` panel includes a per-lead `Generate Outreach Message` action. It is fully local and rule-based, with no API key and no network call.

Generated fields:

- `suggested_first_message`
- `outreach_angle`
- `recommended_next_action`

The generator does not modify `notes`. `Copy Message` uses the browser clipboard when available, and the message remains visible in the lead card for manual copy if clipboard access fails.
