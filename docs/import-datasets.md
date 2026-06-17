# Manual Dataset Import Workflow

City Intelligence Cockpit can be extended with local or public datasets without
adding a backend, API key, or paid service. This guide is for deliberate manual
imports only. Do not add uncertain public URLs directly to the app catalog; test
them first and document unstable sources as references instead of broken layers.

## Supported Dataset Types

- GeoJSON: best default for local point, line, and polygon layers.
- CSV: useful for tabular point data when latitude/longitude columns are clear.
- WMS: useful for official map services that Terria can request without an API
  key.
- WFS: useful when the endpoint can return GeoJSON or another Terria-supported
  feature format.

## Where Files Go

Use the project-level import folder for source notes and metadata:

`data/imports/`

Use the Terria web root for files that the app must load directly:

`open-source/TerriaMap/wwwroot/data/imports/`

Example layout:

```text
data/imports/
  dataset-metadata-template.json

open-source/TerriaMap/wwwroot/data/imports/
  munich-example-layer.geojson
```

Only commit imported data when it is intended to be part of the local prototype
and the source license allows it. Keep private, temporary, large, or sensitive
files out of git.

## Naming Rules

- Use lowercase kebab-case filenames, for example
  `munich-bike-parking.geojson`.
- Include the geography first: `munich-`, `germany-`, `europe-`.
- Include the source or theme when helpful: `munich-open-data-...`.
- Keep layer names human-readable in the catalog, for example
  `Munich Bike Parking`.
- Use stable IDs in `city-intelligence.json`, for example
  `munich-bike-parking`.

## Metadata Fields

Create or update a metadata record before adding the layer to the catalog. Start
from:

`data/imports/dataset-metadata-template.json`

Minimum fields to fill:

- `id`
- `title`
- `geographic_scope`
- `format`
- `source_name`
- `source_url`
- `license`
- `update_frequency`
- `downloaded_at`
- `local_file`
- `intended_catalog_group`
- `verification_status`
- `notes`

## Add A Local GeoJSON Layer

1. Save the GeoJSON under
   `open-source/TerriaMap/wwwroot/data/imports/<dataset-id>.geojson`.
2. Validate JSON:

   ```bash
   python3 -m json.tool open-source/TerriaMap/wwwroot/data/imports/<dataset-id>.geojson >/tmp/dataset.json
   ```

3. Confirm it is a `FeatureCollection` and inspect the feature count:

   ```bash
   python3 - <<'PY'
   import json
   from pathlib import Path

   path = Path("open-source/TerriaMap/wwwroot/data/imports/<dataset-id>.geojson")
   data = json.loads(path.read_text())
   assert data.get("type") == "FeatureCollection"
   print(len(data.get("features", [])))
   PY
   ```

4. Add a catalog item inside the correct group in
   `open-source/TerriaMap/wwwroot/init/city-intelligence.json`:

   ```json
   {
     "type": "geojson",
     "id": "munich-example-layer",
     "name": "Munich Example Layer",
     "description": "Source: official source name. Verify records before operational use.",
     "url": "data/imports/munich-example-layer.geojson",
     "style": {
       "marker-color": "#2f80ed",
       "marker-size": "small"
     }
   }
   ```

5. Keep heavy layers disabled by default. Do not add them to `workbench` unless
   they are intentionally startup layers.

## Add A CSV Point Layer

Use CSV only when it has clear coordinate columns.

Recommended columns:

- `name`
- `category`
- `latitude`
- `longitude`
- `source`
- `data_source`
- `verification_status`
- `last_checked_at`
- `notes`

Save the file under `open-source/TerriaMap/wwwroot/data/imports/` and configure
it only after confirming Terria reads the coordinate columns correctly. If CSV
coordinate detection is uncertain, convert it to GeoJSON first.

## Add A WMS Or WFS Layer

Use official, no-key endpoints only. Before adding the item:

1. Open the service capabilities URL in a browser.
2. Confirm it loads without an API key.
3. Confirm the layer name, CRS, attribution, and license.
4. Test the layer in the app.

Prefer a documented reference over a broken catalog layer if an endpoint is slow,
unstable, rate-limited, private, or unclear.

Example WMS pattern:

```json
{
  "type": "wms",
  "id": "germany-example-wms",
  "name": "Germany Example WMS",
  "description": "Official WMS reference. No API key required.",
  "url": "https://example.gov/service/wms",
  "layers": "example_layer"
}
```

## Test A New Layer

Run:

```bash
cd ~/Projects/city-intelligence-cockpit
bash scripts/project-health-check.sh

cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
```

Browser checks:

- App opens with no map configuration error.
- No terrain 401 popup appears.
- Catalog group opens.
- New layer appears with the intended name.
- Layer can be enabled manually.
- Features render in the correct geography.
- Feature info opens and shows useful properties.
- Existing City Intelligence Cockpit business layers still work.
- Saved Leads still opens.

## Avoid Broken Catalog Entries

- Do not add URLs that require API keys, cookies, login, or paid access.
- Do not add a service until it has been tested locally.
- Do not auto-enable heavy layers.
- Do not use preview thumbnails as tile or data URLs.
- Do not commit private or sensitive datasets.
- Keep source, license, and verification notes with every imported dataset.
- If a public URL is useful but unstable, document it in `docs/data-sources.md`
  or the metadata template instead of adding it as a live layer.
