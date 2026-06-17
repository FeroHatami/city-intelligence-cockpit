# AI Opportunity Scoring

City Intelligence Cockpit currently uses rule-based opportunity scoring in two places:

- the in-app `Score Lead` button in the `Saved Leads` panel
- the offline dry-run script `scripts/score-opportunity.py`

Neither path requires an API key, calls paid APIs, or modifies source GeoJSON files unless an explicit output path is provided by the script.

## In-App Scoring

Open `Saved Leads`, save a lead, then select `Score Lead`.

The button fills:

- `opportunity_score`
- `score_reason`
- `suggested_offer`
- `suggested_first_message`
- `recommended_next_action`
- `risk_notes`

The current in-app rules are category based and live in:

`open-source/TerriaMap/lib/CityIntelligence/leads.ts`

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
- Law firms: confidential document intake, drafting support, and client follow-up.
- Consultants: proposals, research synthesis, CRM, and client reporting.
- Real estate offices: listing inquiries, follow-up, and document preparation.
- Insurance offices: renewals, document collection, comparison, and customer follow-up.
- Government offices: public-service forms and document workflows, with procurement caution.
- Company offices: admin, sales operations, and document workflows.
- Office buildings: lower-confidence leads until a tenant or operator is qualified.
- Generic offices: admin automation, lead generation, and document processing.
- Clinics: appointment workflow, patient communication, and procurement.
- Coworking spaces: founder network, event, and community partnerships.
- Restaurants: local marketing, reservations, reviews, and inventory.

Office subtype rules run before the generic office rule. The scorer checks category,
source layer, and available office-type context so `Munich Law Firms` and
`office_type=lawyer` score as law firms instead of generic offices.

## API Key Policy

Dry-run mode is the default and requires no environment variables.

The script has a reserved `--mode openai` option for a later implementation. That mode checks for `OPENAI_API_KEY`, but it currently stops before any API call. This keeps the app safe to run without secrets or billing side effects.

Future API-backed scoring should use `prompts/opportunity-scoring-prompt.md` and write scored output to `data/processed/` rather than overwriting source GeoJSON files.
