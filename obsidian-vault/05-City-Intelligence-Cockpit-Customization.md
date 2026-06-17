# City Intelligence Cockpit Customization

## What Changed

- Set the City Intelligence Cockpit local prototype to load the original `simple` init first, then a focused `city-intelligence` init.
- Added Munich default `homeCamera` and `initialCamera` bounds.
- Set the initial viewer mode to `2d` for a stable Munich-first local prototype. 3D mode remains available through Map Settings.
- Renamed visible app branding to `City Intelligence Cockpit`.
- Added a `City Intelligence Cockpit` catalog group with a real `Munich Pharmacies` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Offices` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Coworking Spaces` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Clinics` GeoJSON layer from OpenStreetMap.
- Added a real `Munich Restaurants` GeoJSON layer from OpenStreetMap.
- Cleaned the `City Intelligence Cockpit` catalog group so all current layers use real-data descriptions and a consistent layer order.
- Added an offline AI opportunity scoring foundation with dry-run rule-based scoring.
- Added a first in-app `Saved Leads` workflow backed by browser localStorage.
- Connected selected Terria map features to the `Saved Leads` workflow with `Import Selected Feature`.
- Added in-app rule-based lead scoring with the `Score Lead` button.
- Backed up the original starter pharmacy file to `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.starter.backup.geojson`.
- Added `scripts/fetch-munich-pharmacies.py` to refresh the Munich pharmacy layer from Overpass.
- Added `scripts/fetch-munich-offices.py` to refresh the Munich offices layer from Overpass.
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
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-coworking.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-clinics.geojson`
- `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-restaurants.geojson`
- `open-source/TerriaMap/wwwroot/favicons/manifest.json`
- `open-source/TerriaMap/lib/CityIntelligence/leads.ts`
- `open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx`
- `open-source/TerriaMap/lib/Views/UserInterface.jsx`
- `scripts/fetch-munich-pharmacies.py`
- `scripts/fetch-munich-offices.py`
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
- The previous map configuration error was caused by an invalid init structure. The custom init is now a plain application init source loaded after `simple`.

## Catalog Organization

All City Intelligence Cockpit layers are grouped under one `City Intelligence Cockpit` catalog group.

Current layer order:

- `Munich Pharmacies`
- `Munich Offices`
- `Munich Clinics`
- `Munich Coworking Spaces`
- `Munich Restaurants`

Startup behavior:

- `Munich Pharmacies` is the only layer enabled by default.
- Offices, clinics, coworking spaces, and restaurants are available in the catalog but disabled by default to avoid crowding the startup map.

Category filtering is currently handled by separate catalog layers. More advanced attribute filtering can be added later if it is worth deeper TerriaMap UI work.

Verification notes:

- Browser loaded `http://localhost:3001/` with no map configuration error.
- The `City Intelligence Cockpit` catalog group appeared clearly in Data.
- Layer order appeared as `Munich Pharmacies`, `Munich Offices`, `Munich Clinics`, `Munich Coworking Spaces`, and `Munich Restaurants`.
- Startup workbench count was `1`, confirming only `Munich Pharmacies` was enabled by default.
- `Munich Coworking Spaces` was enabled manually from the catalog and increased the workbench count from `1` to `2`.

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
