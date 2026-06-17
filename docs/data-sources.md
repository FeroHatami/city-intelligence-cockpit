# Data Sources

City Intelligence Cockpit currently uses local GeoJSON files generated from OpenStreetMap via Overpass API. The source files live in:

`open-source/TerriaMap/wwwroot/data/city-intelligence/`

## Verification Fields

Each GeoJSON feature should include:

- `data_source`: existing `source` when available, otherwise `OpenStreetMap / Overpass`
- `verification_status`: `unverified_osm`
- `last_checked_at`: UTC timestamp from the last local verification-field script run

These fields are local metadata. They do not verify that a business is currently active; they mark the record as OSM-derived and not yet independently verified.

## Update Command

Run:

```bash
python3 scripts/add-verification-fields.py
```

The script updates every `*.geojson` file in `open-source/TerriaMap/wwwroot/data/city-intelligence/` in place, preserving existing properties and only adding missing verification fields.

## Lead Workflow

When a map feature is imported into `Saved Leads`, the lead form preserves:

- `data_source`
- `verification_status`
- `last_checked_at`

JSON and CSV exports include those fields so exported lead files carry the same provenance and verification state.
