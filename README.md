# City Intelligence Cockpit

City Intelligence Cockpit is a local-first 2D/3D geospatial prototype for Munich
city intelligence. It combines real OpenStreetMap business layers, official
public geodata, selectable basemaps, and an in-browser lead workflow for saving,
verifying, scoring, and exporting opportunities without a backend or paid API.

Initial city focus: Munich, Germany.

## Screenshots

Screenshot placeholders and capture instructions live in
[`docs/screenshots/README.md`](docs/screenshots/README.md).

Recommended screenshots:

- main map with OpenStreetMap
- data catalog with City Intelligence Cockpit layers
- Saved Leads panel
- lead status board and filters
- Natural Earth basemap
- local outreach generator
- public dataset catalog groups
- Munich/Bavaria 3D local examples

## Features

- Local Munich map startup view.
- OpenStreetMap, Natural Earth, and Satellite View basemaps.
- Real OSM/Overpass business layers for pharmacies, offices, clinics,
  coworking spaces, and restaurants.
- Office sublayers for law firms, consultants, real estate, insurance,
  government, company offices, office buildings, and other offices.
- Official Munich, Germany, and Europe public dataset catalog groups.
- Optional Munich/Bavaria 3D local example footprints.
- Selected-feature import into Saved Leads.
- Manual lead form fallback.
- Duplicate protection using `osm_type` + `osm_id`.
- Local lead status board, filters, counters, and sorting.
- Verification workflow for OSM/public data quality.
- Offline rule-based opportunity scoring.
- Offline rule-based outreach message generation in German and English.
- JSON/CSV export plus JSON backup and restore.
- Project health check script.

## Local Run

Use Node 22.

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
open http://localhost:3001
```

Health check:

```bash
cd ~/Projects/city-intelligence-cockpit
bash scripts/project-health-check.sh
```

No deployment is required.

## No API Key Policy

The current prototype is intentionally local and free:

- no OpenAI API
- no paid APIs
- no Cesium ion token
- no backend
- no database
- no authentication
- no deployment

Scoring and outreach generation are local rule-based workflows. They do not call
external AI services.

## Data Layers

The startup workbench enables `Munich Pharmacies` by default. Heavier layers are
available in the catalog and disabled until selected.

Business layers:

- Munich Pharmacies: 414 real OSM/Overpass features
- Munich Offices - All: 6,706 real OSM/Overpass features
- Munich Clinics: 1,845 real OSM/Overpass features
- Munich Coworking Spaces: 49 real OSM/Overpass features
- Munich Restaurants: 5,406 real OSM/Overpass features

Office sublayers generated from `office_type`:

- Munich Law Firms: 184
- Munich Consultants: 82
- Munich Real Estate Offices: 182
- Munich Insurance Offices: 247
- Munich Government Offices: 167
- Munich Company Offices: 1,757
- Munich Generic Office Buildings: 2,204
- Munich Other Offices: 1,883

Public dataset catalog groups:

- `Munich Public Datasets`
- `Germany Public Datasets`
- `Europe Public Datasets`
- `Visual Reference Layers`

Public catalog details are documented in
[`docs/data-sources.md`](docs/data-sources.md).

## Lead Workflow

Open `Saved Leads` in the app.

Typical selected-feature flow:

1. Click a map feature from a Munich layer.
2. Open `Saved Leads`.
3. Select `Import Selected Feature`.
4. Review the populated form.
5. Select `Save Lead`.
6. Change status or verification status as research progresses.
7. Select `Score Lead`.
8. Select an outreach template and generate a local message.
9. Export CSV/JSON or create a full JSON backup.

Leads persist in browser localStorage under:

`city-intelligence-cockpit.leads`

Use `Backup Leads JSON` for a full local backup. Use `Import Leads JSON` or
`Import Pasted JSON` to restore leads into the same browser. Import validates the
JSON and merges duplicates by `id` or `osm_type` + `osm_id`.

Lead schema:

- [`docs/lead-schema.md`](docs/lead-schema.md)
- [`data/processed/leads.sample.json`](data/processed/leads.sample.json)

## Scripts

Fetch and prepare local OSM layers:

- `scripts/fetch-munich-pharmacies.py`
- `scripts/fetch-munich-offices.py`
- `scripts/split-munich-offices.py`
- `scripts/fetch-munich-clinics.py`
- `scripts/fetch-munich-coworking.py`
- `scripts/fetch-munich-restaurants.py`

Lead and scoring utilities:

- `scripts/create-lead-from-feature.py`
- `scripts/score-opportunity.py`
- `scripts/add-verification-fields.py`
- `scripts/project-health-check.sh`

Manual dataset import workflow:

- [`docs/import-datasets.md`](docs/import-datasets.md)
- [`data/imports/dataset-metadata-template.json`](data/imports/dataset-metadata-template.json)

## Architecture

The prototype has four local layers:

- App shell: customized geospatial frontend under `open-source/TerriaMap`.
- Catalog config: `open-source/TerriaMap/wwwroot/init/city-intelligence.json`.
- Static data: local GeoJSON files under
  `open-source/TerriaMap/wwwroot/data/city-intelligence`.
- Lead workflow: browser localStorage plus
  `open-source/TerriaMap/lib/CityIntelligence/leads.ts` and the Saved Leads
  panel.

There is no server-side lead store. The Terria server only serves the local app
and static assets during development.

## Data Disclaimer

OpenStreetMap, Overpass, Munich public data, BKG/basemap.de, Eurostat/GISCO,
Copernicus/EEA, and Bavaria OpenData sources are useful for discovery and map
context. They are not guaranteed to be current, complete, or business-ready.

Treat `unverified_osm` and `needs_research` leads as research candidates until a
human checks the website, phone, address, source, and operating status.

## Limitations

- Leads are stored in browser localStorage and can be lost if browser data is
  cleared.
- There is no multi-user sync, authentication, backend, or database.
- Scoring and outreach are simple rule-based helpers, not automated sales advice.
- OSM and public catalog data can be stale or incomplete.
- Public WMS/WFS services can change or become temporarily unavailable.
- Manual dataset imports require local validation before catalog changes.

## Roadmap

Short term:

- finish manual QA docs
- add representative screenshots
- keep health checks current
- improve layer descriptions and import templates as new data is added

Medium term:

- richer local lead qualification fields
- optional local analytics summaries
- stronger CSV/GeoJSON import helpers
- improved public dataset review workflow

Optional later work:

- backend, authentication, deployment, hosted database, or API-based scoring only
  if the project intentionally moves beyond local-first mode
