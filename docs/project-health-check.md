# Project Health Check

Run the local project health check from the repository root:

```bash
bash scripts/project-health-check.sh
```

The script verifies:

- current branch is `main`
- git status is printed for review
- key app, data, backend, documentation, and script files exist
- all app GeoJSON files parse
- expected feature counts match for all main layers and office sublayers
- feature counts are printed for review
- office sublayer counts sum to `6,706`
- all GeoJSON features include local verification fields
- catalog order, pharmacy-only workbench, OpenStreetMap/Esri/CARTO basemaps, public dataset groups, and optional visual layers are valid
- public catalogue groups do not contain empty placeholder groups
- risky tracked files such as `node_modules`, build output, logs, caches, and `.env*` are absent
- local SQLite DBs, generated logs, Python caches, `.sqlite`, `.db`, and `.pyc`
  files are not tracked
- local SQLite DBs, refresh logs, and Python cache paths are ignored
- token-looking API keys or secrets are absent from tracked files
- `.env.local` is ignored
- documented run commands use Node 22 and `yarn gulp dev`
- backend, dataset refresh, and outreach queue docs include the expected local
  commands or controls

The check is local-only. It does not call external APIs, does not require
secrets, and does not modify project files.

## When To Run It

- before committing a stage
- after editing `city-intelligence.json`
- after adding or replacing GeoJSON data
- after changing lead workflow code
- before taking screenshots
- before final handoff

## What A Pass Means

A passing health check means the main project invariants still hold. It does not
replace browser QA. Always open the app after user-facing changes and confirm the
map, catalog, and Saved Leads panel still work.
