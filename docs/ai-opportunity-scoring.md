# AI Opportunity Scoring

City Intelligence Cockpit currently uses an offline, rule-based dry-run scorer. It does not require an API key, does not call paid APIs, and does not modify the source GeoJSON files unless an explicit output path is provided.

## Script

```bash
python3 scripts/score-opportunity.py \
  --input open-source/TerriaMap/wwwroot/data/city-intelligence/munich-pharmacies.geojson \
  --source-layer "Munich Pharmacies" \
  --limit 5
```

Write JSON output:

```bash
python3 scripts/score-opportunity.py \
  --input open-source/TerriaMap/wwwroot/data/city-intelligence/munich-restaurants.geojson \
  --source-layer "Munich Restaurants" \
  --limit 10 \
  --output data/processed/opportunity-scores.restaurants.json
```

Write CSV output:

```bash
python3 scripts/score-opportunity.py \
  --input open-source/TerriaMap/wwwroot/data/city-intelligence/munich-offices.geojson \
  --source-layer "Munich Offices" \
  --format csv \
  --limit 10 \
  --output data/processed/opportunity-scores.offices.csv
```

## Output Fields

Each scored record includes:

- `opportunity_score`
- `score_reason`
- `suggested_offer`
- `suggested_first_message`
- `recommended_next_action`
- `risk_notes`

The output also includes feature context:

- `feature_index`
- `feature_name`
- `category`
- `osm_id`
- `osm_type`
- `source_layer`

## Current Rule-Based Logic

- Pharmacies: procurement, inventory, and supplier communication.
- Offices: admin automation, lead generation, and document processing.
- Clinics: appointment workflow, patient communication, and procurement.
- Coworking spaces: founder network, event, and community partnerships.
- Restaurants: local marketing, reservations, reviews, and inventory.

## API Key Policy

Dry-run mode is the default and requires no environment variables.

The script has a reserved `--mode openai` option for a later implementation. That mode checks for `OPENAI_API_KEY`, but it currently stops before any API call. This keeps the app safe to run without secrets or billing side effects.

Future API-backed scoring should use `prompts/opportunity-scoring-prompt.md` and write scored output to `data/processed/` rather than overwriting source GeoJSON files.
