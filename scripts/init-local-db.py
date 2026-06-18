#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from backend.db import init_db, list_leads  # noqa: E402
from backend.models import DEFAULT_DB_PATH  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Initialize the optional City Intelligence SQLite database."
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help="SQLite database path. Defaults to backend/data/city-intelligence.sqlite.",
    )
    args = parser.parse_args()

    db_path = init_db(args.db)
    lead_count = len(list_leads(db_path))
    print(f"Initialized SQLite database: {db_path}")
    print(f"Lead count: {lead_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
