# City Intelligence Cockpit Customization

## What Changed

- Set the City Intelligence Cockpit local prototype to load the original `simple` init first, then a focused `city-intelligence` init.
- Added Munich default `homeCamera` and `initialCamera` bounds.
- Set the initial viewer mode to `2d` for a stable Munich-first local prototype. 3D mode remains available through Map Settings.
- Renamed visible app branding to `City Intelligence Cockpit`.
- Added a `City Intelligence Cockpit` catalog group with a real `Munich Pharmacies` GeoJSON layer from OpenStreetMap.
- Backed up the original starter pharmacy file to `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.starter.backup.geojson`.
- Added `scripts/fetch-munich-pharmacies.py` to refresh the Munich pharmacy layer from Overpass.
- Added empty valid GeoJSON placeholders for offices, coworking spaces, clinics, and restaurants.

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
- `scripts/fetch-munich-pharmacies.py`
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
