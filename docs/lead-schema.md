# Lead Schema

City Intelligence Cockpit leads are saved business or place records derived from map features. This is a data/script foundation for later in-app lead saving.

## Record Shape

Each lead record is a JSON object with these fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable lead id, preferably derived from source layer and OSM id. |
| `name` | string | Feature or business name. |
| `category` | string | High-level category such as `Pharmacy`, `Office`, `Clinic`, `Coworking`, or `Restaurant`. |
| `address` | string | Human-readable address when available. |
| `phone` | string | Phone number when available. |
| `website` | string | Website URL when available. |
| `latitude` | number or null | Feature latitude for point features. |
| `longitude` | number or null | Feature longitude for point features. |
| `osm_id` | string or number | OpenStreetMap element id when available. |
| `osm_type` | string | OpenStreetMap element type such as `node`, `way`, or `relation`. |
| `source_layer` | string | City Intelligence Cockpit layer name the lead came from. |
| `opportunity_score` | string or number | Empty until scoring is added. |
| `notes` | string | Analyst notes. |
| `status` | string | One of the status values below. |
| `created_at` | string | ISO 8601 UTC timestamp. |
| `updated_at` | string | ISO 8601 UTC timestamp. |

## Status Values

- `interesting`
- `research_later`
- `contact_soon`
- `contacted`
- `meeting_booked`
- `not_relevant`

## Example

```json
{
  "id": "lead-munich-pharmacies-node-318861629",
  "name": "ABC-Apotheke",
  "category": "Pharmacy",
  "address": "Minnewitstrasse 41, 81549 Munich",
  "phone": "",
  "website": "",
  "latitude": 48.087486,
  "longitude": 11.6001175,
  "osm_id": 318861629,
  "osm_type": "node",
  "source_layer": "Munich Pharmacies",
  "opportunity_score": "",
  "notes": "",
  "status": "interesting",
  "created_at": "2026-06-17T00:00:00Z",
  "updated_at": "2026-06-17T00:00:00Z"
}
```

## Conversion Script

Use `scripts/create-lead-from-feature.py` to convert a GeoJSON feature into a lead record.

```bash
python3 scripts/create-lead-from-feature.py \
  --feature-file open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --feature-index 0 \
  --source-layer "Munich Pharmacies"
```

The script prints a lead JSON object to standard output. It can also write to a file with `--output`.
