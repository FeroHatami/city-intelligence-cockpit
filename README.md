# City Intelligence Cockpit

City Intelligence Cockpit is a local-first 2D/3D geospatial prototype for Munich
city intelligence. It combines real OpenStreetMap business layers, official
public geodata, selectable basemaps, and an in-browser lead workflow for saving,
verifying, scoring, and exporting opportunities without deployment or paid APIs.

Initial city focus: Munich, Germany.

## Screenshots

Screenshot placeholders and capture instructions live in
[`docs/screenshots/README.md`](docs/screenshots/README.md).

Recommended screenshots:

- main map with OpenStreetMap
- data catalog with City Intelligence Cockpit layers
- Saved Leads panel
- lead status board and filters
- Esri World Topographic or Satellite View basemap
- local outreach generator
- public dataset catalog groups
- Munich/Bavaria 3D local examples

## Features

- Local Munich map startup view.
- OpenStreetMap, Esri World Topographic, Satellite View, and CARTO Voyager basemaps.
- Real OSM/Overpass business layers for pharmacies, offices, clinics,
  coworking spaces, and restaurants.
- Office sublayers for law firms, consultants, real estate, insurance,
  government, company offices, office buildings, and other offices.
- Official Munich, Germany, and Europe public dataset catalog groups.
- Real Estate Intelligence catalog group with official Munich/Bavaria
  market/value, legal-planning, residential-quality, restriction, building,
  demand-driver, and strategic land-use sources.
- Investor Intelligence panel with local rule-based investment-signal scoring
  that weights land-value and legal-planning context above broad FNP context,
  shows a real-estate legend, reads selected-feature facts when available, and
  exports local area reports.
- Research-only Europe GICS company-data source references, a visible local
  reference layer, and an import template.
- Optional Munich/Bavaria 3D local example footprints.
- Selected-feature import into Saved Leads.
- Manual lead form fallback.
- Duplicate protection using `osm_type` + `osm_id`.
- Local lead status board, filters, counters, and sorting.
- Verification workflow for OSM/public data quality.
- Offline rule-based opportunity scoring.
- Offline rule-based outreach message generation in German and English.
- Semi-automated local outreach queue for review, copy, and CSV export.
- Optional local SQLite backend for manual backup/restore sync.
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
- optional local backend only
- optional local SQLite only
- no authentication
- no deployment

Scoring and outreach generation are local rule-based workflows. They do not call
external AI services. The outreach queue does not send email or messages.

The Investor Intelligence panel uses local rule-based scoring by default. It can
optionally try a local Ollama rewrite if Ollama is already running, but the app
does not require Ollama.

## Data Layers

The startup workbench starts empty. All business layers, including
`Munich Pharmacies`, are available in the catalog and stay disabled until
selected.

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

Real Estate Intelligence details are documented in
[`docs/real-estate-intelligence.md`](docs/real-estate-intelligence.md).

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
9. Add reviewed drafts to the outreach queue if useful.
10. Export CSV/JSON or create a full JSON backup.

Leads persist in browser localStorage under:

`city-intelligence-cockpit.leads`

Use `Backup Leads` for a full local JSON backup. Use `Restore Leads` or
`Restore Pasted JSON` to restore leads into the same browser. Import validates
the JSON and merges duplicates by `id` or `osm_type` + `osm_id`.

Optional local SQLite storage is documented in
[`docs/local-backend.md`](docs/local-backend.md) and
[`docs/lead-storage.md`](docs/lead-storage.md). Browser storage remains the
default and the app keeps working when the backend is off.

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
- `scripts/init-local-db.py`
- `scripts/import-leads-to-sqlite.py`
- `scripts/export-leads-from-sqlite.py`
- `scripts/refresh-all-datasets.sh`
- `scripts/project-health-check.sh`

Local workflow docs:

- [`docs/local-backend.md`](docs/local-backend.md)
- [`docs/lead-storage.md`](docs/lead-storage.md)
- [`docs/local-data-refresh.md`](docs/local-data-refresh.md)
- [`docs/outreach-workflow.md`](docs/outreach-workflow.md)

Manual dataset import workflow:

- [`docs/import-datasets.md`](docs/import-datasets.md)
- [`data/imports/dataset-metadata-template.json`](data/imports/dataset-metadata-template.json)
- [`docs/europe-gics-company-data.md`](docs/europe-gics-company-data.md)
- [`data/imports/europe-gics-company-dataset-template.json`](data/imports/europe-gics-company-dataset-template.json)

## Architecture

The prototype has four local layers:

- App shell: customized geospatial frontend under `open-source/TerriaMap`.
- Catalog config: `open-source/TerriaMap/wwwroot/init/city-intelligence.json`.
- Static data: local GeoJSON files under
  `open-source/TerriaMap/wwwroot/data/city-intelligence`.
- Lead workflow: browser localStorage plus
  `open-source/TerriaMap/lib/CityIntelligence/leads.ts` and the Saved Leads
  panel.
- Optional local backend: `backend/app.py` and SQLite helpers for manual sync.

The Terria server serves the local app and static assets during development.
The optional backend runs separately on `localhost:8000` only when started by
the user.

## Data Disclaimer

OpenStreetMap, Overpass, Munich public data, BKG/basemap.de, Esri basemap
services, CARTO tiles, Eurostat/GISCO, Copernicus/EEA, Bavaria OpenData, and
research-only market-data references are useful for discovery and map context.
They are not guaranteed to be current, complete, or business-ready.

Treat `unverified_osm` and `needs_research` leads as research candidates until a
human checks the website, phone, address, source, and operating status.

## Limitations

- Leads are stored in browser localStorage and can be lost if browser data is
  cleared.
- Optional SQLite sync is local-only and manual.
- There is no multi-user sync, authentication, deployment, or cloud database.
- Scoring and outreach are simple rule-based helpers, not automated sales advice.
- Outreach drafts are never sent automatically.
- OSM and public catalog data can be stale or incomplete.
- Public WMS/WFS services can change or become temporarily unavailable.
- Manual dataset imports require local validation before catalog changes.
- Complete Europe company-level GICS data requires a licensed source before it
  can be promoted from reference/template status to a real map layer.

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

- real deployment, authentication, hosted database, cloud sync, or API-based
  enrichment only if the project intentionally moves beyond local-first mode
