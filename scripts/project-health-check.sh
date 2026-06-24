#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pass() {
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

info() {
  printf 'INFO: %s\n' "$1"
}

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "not inside a git repository"
pass "git repo exists"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" ]]; then
  fail "expected branch main, found $BRANCH"
fi
pass "branch is main"

info "git status:"
git status --short --untracked-files=all

KEY_FILES=(
  "README.md"
  "data/imports/dataset-metadata-template.json"
  "data/imports/europe-gics-company-dataset-template.json"
  "docs/architecture.md"
  "docs/ai-opportunity-scoring.md"
  "docs/data-sources.md"
  "docs/europe-gics-company-data.md"
  "docs/import-datasets.md"
  "docs/known-limitations.md"
  "docs/lead-schema.md"
  "docs/lead-storage.md"
  "docs/local-backend.md"
  "docs/local-data-refresh.md"
  "docs/manual-qa-checklist.md"
  "docs/outreach-workflow.md"
  "docs/project-health-check.md"
  "docs/real-estate-intelligence.md"
  "docs/roadmap.md"
  "docs/screenshots/README.md"
  "backend/README.md"
  "backend/__init__.py"
  "backend/app.py"
  "backend/db.py"
  "backend/models.py"
  "backend/requirements.txt"
  "open-source/TerriaMap/wwwroot/config.json"
  "open-source/TerriaMap/wwwroot/data/city-intelligence/europe-gics-company-data-sources.geojson"
  "open-source/TerriaMap/wwwroot/index.ejs"
  "open-source/TerriaMap/wwwroot/init/city-intelligence.json"
  "open-source/TerriaMap/lib/CityIntelligence/investorIntelligence.ts"
  "open-source/TerriaMap/lib/CityIntelligence/leads.ts"
  "open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx"
  "open-source/TerriaMap/lib/Views/InvestorIntelligencePanel.jsx"
  "scripts/add-verification-fields.py"
  "scripts/create-lead-from-feature.py"
  "scripts/export-leads-from-sqlite.py"
  "scripts/fetch-munich-3d-datasets.py"
  "scripts/fetch-munich-clinics.py"
  "scripts/fetch-munich-coworking.py"
  "scripts/fetch-munich-offices.py"
  "scripts/fetch-munich-pharmacies.py"
  "scripts/fetch-munich-restaurants.py"
  "scripts/import-leads-to-sqlite.py"
  "scripts/init-local-db.py"
  "scripts/project-health-check.sh"
  "scripts/refresh-all-datasets.sh"
  "scripts/score-opportunity.py"
  "scripts/split-munich-offices.py"
  "scripts/com.city-intelligence.refresh.example.plist"
)

for file in "${KEY_FILES[@]}"; do
  [[ -f "$file" ]] || fail "missing key file: $file"
done
pass "key files exist"

python3 - <<'PY'
import json
from pathlib import Path

root = Path(".")
data_dir = root / "open-source" / "TerriaMap" / "wwwroot" / "data" / "city-intelligence"
app_data_dir = root / "open-source" / "TerriaMap" / "wwwroot" / "data"
expected_counts = {
    "munich-pharmacies.geojson": 414,
    "munich-offices.geojson": 6706,
    "munich-law-firms.geojson": 184,
    "munich-consultants.geojson": 82,
    "munich-real-estate-offices.geojson": 182,
    "munich-insurance-offices.geojson": 247,
    "munich-government-offices.geojson": 167,
    "munich-company-offices.geojson": 1757,
    "munich-generic-office-buildings.geojson": 2204,
    "munich-other-offices.geojson": 1883,
    "munich-clinics.geojson": 1845,
    "munich-coworking.geojson": 49,
    "munich-restaurants.geojson": 5406,
    "munich-pharmacies.starter.backup.geojson": 3,
    "munich-3d-lod2-buildings.geojson": 1,
    "munich-3d-dgm1-terrain.geojson": 1,
    "munich-3d-dom20-surface.geojson": 1,
    "munich-3d-laser-point-cloud.geojson": 1,
    "munich-3d-dom-mesh-project-areas.geojson": 5,
}

