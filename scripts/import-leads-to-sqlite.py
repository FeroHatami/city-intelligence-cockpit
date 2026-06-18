#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from backend.db import import_leads, init_db, parse_leads_json  # noqa: E402
from backend.models import DEFAULT_DB_PATH  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Import City Intelligence lead JSON into local SQLite."
    )
    parser.add_argument(
        "json_file",
        help="Path to a JSON file exported from the app. Accepts an array or an object with a leads array.",
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help="SQLite database path. Defaults to backend/data/city-intelligence.sqlite.",
    )
    args = parser.parse_args()

    db_path = init_db(args.db)
    content = Path(args.json_file).read_text(encoding="utf-8")
    records = parse_leads_json(content)
    summary = import_leads(records, db_path)
    print(f"Imported into SQLite database: {db_path}")
    print(f"Total: {summary['total']}")
    print(f"Created: {summary['imported']}")
    print(f"Updated: {summary['updated']}")
    print(f"Skipped: {summary['skipped']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
