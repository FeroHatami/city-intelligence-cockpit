#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from backend.db import init_db, leads_to_csv, leads_to_json, list_leads  # noqa: E402
from backend.models import DEFAULT_DB_PATH  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export local SQLite leads to JSON and CSV files."
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help="SQLite database path. Defaults to backend/data/city-intelligence.sqlite.",
    )
    parser.add_argument(
        "--out-dir",
        default=str(ROOT_DIR / "data" / "processed"),
        help="Output directory. Defaults to data/processed.",
    )
    args = parser.parse_args()

    db_path = init_db(args.db)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    leads = list_leads(db_path)

    json_path = out_dir / "leads.sqlite-export.json"
    csv_path = out_dir / "leads.sqlite-export.csv"
    json_path.write_text(leads_to_json(leads) + "\n", encoding="utf-8")
    csv_path.write_text(leads_to_csv(leads), encoding="utf-8")

    print(f"Read SQLite database: {db_path}")
    print(f"Exported {len(leads)} leads")
    print(f"JSON: {json_path}")
    print(f"CSV: {csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
