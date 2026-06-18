from __future__ import annotations

import argparse
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

try:
    from fastapi import FastAPI, HTTPException, Response
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:  # FastAPI is optional until the user installs requirements.
    FastAPI = None
    HTTPException = None
    Response = None
    CORSMiddleware = None

try:
    from .db import (
        delete_lead,
        import_leads,
        init_db,
        leads_to_csv,
        leads_to_json,
        list_leads,
        update_lead,
        upsert_lead,
    )
    from .models import DEFAULT_DB_PATH
except ImportError:  # pragma: no cover - direct script execution fallback
    from db import (
        delete_lead,
        import_leads,
        init_db,
        leads_to_csv,
        leads_to_json,
        list_leads,
        update_lead,
        upsert_lead,
    )
    from models import DEFAULT_DB_PATH


DB_PATH = Path(os.environ.get("CITY_INTELLIGENCE_DB", DEFAULT_DB_PATH))


def health_payload() -> dict[str, Any]:
    path = init_db(DB_PATH)
    return {
        "status": "ok",
        "service": "city-intelligence-local-backend",
        "database": str(path),
        "lead_count": len(list_leads(path)),
    }


def create_fastapi_app():
    if FastAPI is None:
        return None

    api = FastAPI(
        title="City Intelligence Cockpit Local Backend",
        version="0.1.0",
        description="Optional local-only SQLite backend for lead persistence.",
    )
    api.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @api.get("/health")
    def get_health():
        return health_payload()

    @api.get("/leads")
    def get_leads():
        return list_leads(DB_PATH)

    @api.post("/leads")
    def post_lead(payload: dict[str, Any]):
        lead, created = upsert_lead(payload, DB_PATH)
        return {"lead": lead, "created": created}

    @api.put("/leads/{lead_id}")
    def put_lead(lead_id: str, payload: dict[str, Any]):
        lead = update_lead(lead_id, payload, DB_PATH)
        if lead is None:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead

    @api.delete("/leads/{lead_id}")
    def remove_lead(lead_id: str):
        deleted = delete_lead(lead_id, DB_PATH)
        if not deleted:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {"deleted": True}

    @api.post("/leads/import")
    def post_import(payload: dict[str, Any]):
        records = payload.get("leads") if isinstance(payload, dict) else None
        if not isinstance(records, list):
            raise HTTPException(status_code=400, detail="Expected leads array")
        return import_leads(records, DB_PATH)

    @api.get("/leads/export/json")
    def export_json():
        return Response(
            leads_to_json(list_leads(DB_PATH)),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=leads.json"},
        )

    @api.get("/leads/export/csv")
    def export_csv():
        return Response(
            leads_to_csv(list_leads(DB_PATH)),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads.csv"},
        )

    return api


app = create_fastapi_app()


class LocalBackendHandler(BaseHTTPRequestHandler):
    server_version = "CityIntelligenceLocalBackend/0.1"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "http://localhost:3001")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            return self.send_json(health_payload())
        if path == "/leads":
            return self.send_json(list_leads(DB_PATH))
        if path == "/leads/export/json":
            return self.send_text(
                leads_to_json(list_leads(DB_PATH)), "application/json"
            )
        if path == "/leads/export/csv":
            return self.send_text(leads_to_csv(list_leads(DB_PATH)), "text/csv")
        return self.send_json({"detail": "Not found"}, status=404)

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self.read_json()
        if path == "/leads":
            lead, created = upsert_lead(payload, DB_PATH)
            return self.send_json({"lead": lead, "created": created}, status=201)
        if path == "/leads/import":
            records = payload.get("leads") if isinstance(payload, dict) else None
            if not isinstance(records, list):
                return self.send_json({"detail": "Expected leads array"}, status=400)
            return self.send_json(import_leads(records, DB_PATH))
        return self.send_json({"detail": "Not found"}, status=404)

    def do_PUT(self):
        lead_id = self.lead_id_from_path()
        if not lead_id:
            return self.send_json({"detail": "Not found"}, status=404)
        lead = update_lead(lead_id, self.read_json(), DB_PATH)
        if lead is None:
            return self.send_json({"detail": "Lead not found"}, status=404)
        return self.send_json(lead)

    def do_DELETE(self):
        lead_id = self.lead_id_from_path()
        if not lead_id:
            return self.send_json({"detail": "Not found"}, status=404)
        deleted = delete_lead(lead_id, DB_PATH)
        if not deleted:
            return self.send_json({"detail": "Lead not found"}, status=404)
        return self.send_json({"deleted": True})

    def lead_id_from_path(self) -> str:
        path = urlparse(self.path).path
        prefix = "/leads/"
        return unquote(path[len(prefix) :]) if path.startswith(prefix) else ""

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        body = self.rfile.read(length).decode("utf-8")
        return json.loads(body) if body else {}

    def send_json(self, payload: Any, status: int = 200):
        return self.send_text(json.dumps(payload, indent=2), "application/json", status)

    def send_text(self, payload: str, content_type: str, status: int = 200):
        encoded = payload.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main():
    parser = argparse.ArgumentParser(description="Run the optional local backend.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH))
    args = parser.parse_args()

    global DB_PATH
    DB_PATH = Path(args.db)
    init_db(DB_PATH)
    server = ThreadingHTTPServer((args.host, args.port), LocalBackendHandler)
    print(f"City Intelligence local backend on http://{args.host}:{args.port}")
    print(f"SQLite database: {DB_PATH}")
    print("Install backend/requirements.txt and run uvicorn for FastAPI mode.")
    server.serve_forever()


if __name__ == "__main__":
    main()
