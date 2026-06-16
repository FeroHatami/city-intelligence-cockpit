# City Intelligence Cockpit

A 2D/3D city intelligence platform for observing a city from above, filtering buildings and businesses, and identifying opportunities using geospatial data and AI.

Initial city focus: Munich, Germany.

Core idea:
- 3D city map
- business/location filters
- OpenStreetMap data
- save places as leads
- AI opportunity scoring
- later: city events, traffic, construction, company intelligence

## How to run local City Intelligence Cockpit prototype

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
open http://localhost:3001
```

## Current Lead-Saving Status

Save-as-lead is currently a data/script foundation, not yet a full in-app button.

Lead schema and sample data:

- `docs/lead-schema.md`
- `data/processed/leads.sample.json`

Create a lead JSON record from a GeoJSON feature:

```bash
python3 scripts/create-lead-from-feature.py \
  --feature-file open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --feature-index 0 \
  --source-layer "Munich Pharmacies"
```
