# Optional Local Backend

This backend is optional. City Intelligence Cockpit still works with browser
localStorage when this server is not running.

## What It Does

- Stores leads in local SQLite.
- Exposes local-only HTTP endpoints on `http://localhost:8000`.
- Does not add authentication, cloud sync, paid APIs, or API keys.
- Does not send outreach messages.

Default database path:

`backend/data/city-intelligence.sqlite`

The database file is ignored by git.

## Initialize The Database

```bash
python3 scripts/init-local-db.py
```

## Run With FastAPI

FastAPI is optional and is not installed globally by the project.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Run the `uvicorn` command from the repository root if your shell cannot import
the `backend` package.

## Run Without Installing Dependencies

For local checks, `backend/app.py` also includes a tiny standard-library
fallback server:

```bash
python3 backend/app.py --host 127.0.0.1 --port 8000
```

## Endpoints

- `GET /health`
- `GET /leads`
- `POST /leads`
- `PUT /leads/{id}`
- `DELETE /leads/{id}`
- `POST /leads/import`
- `GET /leads/export/json`
- `GET /leads/export/csv`
