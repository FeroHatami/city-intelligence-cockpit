# Lead Storage

City Intelligence Cockpit now has two local lead storage paths:

1. Browser localStorage, which remains the default in-app workflow.
2. Optional local SQLite, which can be used for backups, migration, and stronger
   file-based persistence.

No backend is required for normal use. The Saved Leads panel still works when
the backend is off.

## Browser localStorage

The app stores browser leads under:

`city-intelligence-cockpit.leads`

Use the in-app `Backup Leads JSON`, `Import Leads JSON`, JSON export, and CSV
export controls for browser-only backups.

## SQLite Database

Default path:

`backend/data/city-intelligence.sqlite`

The database is ignored by git.

Initialize it:

```bash
python3 scripts/init-local-db.py
```

## Import Browser JSON To SQLite

Export a JSON backup from the app, then run:

```bash
python3 scripts/import-leads-to-sqlite.py path/to/leads.json
```

For testing with the sample lead file:

```bash
python3 scripts/import-leads-to-sqlite.py data/processed/leads.sample.json
```

Duplicate protection:

- use `osm_type + osm_id` when both exist
- otherwise use `id`

If a duplicate exists, the script updates the existing SQLite row instead of
blindly inserting another record.

## Export SQLite Leads

```bash
python3 scripts/export-leads-from-sqlite.py
```

Default outputs:

- `data/processed/leads.sqlite-export.json`
- `data/processed/leads.sqlite-export.csv`

Only commit generated exports when they contain sample or intentionally public
test data. Do not commit personal lead records.

## Optional Local Backend API

The same SQLite file can be served locally by:

```bash
python3 backend/app.py --host 127.0.0.1 --port 8000
```

or, after installing optional dependencies:

```bash
uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

The frontend must continue to work even when this backend is not running.
