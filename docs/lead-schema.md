# Lead Schema

City Intelligence Cockpit leads are saved business or place records derived from map features. The first in-app workflow stores leads in browser localStorage and keeps the script foundation available for export-friendly workflows.

Storage key:

`city-intelligence-cockpit.leads`

## Record Shape

Each lead record is a JSON object with these fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable lead id, preferably derived from source layer and OSM id. |
| `name` | string | Feature or business name. |
| `category` | string | Lead category such as `Pharmacy`, `Office`, `Law Firm`, `Consultant`, `Real Estate`, `Insurance`, `Government`, `Company Office`, `Office Building`, `Clinic`, `Coworking`, or `Restaurant`. |
| `address` | string | Human-readable address when available. |
| `phone` | string | Phone number when available. |
| `website` | string | Website URL when available. |
| `latitude` | number or null | Feature latitude for point features. |
| `longitude` | number or null | Feature longitude for point features. |
| `osm_id` | string or number | OpenStreetMap element id when available. |
| `osm_type` | string | OpenStreetMap element type such as `node`, `way`, or `relation`. |
| `source` | string | Feature provenance, such as `OpenStreetMap / Overpass`. |
| `source_layer` | string | City Intelligence Cockpit layer name the lead came from. |
| `data_source` | string | Local data source metadata copied from the feature, usually `OpenStreetMap / Overpass`. |
| `verification_status` | string | Local verification state such as `unverified_osm`. |
| `last_checked_at` | string | UTC timestamp from the last local data verification-field update. |
| `opportunity_score` | string or number | Empty until scored, then a 1-10 value. |
| `score_reason` | string | Rule-based or future AI-generated score explanation. |
| `suggested_offer` | string | Suggested outreach offer. |
| `suggested_first_message` | string | Locally generated first outreach message suggestion. |
| `recommended_next_action` | string | Suggested next action for the lead. |
| `risk_notes` | string | Local caution notes for qualification, privacy, compliance, or data-quality risk. |
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
  "source": "OpenStreetMap / Overpass",
  "source_layer": "Munich Pharmacies",
  "data_source": "OpenStreetMap / Overpass",
  "verification_status": "unverified_osm",
  "last_checked_at": "2026-06-17T00:00:00Z",
  "opportunity_score": "",
  "score_reason": "",
  "suggested_offer": "",
  "suggested_first_message": "",
  "recommended_next_action": "",
  "risk_notes": "",
  "notes": "",
  "status": "interesting",
  "created_at": "2026-06-17T00:00:00Z",
  "updated_at": "2026-06-17T00:00:00Z"
}
```

## In-App Workflow

Open `Saved Leads` in the City Intelligence Cockpit top menu.

The v1 panel supports:

- importing the currently selected map feature into the lead form
- manual lead creation
- localStorage persistence
- lead list
- status updates
- notes
- delete
- JSON export
- CSV export
- rule-based `Score Lead`

The v1 panel does not use authentication, a backend, or a database.

To import a selected feature:

1. Click a pharmacy, office, clinic, coworking space, or restaurant on the map.
2. Open `Saved Leads`.
3. Select `Import Selected Feature`.
4. Review or edit the populated form.
5. Select `Save Lead`.

The import maps the selected Terria feature's properties into lead fields where available. It uses feature properties such as `name`, `category`, `address`, `phone`, `website`, `osm_id`, `osm_type`, `source`, `data_source`, `verification_status`, and `last_checked_at`, plus the selected catalog item name for `source_layer`.

Duplicate protection is based on `osm_type` + `osm_id`. If a matching lead already exists, the panel loads the existing lead for review instead of creating a duplicate.

## Conversion Script

Use `scripts/create-lead-from-feature.py` to convert a GeoJSON feature into a lead record.

```bash
python3 scripts/create-lead-from-feature.py \
  --feature-file open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --feature-index 0 \
  --source-layer "Munich Pharmacies"
```

The script prints a lead JSON object to standard output. It can also write to a file with `--output`.
