# Optional Local SQLite Backend

City Intelligence Cockpit remains local-first. The browser localStorage lead
workflow still works without a backend. The optional backend adds a stronger
local SQLite persistence layer for people who want file-based lead storage.

## Guarantees

- Local only.
- No deployment.
- No authentication.
- No API keys.
- No paid services.
- No cloud database.
- No automatic email or outreach sending.
- Existing browser localStorage workflow continues to work when the backend is
  off.

## Files

- `backend/app.py`: optional HTTP API. Uses FastAPI when dependencies are
  installed and includes a standard-library fallback for local checks.
- `backend/db.py`: SQLite access and lead import/export helpers.
- `backend/models.py`: database path and lead field definitions.
- `backend/requirements.txt`: optional FastAPI/uvicorn dependencies.
- `scripts/init-local-db.py`: creates the SQLite database and schema.

Default DB path:

`backend/data/city-intelligence.sqlite`

This file is ignored by git.

## Initialize

```bash
python3 scripts/init-local-db.py
```

## Run The Local Backend

No-dependency fallback:

```bash
python3 backend/app.py --host 127.0.0.1 --port 8000
```

FastAPI mode:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

## API

- `GET /health`
- `GET /leads`
- `POST /leads`
- `PUT /leads/{id}`
- `DELETE /leads/{id}`
- `POST /leads/import`
- `GET /leads/export/json`
- `GET /leads/export/csv`

## Lead Fields

The SQLite schema mirrors the current local lead workflow:

- `id`
- `name`
- `category`
- `address`
- `phone`
- `website`
- `latitude`
- `longitude`
- `osm_id`
- `osm_type`
- `source_layer`
- `source`
- `opportunity_score`
- `score_reason`
- `suggested_offer`
- `suggested_first_message`
- `outreach_angle`
- `recommended_next_action`
- `risk_notes`
- `notes`
- `status`
- `verification_status`
- `last_checked_at`
- `verified_by`
- `created_at`
- `updated_at`

## Backend-Off Behavior

The frontend does not require this backend. If it is not running, leads still
save, edit, score, export, import, and persist in browser localStorage.

## Saved Leads Panel Controls

The `Saved Leads` panel includes optional `Local Backend` controls:

- `Check Local Backend`
- `Sync Leads to Local Backend`
- `Load Leads from Local Backend`

These buttons only run when the user selects them. There is no automatic sync.

If the backend is not running, the app shows:

`Local backend is not running. Browser storage still works.`

This is expected and safe. Browser localStorage remains the primary in-app lead
storage path.