counts = {}
missing_fields = []
for path in sorted(app_data_dir.rglob("*.geojson")):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("type") != "FeatureCollection":
        raise SystemExit(f"{path} is not a FeatureCollection")
    if not isinstance(data.get("features"), list):
        raise SystemExit(f"{path} has no features array")

for filename, expected in expected_counts.items():
    path = data_dir / filename
    if not path.is_file():
        raise SystemExit(f"missing GeoJSON file: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("type") != "FeatureCollection":
        raise SystemExit(f"{filename} is not a FeatureCollection")
    features = data.get("features")
    if not isinstance(features, list):
        raise SystemExit(f"{filename} has no features array")
    counts[filename] = len(features)
    if len(features) != expected:
        raise SystemExit(f"{filename} count {len(features)} != expected {expected}")
    for index, feature in enumerate(features):
        properties = feature.get("properties")
        if not isinstance(properties, dict):
            raise SystemExit(f"{filename} feature {index} has invalid properties")
        for field in ("data_source", "verification_status", "last_checked_at"):
            if not properties.get(field):
                missing_fields.append((filename, index, field))

office_sublayers = [
    "munich-law-firms.geojson",
    "munich-consultants.geojson",
    "munich-real-estate-offices.geojson",
    "munich-insurance-offices.geojson",
    "munich-government-offices.geojson",
    "munich-company-offices.geojson",
    "munich-generic-office-buildings.geojson",
    "munich-other-offices.geojson",
]
office_sum = sum(counts[name] for name in office_sublayers)
if office_sum != counts["munich-offices.geojson"]:
    raise SystemExit(f"office sublayer sum {office_sum} != {counts['munich-offices.geojson']}")
if missing_fields:
    raise SystemExit(f"missing verification fields: {missing_fields[:5]}")

init = json.loads((root / "open-source" / "TerriaMap" / "wwwroot" / "init" / "city-intelligence.json").read_text())
top_level_groups = [item["name"] for item in init["catalog"]]
expected_top_level_groups = [
    "City Intelligence Cockpit",
    "Real Estate Intelligence",
    "Munich Public Datasets",
    "Germany Public Datasets",
    "Europe Public Datasets",
    "Visual Reference Layers",
]
if top_level_groups != expected_top_level_groups:
    raise SystemExit(f"top-level catalog group mismatch: {top_level_groups}")

expected_order = [
    "Munich Pharmacies",
    "Munich Offices — All",
    "Munich Law Firms",
    "Munich Consultants",
    "Munich Real Estate Offices",
    "Munich Insurance Offices",
    "Munich Government Offices",
    "Munich Company Offices",
    "Munich Generic Office Buildings",
    "Munich Other Offices",
    "Munich Clinics",
    "Munich Coworking Spaces",
    "Munich Restaurants",
]
members = init["catalog"][0]["members"]
actual_order = [item["name"] for item in members]
if actual_order != expected_order:
    raise SystemExit(f"catalog order mismatch: {actual_order}")
if init.get("workbench") != []:
    raise SystemExit(f"workbench mismatch: {init.get('workbench')}")
base_maps = init.get("baseMaps", {})
if base_maps.get("defaultBaseMapId") != "basemap-openstreetmap":
    raise SystemExit(f"default basemap mismatch: {base_maps}")
if base_maps.get("previewBaseMapId") != "basemap-openstreetmap":
    raise SystemExit(f"preview basemap mismatch: {base_maps}")
if (init.get("viewerMode") or "").lower() != "3dsmooth":
    raise SystemExit(f"viewerMode should be 3dSmooth for compass controls: {init.get('viewerMode')}")
expected_enabled_base_maps = [
    "basemap-openstreetmap",
    "basemap-esri-world-topo",
    "basemap-esri-world-imagery",
    "basemap-carto-voyager",
]
if base_maps.get("enabledBaseMaps") != expected_enabled_base_maps:
    raise SystemExit(f"enabled basemap order mismatch: {base_maps.get('enabledBaseMaps')}")
base_map_items = {
    (entry.get("item") or {}).get("id"): entry.get("item") or {}
    for entry in base_maps.get("items") or []
}
if "basemap-natural-earth-II" in base_map_items or "basemap-natural-earth-II" in base_maps.get("enabledBaseMaps", []):
    raise SystemExit("Natural Earth basemap should not be enabled in the custom init")
esri_topo = base_map_items.get("basemap-esri-world-topo")
if not esri_topo or esri_topo.get("type") != "esri-mapServer" or "World_Topo_Map" not in esri_topo.get("url", ""):
    raise SystemExit(f"Esri World Topographic basemap mismatch: {esri_topo}")
esri_imagery = base_map_items.get("basemap-esri-world-imagery")
if not esri_imagery or esri_imagery.get("type") != "esri-mapServer" or "World_Imagery" not in esri_imagery.get("url", ""):
    raise SystemExit(f"Satellite View basemap mismatch: {esri_imagery}")
carto_voyager = base_map_items.get("basemap-carto-voyager")
if not carto_voyager or carto_voyager.get("type") != "open-street-map" or "basemaps.cartocdn.com" not in carto_voyager.get("url", ""):
    raise SystemExit(f"CARTO Voyager basemap mismatch: {carto_voyager}")
for item in members:
    if set((item.get("style") or {}).keys()) != {"marker-color", "marker-size"}:
        raise SystemExit(f"{item['name']} has unexpected style {item.get('style')}")

def find_item(items, item_id):
    for item in items:
        if item.get("id") == item_id:
            return item
        found = find_item(item.get("members") or [], item_id)
        if found:
            return found
    return None


def walk(items):
    for item in items:
        yield item
        yield from walk(item.get("members") or [])


def require_group(item_id, min_members=1):
    item = find_item(init["catalog"], item_id)
    if not item:
        raise SystemExit(f"missing catalog group: {item_id}")
    if item.get("type") != "group":
        raise SystemExit(f"{item_id} should be a group")
    if len(item.get("members") or []) < min_members:
        raise SystemExit(f"{item_id} should contain catalog entries")
    return item


def require_item(item_id, item_type):
    item = find_item(init["catalog"], item_id)
    if not item:
        raise SystemExit(f"missing catalog item: {item_id}")
    if item.get("type") != item_type:
        raise SystemExit(f"{item_id} should be {item_type}, found {item.get('type')}")
    return item


for group_id in (
    "real-estate-planning-zoning",
    "real-estate-land-values",
    "real-estate-risk-constraints",
    "real-estate-demand-drivers",
    "munich-boundaries-administration",
    "munich-transport-mobility",
    "munich-environment-green-space",
    "munich-infrastructure-utilities",
    "germany-basemaps",
    "germany-administrative-boundaries",
    "europe-administrative-statistical-boundaries",
    "europe-environment",
    "europe-company-gics-sector-data-sources",
    "demo-basemaps-visual-references",
    "demo-3d-local-examples",
):
    require_group(group_id)

for reference_id in (
    "reference-gics-official-standard",
    "reference-gleif-lei-company-identity",
    "reference-openfigi-identifier-mapping",
    "reference-europe-gics-import-template",
):
    reference = require_item(reference_id, "stub")
    if reference.get("isExperiencingIssues") is not False:
        raise SystemExit(f"{reference_id} should be a non-broken reference stub")

gics_reference_layer = require_item("europe-gics-company-data-source-references", "geojson")
if "europe-gics-company-data-sources.geojson" not in gics_reference_layer.get("url", ""):
    raise SystemExit("Europe GICS reference layer URL mismatch")

for item in walk(init["catalog"]):
    if item.get("type") == "group" and item.get("members") == []:
        raise SystemExit(f"empty catalog group found: {item.get('id') or item.get('name')}")

for item_id, expected_url, expected_layers in (
    ("real-estate-munich-fnp", "geoportal.muenchen.de/geoserver/plan/wms", "g_fnp"),
    (
        "real-estate-munich-bebauungsplaene",
        "geoportal.muenchen.de/geoserver/plan/wms",
        "baug_umgriff_veredelt_in_kraft_und_aufstellung",
    ),
    (
        "real-estate-bavaria-bodenrichtwerte-2026",
        "gdi.bayern.de/services/bodenrichtwerte/2026/vboris",
        "bodenrichtwerte_2026",
    ),
    (
        "real-estate-munich-flood-areas",
        "geoportal.muenchen.de/geoserver/plan/wms",
        "step_2024_ueberschwemmungsgebiete_c4",
    ),
    (
        "real-estate-munich-landscape-protection",
        "geoportal.muenchen.de/geoserver/plan/wms",
        "schutz_unb_lsg_poly",
    ),
    (
        "real-estate-munich-nature-protection",
        "geoportal.muenchen.de/geoserver/plan/wms",
        "naturschutzgebiet",
    ),
    (
        "real-estate-munich-noise-mitigation",
        "geoportal.muenchen.de/geoserver/plan/wms",
        "inko_02_laermminderungsplan",
    ),
):
    item = require_item(item_id, "wms")
    if expected_url not in item.get("url", "") or item.get("layers") != expected_layers:
        raise SystemExit(f"{item_id} WMS configuration mismatch")
    if "official" not in (item.get("description") or "").lower():
        raise SystemExit(f"{item_id} must describe official source data")

for item_id, expected_url in (
    ("real-estate-demand-offices", "munich-offices.geojson"),
    ("real-estate-demand-restaurants", "munich-restaurants.geojson"),
    ("real-estate-demand-clinics", "munich-clinics.geojson"),
    ("real-estate-demand-pharmacies", "munich-pharmacies.geojson"),
    ("real-estate-demand-coworking", "munich-coworking.geojson"),
):
    item = require_item(item_id, "geojson")
    if not item.get("url", "").endswith(expected_url):
        raise SystemExit(f"{item_id} URL mismatch")
    if "OSM-derived" not in (item.get("description") or ""):
        raise SystemExit(f"{item_id} must describe open/community OSM source data")

districts = require_item("munich-public-city-districts", "geojson")
if "gsm_wfs:vablock_stadtbezirk" not in districts.get("url", ""):
    raise SystemExit("Munich city districts URL does not point to the official WFS layer")
traffic = require_item("munich-public-traffic-signals", "geojson")
if "mor_wfs%3Alsa_opendata" not in traffic.get("url", ""):
    raise SystemExit("Munich traffic signals URL does not point to the official WFS layer")
for item_id, expected in (
    ("munich-public-construction-sites", "mor_wfs:baustellen_opendata"),
    ("munich-public-charging-locations", "mor_wfs:ruhver_els_standort_point"),
    ("munich-public-mobility-points", "mor_wfs:ruhver_mp_standort_point"),
    ("munich-public-e-scooter-geofences", "mor_wfs:ruhver_mim_geofences_poly"),
):
    item = require_item(item_id, "geojson")
    if expected not in item.get("url", ""):
        raise SystemExit(f"{item_id} URL mismatch")
for item_id, expected in (
    ("munich-public-disabled-parking", "mor_wfs%3Abehindertenparkplaetze"),
    ("munich-public-carsharing-parking", "mor_wfs%3Aruhver_carsharing"),
    ("munich-public-signed-cycling-network", "mor_wfs%3Arad_rsp_route_line"),
    ("munich-public-old-town-cycling-ring", "mor_wfs%3Arad_altstadt_radlring_line"),
    ("munich-public-bike-sharing-parking", "mor_wfs%3Aruhver_mim_abstellfl_bs"),
    ("munich-public-e-scooter-parking", "mor_wfs%3Aruhver_mim_abstellfl_ts"),
    ("munich-public-e-moped-parking", "mor_wfs%3Aruhver_mim_abstellfl_ms"),
    ("munich-public-cargo-bike-parking", "mor_wfs%3Aruhver_mim_abstellfl_ls"),
    ("munich-public-digital-3l-zones", "mor_wfs%3Adigitale_3l_zonen"),
):
    item = require_item(item_id, "geojson")
    if expected not in item.get("url", ""):
        raise SystemExit(f"{item_id} URL mismatch")
drinking = require_item("munich-public-drinking-fountains", "geojson")
if "baug_wfs%3Atrinkwasserbrunnen" not in drinking.get("url", ""):
    raise SystemExit("Munich drinking fountains URL does not point to the official WFS layer")
charging_pillars = require_item("munich-public-charging-pillars", "geojson")
if "mor_wfs:ruhver_els_saeule_point" not in charging_pillars.get("url", ""):
    raise SystemExit("Munich charging pillars URL does not point to the official WFS layer")

for item_id, item_type, expected_url, expected_layers in (
    ("germany-basemapde-web-raster-color", "wms", "wms_basemapde", "de_basemapde_web_raster_farbe"),
    ("germany-basemapde-web-raster-gray", "wms", "wms_basemapde", "de_basemapde_web_raster_grau"),
    ("germany-bkg-vg250-states", "wms", "wms_vg250", "vg250_lan"),
    ("germany-bkg-vg250-districts", "wms", "wms_vg250", "vg250_krs"),
    ("germany-bkg-vg250-municipalities", "wms", "wms_vg250", "vg250_gem"),
    ("germany-bkg-vg250-boundary-lines", "wms", "wms_vg250", "vg250_li"),
):
    item = require_item(item_id, item_type)
    if expected_url not in item.get("url", "") or item.get("layers") != expected_layers:
        raise SystemExit(f"{item_id} WMS configuration mismatch")

countries = require_item("europe-gisco-countries-2024", "geojson")
if "CNTR_RG_20M_2024_4326.geojson" not in countries.get("url", ""):
    raise SystemExit("Europe countries GISCO URL mismatch")

for level in range(4):
    nuts = require_item(f"europe-gisco-nuts-2024-level-{level}", "geojson")
    expected_part = f"NUTS_RG_20M_2024_4326_LEVL_{level}.geojson"
    if expected_part not in nuts.get("url", ""):
        raise SystemExit(f"NUTS level {level} URL mismatch")

for item_id, layers in (
    ("europe-eea-corine-land-cover-2018-raster", "12"),
    ("europe-eea-corine-land-cover-2018-vector", "13"),
):
    item = require_item(item_id, "wms")
    if "CLC2018_WM" not in item.get("url", "") or item.get("layers") != layers:
        raise SystemExit(f"{item_id} WMS configuration mismatch")

satellite = require_item("demo-sentinel-2-satellite", "url-template-imagery")
if "s2cloudless-2025_3857" not in satellite.get("url", ""):
    raise SystemExit("Satellite optional visual layer URL mismatch")
basemapde_demo = require_item("demo-germany-basemapde-color", "wms")
if basemapde_demo.get("layers") != "de_basemapde_web_raster_farbe":
    raise SystemExit("Demo basemap.de WMS layer mismatch")

for item_id, expected_url in (
    ("munich-3d-lod2-buildings", "munich-3d-lod2-buildings.geojson"),
    ("munich-3d-dgm1-terrain", "munich-3d-dgm1-terrain.geojson"),
    ("munich-3d-dom20-surface", "munich-3d-dom20-surface.geojson"),
    ("munich-3d-laser-point-cloud", "munich-3d-laser-point-cloud.geojson"),
    ("munich-3d-dom-mesh-project-areas", "munich-3d-dom-mesh-project-areas.geojson"),
):
    item = require_item(item_id, "geojson")
    if not item.get("url", "").endswith(expected_url):
        raise SystemExit(f"{item_id} URL mismatch")
    if "Bavaria OpenData" not in item.get("description", ""):
        raise SystemExit(f"{item_id} should describe the official Bavaria OpenData source")

workbench_ids = set(init.get("workbench") or [])
for disabled_by_default in (
    "city-intelligence-munich-pharmacies",
    "real-estate-munich-fnp",
    "real-estate-munich-bebauungsplaene",
    "real-estate-bavaria-bodenrichtwerte-2026",
    "real-estate-munich-flood-areas",
    "real-estate-munich-landscape-protection",
    "real-estate-munich-nature-protection",
    "real-estate-munich-noise-mitigation",
    "real-estate-demand-offices",
    "real-estate-demand-restaurants",
    "real-estate-demand-clinics",
    "real-estate-demand-pharmacies",
    "real-estate-demand-coworking",
    "munich-public-city-districts",
    "munich-public-traffic-signals",
    "munich-public-construction-sites",
    "munich-public-disabled-parking",
    "munich-public-charging-locations",
    "munich-public-mobility-points",
    "munich-public-carsharing-parking",
    "munich-public-signed-cycling-network",
    "munich-public-bike-sharing-parking",
    "munich-public-e-scooter-parking",
    "munich-public-drinking-fountains",
    "germany-basemapde-web-raster-color",
    "germany-bkg-vg250-states",
    "europe-gisco-countries-2024",
    "europe-gisco-nuts-2024-level-0",
    "europe-gisco-nuts-2024-level-1",
    "europe-gisco-nuts-2024-level-2",
    "europe-gisco-nuts-2024-level-3",
    "europe-eea-corine-land-cover-2018-raster",
    "demo-sentinel-2-satellite",
    "munich-3d-lod2-buildings",
    "munich-3d-dgm1-terrain",
    "munich-3d-dom20-surface",
    "munich-3d-laser-point-cloud",
    "munich-3d-dom-mesh-project-areas",
):
    if disabled_by_default in workbench_ids:
        raise SystemExit(f"{disabled_by_default} must be disabled by default")

for item in walk(init["catalog"]):
    name = item.get("name", "")
    url = item.get("url", "")
    if name.startswith("Reference /") and (item.get("members") or []) != []:
        raise SystemExit(f"reference item should not contain loading children: {name}")
    if any(blocked in name for blocked in ("National Datasets", "NSW Live Transport", "Geelong", "Demo / Visual Examples", "Natural Earth")):
        raise SystemExit(f"old upstream demo catalog item leaked into custom init: {name}")
    if any(blocked in url for blocked in ("terrain.czml", "api.transport.nsw.gov.au", "lowpoly_bus", "test/3d/geelong", "natural-earth-tiles")):
        raise SystemExit(f"blocked demo URL leaked into live catalog: {url}")

print("INFO: feature counts:")
for filename in sorted(counts):
    print(f"INFO:   {filename}: {counts[filename]}")
print("PASS: all app GeoJSON files parse")
print("PASS: expected feature counts match and verification fields exist")
print(f"PASS: office sublayers sum to {office_sum}")
print("PASS: catalog groups, workbench, basemap, public layers, and optional demos are valid")
PY

CONFIG_FILE="open-source/TerriaMap/wwwroot/config.json"
grep -q '"initializationUrls": \["city-intelligence"\]' "$CONFIG_FILE" || fail "config must load only city-intelligence init"
if grep -q '"initializationUrls": .*simple' "$CONFIG_FILE"; then
  fail "config must not load the demo simple init"
fi
grep -q '"mobileDefaultViewerMode": "3DSmooth"' "$CONFIG_FILE" || fail "mobile viewer mode should use 3DSmooth"
grep -q '"useCesiumIonTerrain": false' "$CONFIG_FILE" || fail "Cesium ion terrain must be disabled"
grep -q '"useCesiumIonBingImagery": false' "$CONFIG_FILE" || fail "Cesium ion Bing imagery must be disabled"
grep -q '"searchProviders": \[\]' "$CONFIG_FILE" || fail "Cesium ion search provider must remain disabled unless a key is intentionally added"
if grep -Eq '"cesiumIonAccessToken"[[:space:]]*:' "$CONFIG_FILE"; then
  fail "config must not contain a Cesium ion access token"
fi
pass "config avoids demo init and required private terrain tokens"

RISKY_TRACKED="$(
  git ls-files | grep -E '(^|/)node_modules/|^open-source/TerriaMap/wwwroot/build/|^open-source/TerriaMap/build/|^open-source/TerriaMap/\\.cache/|^open-source/TerriaMap/\\.parcel-cache/|^open-source/TerriaMap/\\.turbo/|^open-source/TerriaMap/coverage/|(^|/)logs/|(^|/)backend/data/|(^|/)__pycache__/|(^|/).*\\.pyc$|(^|/).*\\.sqlite$|(^|/).*\\.db$|(^|/).*\\.log$|(^|/)\\.env(\\.|$)' || true
)"
if [[ -n "$RISKY_TRACKED" ]]; then
  printf '%s\n' "$RISKY_TRACKED" >&2
  fail "risky tracked files found"
