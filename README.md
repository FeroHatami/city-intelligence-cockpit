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

Save-as-lead is now available in-app as a localStorage v1 workflow. It does not require authentication, a backend, or a database.

Lead schema and sample data:

- `docs/lead-schema.md`
- `data/processed/leads.sample.json`

Use the app:

1. Open `http://localhost:3001`.
2. Click a map feature from one of the Munich layers.
3. Open `Saved Leads`.
4. Select `Import Selected Feature`.
5. Review the populated lead form.
6. Select `Save Lead`.

The manual form remains available as a fallback when a feature has not been selected or needs extra analyst cleanup.

Duplicate protection uses `osm_type` + `osm_id`; importing an already saved OSM feature loads the existing lead for review instead of blindly creating another lead.

Saved leads persist in browser localStorage under:

`city-intelligence-cockpit.leads`

Export saved leads from the same panel with `Export JSON` or `Export CSV`.

Create a lead JSON record from a GeoJSON feature:

```bash
python3 scripts/create-lead-from-feature.py \
  --feature-file open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --feature-index 0 \
  --source-layer "Munich Pharmacies"
```

## Current Munich Layers

The local catalog keeps `Munich Pharmacies` enabled by default and leaves heavier layers disabled until selected manually.

Office data is available as `Munich Offices — All` plus focused sublayers generated from `office_type` in the all-offices GeoJSON:

- Munich Offices — All: 6,706
- Munich Law Firms: 184
- Munich Consultants: 82
- Munich Real Estate Offices: 182
- Munich Insurance Offices: 247
- Munich Government Offices: 167
- Munich Company Offices: 1,757
- Munich Generic Office Buildings: 2,204
- Munich Other Offices: 1,883

Refresh the office sublayers after updating `munich-offices.geojson`:

```bash
python3 scripts/split-munich-offices.py
```

## Terrain And Public Dataset Catalog

The local app now loads only `init/city-intelligence.json`. The upstream `simple`
demo init is no longer loaded by default, which removes the old Australian demo
catalog, 3D train/demo assets, Natural Earth preview basemap, and other sample
layers from the City Intelligence Cockpit startup.

Cesium ion terrain, Cesium ion Bing imagery, and the Cesium ion search provider
are disabled in `open-source/TerriaMap/wwwroot/config.json`. No Cesium ion token,
API key, paid API, backend, or database is required. 3D mode remains available as
smooth ellipsoid 3D rather than token-backed terrain.

The catalog now has four top-level groups:

- `City Intelligence Cockpit`: local OSM/Overpass business layers and lead workflow sources.
- `Munich Public Datasets`: official Munich Open Data / GeoPortal layers and references.
- `Germany Public Datasets`: official Germany-wide public data references.
- `Europe Public Datasets`: official EU public data references and GISCO layers.

Real public layers currently added:

- `Munich Traffic Signals (Official GeoJSON)` from Munich Open Data WFS.
- `Munich Drinking Fountains (Official GeoJSON)` from Munich Open Data WFS.
- `EU NUTS 2024 Level 0 Boundaries (GISCO GeoJSON)` from Eurostat/GISCO.

Reference-only catalog items use empty Terria groups with descriptions. They
document official portals without attempting to load uncertain or unstable
WMS/WFS URLs.

## Current Opportunity Scoring Status

AI opportunity scoring is available in-app with the `Score Lead` button and remains available as an offline dry-run script. It does not require an API key, does not call paid APIs, and does not overwrite source GeoJSON files unless an explicit output path is provided.

Scoring docs and prompt:

- `docs/ai-opportunity-scoring.md`
- `prompts/opportunity-scoring-prompt.md`
- `data/processed/opportunity-scores.sample.json`

Run dry-run scoring:

```bash
python3 scripts/score-opportunity.py \
  --input open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --source-layer "Munich Pharmacies" \
  --limit 5
```
