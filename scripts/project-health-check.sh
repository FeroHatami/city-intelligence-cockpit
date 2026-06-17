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

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" ]]; then
  fail "expected branch main, found $BRANCH"
fi
pass "branch is main"

info "git status:"
git status --short --untracked-files=all

KEY_FILES=(
  "README.md"
  "docs/ai-opportunity-scoring.md"
  "docs/data-sources.md"
  "docs/lead-schema.md"
  "open-source/TerriaMap/wwwroot/config.json"
  "open-source/TerriaMap/wwwroot/index.ejs"
  "open-source/TerriaMap/wwwroot/init/city-intelligence.json"
  "open-source/TerriaMap/lib/CityIntelligence/leads.ts"
  "open-source/TerriaMap/lib/Views/CityIntelligenceLeadPanel.jsx"
  "scripts/add-verification-fields.py"
  "scripts/create-lead-from-feature.py"
  "scripts/project-health-check.sh"
  "scripts/score-opportunity.py"
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
}

counts = {}
missing_fields = []
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
if init.get("workbench") != ["city-intelligence-munich-pharmacies"]:
    raise SystemExit(f"workbench mismatch: {init.get('workbench')}")
for item in members:
    if set((item.get("style") or {}).keys()) != {"marker-color", "marker-size"}:
        raise SystemExit(f"{item['name']} has unexpected style {item.get('style')}")

print("PASS: GeoJSON files parse, counts match, verification fields exist")
print(f"PASS: office sublayers sum to {office_sum}")
print("PASS: catalog order, workbench, and simple styles are valid")
PY

RISKY_TRACKED="$(
  git ls-files | grep -E '(^|/)node_modules/|^open-source/TerriaMap/wwwroot/build/|^open-source/TerriaMap/build/|^open-source/TerriaMap/\\.cache/|^open-source/TerriaMap/\\.parcel-cache/|^open-source/TerriaMap/\\.turbo/|^open-source/TerriaMap/coverage/|(^|/).*\\.log$|(^|/)\\.env(\\.|$)' || true
)"
if [[ -n "$RISKY_TRACKED" ]]; then
  printf '%s\n' "$RISKY_TRACKED" >&2
  fail "risky tracked files found"
fi
pass "risky tracked files are absent"

git check-ignore -q .env.local || fail ".env.local is not ignored"
pass ".env.local is ignored"

grep -q "nvm use 22" README.md || fail "README.md must mention nvm use 22"
grep -q "nvm use 22" open-source/TerriaMap/README.md || fail "TerriaMap README must mention nvm use 22"
pass "Node guidance says use Node 22"

pass "project health check complete"