fi
pass "risky tracked files are absent"

LOCAL_ONLY_TRACKED="$(
  git ls-files '*.sqlite' '*.db' 'backend/data/*' 'logs/*' '**/__pycache__/*' '*.pyc' || true
)"
if [[ -n "$LOCAL_ONLY_TRACKED" ]]; then
  printf '%s\n' "$LOCAL_ONLY_TRACKED" >&2
  fail "local-only generated files are tracked"
fi
pass "local DB, log, and Python cache files are not tracked"

SECRET_LIKE="$(
  git grep -nE '(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY[[:space:]]*=|CESIUM_ION_ACCESS_TOKEN[[:space:]]*=|cesiumIonAccessToken[[:space:]]*:[[:space:]]*"[^"]+")' -- . ':!scripts/project-health-check.sh' || true
)"
if [[ -n "$SECRET_LIKE" ]]; then
  printf '%s\n' "$SECRET_LIKE" >&2
  fail "possible tracked API key or token found"
fi
pass "no tracked API keys or token-looking secrets found"

git check-ignore -q .env.local || fail ".env.local is not ignored"
pass ".env.local is ignored"
git check-ignore -q backend/data/city-intelligence.sqlite || fail "local SQLite DB is not ignored"
git check-ignore -q logs/dataset-refresh.log || fail "refresh logs are not ignored"
git check-ignore -q backend/__pycache__/db.cpython-314.pyc || fail "backend Python cache is not ignored"
git check-ignore -q scripts/__pycache__/score-opportunity.cpython-314.pyc || fail "script Python cache is not ignored"
pass "local DB, logs, and Python caches are ignored"

grep -q "nvm use 22" README.md || fail "README.md must mention nvm use 22"
grep -q "yarn gulp dev" README.md || fail "README.md must mention yarn gulp dev"
grep -q "http://localhost:3001" README.md || fail "README.md must mention localhost:3001"
grep -q "nvm use 22" open-source/TerriaMap/README.md || fail "TerriaMap README must mention nvm use 22"
grep -q "yarn gulp dev" docs/manual-qa-checklist.md || fail "manual QA checklist must mention yarn gulp dev"
grep -q "python3 backend/app.py --host 127.0.0.1 --port 8000" docs/local-backend.md || fail "local backend docs must include run command"
grep -q "bash scripts/refresh-all-datasets.sh --dry-run" docs/local-data-refresh.md || fail "local refresh docs must include dry-run command"
grep -q "Export Outreach Queue CSV" docs/outreach-workflow.md || fail "outreach docs must mention queue CSV export"
pass "project run commands and local workflows are documented"

pass "project health check complete"
