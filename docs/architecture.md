# Architecture

City Intelligence Cockpit is a local-first geospatial prototype. The current
system is intentionally simple: a customized frontend, static local/public data,
browser localStorage for default lead storage, an optional local SQLite backend,
and offline rule-based scoring/outreach.

## App Structure

Repository root:

`/Users/farbod/Projects/city-intelligence-cockpit`

Main app:

`open-source/TerriaMap`

Important app files:

- `open-source/TerriaMap/wwwroot/config.json`: app config, basemaps, token-free
  defaults, and startup init selection.
- `open-source/TerriaMap/wwwroot/init/city-intelligence.json`: catalog groups,
  business layers, public data layers, visual references, and default workbench.
- `open-source/TerriaMap/wwwroot/index.ejs`: product shell.
- `open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx`: Saved Leads
  panel and mini CRM controls.
- `open-source/TerriaMap/lib/CityIntelligence/leads.ts`: local lead storage,
  import/export, scoring, and outreach helpers.
- `backend/app.py`: optional localhost lead API for manual SQLite sync.
- `backend/db.py`: SQLite persistence helpers used by the backend and scripts.

## Data Layer

Local business GeoJSON files live under:

`open-source/TerriaMap/wwwroot/data/city-intelligence/`

These files are served as static assets by the local development server. The app
does not need a database to load them.

Business data is generated from OSM/Overpass scripts in `scripts/`:

- pharmacies
- offices
- office sublayers
- clinics
- coworking spaces
- restaurants

Public data layers are configured in `city-intelligence.json` when they are
stable, no-key, and useful in the app. Unstable sources are documented instead
of exposed as broken catalog items.

## Lead Workflow

The Saved Leads workflow is fully in-browser:

1. A user selects a map feature.
2. `Import Selected Feature` maps feature properties into the lead form.
3. `Save Lead` normalizes and stores the record in localStorage.
4. The lead list reads from localStorage and supports editing, status changes,
   verification, scoring, outreach, export, backup, and restore.

Storage key:

`city-intelligence-cockpit.leads`

Browser localStorage remains the default storage path. Optional SQLite storage
is available through manual sync controls and scripts, but the frontend keeps
working when the backend is off.

## Scoring And Outreach

Scoring and outreach are local rule-based helpers. They do not call OpenAI, paid
APIs, or external services. The outreach queue creates local review drafts only;
it does not send email, use Gmail, or use SMTP.

The rules live in:

`open-source/TerriaMap/lib/CityIntelligence/leads.ts`

The dry-run scoring script mirrors the local approach:

`scripts/score-opportunity.py`

## Local-Only Model

Current non-goals:

- no deployment
- no authentication
- no required backend
- no cloud database
- no paid APIs
- no API-key requirement
- no automatic outreach sending

The only server in local development is the static app server started by:

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
```

Optional local backend:

```bash
python3 backend/app.py --host 127.0.0.1 --port 8000
```

Dataset refresh is local/manual or user-installed scheduling through
`scripts/refresh-all-datasets.sh`; it is not true streaming or a hosted live
data service.

## Extension Points

- Add or refresh local datasets with scripts in `scripts/`.
- Add safe catalog entries in `city-intelligence.json`.
- Add manual imports using `docs/import-datasets.md`.
- Extend lead fields in `leads.ts` and document them in `docs/lead-schema.md`.
- Extend scoring/outreach rules in `leads.ts` and `scripts/score-opportunity.py`.
- Promote the optional backend only if cloud sync or multi-user access becomes
  an explicit product decision later.
