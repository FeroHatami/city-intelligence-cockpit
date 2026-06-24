# Real Estate Intelligence

City Intelligence Cockpit includes a local-first Real Estate Intelligence module
for Munich market, legal-planning, residential-quality, restriction, building,
land-use, and demand-driver research.

The module separates three things:

- official raw data from Munich/Bavaria WMS or official reference pages
- open/community demand-driver data from existing OSM-derived GeoJSON layers
- derived rule-based investor scoring and explanation

It does not provide parcel ownership data. It is not legal, tax, or investment
advice. Verify with official planning documents before making decisions.

## Catalog Structure

The top-level group is `Real Estate Intelligence`.

Structure:

- `Market & Land Value`
- `Legal Planning`
- `Residential Quality`
- `Strategic Land Use`
- `Restrictions & Risk`
- `Buildings & Parcels`
- `Demand Drivers`

All layers are disabled by default. The previous FNP-first shape has been
demoted: FNP now lives under `Strategic Land Use` and is only optional long-term
context.

## Market & Land Value

### Bodenrichtwerte Bayern / Munich 2026

- Type: WMS
- Source: GDI Bayern / LDBV
- Service: `https://gdi.bayern.de/services/bodenrichtwerte/2026/vboris`
- Layer: `bodenrichtwerte_2026`
- Data type: official state land-value zone data
- Interpretation: raw factual land-value visualization

Bodenrichtwerte are official land-value zones, but exact property value requires
further valuation.

### Gutachterausschuss München Lagekarte

- Type: reference-only GeoJSON anchor
- Source: Gutachterausschuss Muenchen / Landeshauptstadt Muenchen
- Reference: `https://stadt.muenchen.de/infos/gutachterausschuss.html`
- Related reference: `https://stadt.muenchen.de/infos/bodenrichtwerte.html`

This is documented as a visible reference anchor because a stable no-key
WMS/GeoJSON Lagekarte endpoint was not confirmed. The marker is not a property,
transaction, parcel, or Lagekarte feature location.

## Legal Planning

### Munich Bebauungspläne in Kraft

- Type: WMS
- Source: Landeshauptstadt Muenchen GeoPortal
- Service: `https://geoportal.muenchen.de/geoserver/plan/wms`
- Layer: `vagrund_baug_umgriff_veredelt_in_kraft`
- Data type: official city legal-planning data

### Munich Bebauungspläne in Aufstellung

- Type: WMS
- Source: Landeshauptstadt Muenchen GeoPortal
- Service: `https://geoportal.muenchen.de/geoserver/plan/wms`
- Layer: `vagrund_baug_umgriff_veredelt_in_aufstellung`
- Data type: official city legal-planning data

Bebauungsplaene are more legally specific and should be checked before
investment or development decisions.

## Residential Quality

### Mietspiegel 2025 Wohnlagenkarte

- Type: reference-only GeoJSON anchor
- Source: Landeshauptstadt Muenchen Mietspiegel
- Reference: `https://stadt.muenchen.de/infos/mietspiegel-2025.html`
- Related reference: `https://stadt.muenchen.de/infos/mietspiegel.html`

This helps understand residential rent/location quality, not purchase price. It
is documented as a visible reference anchor because a stable no-key WMS/GeoJSON
Wohnlagenkarte endpoint was not confirmed. The marker is not a rent zone,
property, parcel, or Wohnlagenkarte feature location.

## Strategic Land Use

### Munich Flächennutzungsplan / FNP

- Type: WMS
- Source: Landeshauptstadt Muenchen GeoPortal
- Service: `https://geoportal.muenchen.de/geoserver/plan/wms`
- Layer: `g_fnp`
- Data type: official city strategic land-use planning data

The Flächennutzungsplan is a strategic citywide land-use plan. It is useful for
long-term context, but not exact parcel-level permission.

## Restrictions & Risk

Official Munich WMS context layers:

- `satz_erhalt_poly`: Gebiete mit Erhaltungssatzung / preservation areas
- `step_2024_ueberschwemmungsgebiete_c4`: flood / water constraint context
- `schutz_unb_lsg_poly`: landscape protection areas
- `naturschutzgebiet`: nature protection areas
- `inko_02_laermminderungsplan`: noise mitigation planning context

Erhaltungssatzung / preservation areas are treated as a strong restriction flag
in the local scoring panel. All restrictions still need manual verification
against official statute and planning documents.

## Buildings & Parcels

### Bavaria LoD2 3D Buildings - Munich Footprint

- Type: local GeoJSON footprint
- Source: Bayerische Vermessungsverwaltung / LDBV OpenData
- Local file: `open-source/TerriaMap/wwwroot/data/city-intelligence/munich-3d-lod2-buildings.geojson`
- Reference: `https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=lod2`

This is a practical official download-footprint layer, not an in-browser 3D
Tiles stream.

### Bavaria Hausumringe

- Type: reference-only GeoJSON anchor
- Source: Bayerische Vermessungsverwaltung / LDBV OpenData
- Reference: `https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=hausumringe`

The statewide product is download-oriented and was not confirmed as a practical
stable no-key WMS/GeoJSON stream for this cockpit. The marker is not a building
footprint or parcel.

### ALKIS Tatsächliche Nutzung

- Type: reference-only GeoJSON anchor
- Source: Bayerische Vermessungsverwaltung / GeodatenOnline
- Reference: `https://geodatenonline.bayern.de/geodatenonline/`

This is not embedded as a parcel or ownership layer. The marker is not a parcel,
ownership record, or cadastral actual-use feature. Do not treat the cockpit as
parcel ownership or cadastral proof.

## Demand Drivers

The module reuses existing City Intelligence Cockpit layers:

- Munich Offices
- Munich Restaurants
- Munich Clinics
- Munich Pharmacies
- Munich Coworking Spaces
- Munich rail transit context from the official Munich WMS

Business points are OSM-derived open/community data. Transit context is official
Munich WMS context. Demand drivers are useful for opportunity research but are
not official planning permission or valuation data.

## Investor Intelligence Panel

Open `Investor Intelligence` from the top menu.

The panel supports:

- latitude/longitude/radius analysis
- loading coordinates from a selected map feature when available
- loading factual attributes from Terria selected-feature / GetFeatureInfo
  results when a clicked WMS or GeoJSON layer exposes them
- manual market/value observation
- manual legal-planning observation
- manual residential-quality observation
- manual strategic FNP observation
- preservation, flood, noise/environmental, and transit flags
- rule-based score from `0` to `100`
- sub-scores for Market Context, Legal Planning, Demand Drivers, Residential
  Quality, Risk / Restrictions, and Strategic Context
- signal labels: `Low Signal`, `Watch`, `Research`, `Strong Opportunity`
- positive drivers, risk flags, source/data basis, and next research steps
- a generated local area report that can be copied or exported as Markdown
- optional local AI rewrite through Ollama

The default explanation is fully local and rule-based. No OpenAI API key or paid
API is required.

### Real Estate Legend

The panel includes a readable legend that translates German planning and risk
terms into English and a practical investor interpretation. It includes common
terms such as:

- `Wohnbaufläche / Wohngebiet`: residential / housing context
- `Mischgebiet`: mixed-use context
- `Kerngebiet`: central / core urban context
- `Gewerbegebiet`: commercial / employment context
- `Grünfläche`, `Wald`, `Wasserfläche`: open-space or non-development context
- `Erhaltungssatzung`: preservation/restriction flag
- `Landschaftsschutzgebiet` and `Überschwemmungsgebiet`: environmental or flood
  risk context

The legend is explanatory only. It does not replace reading the official plan,
statute, or valuation material.

### Layer Explanation Cards

The panel also shows brief cards for the major source categories:

- Bodenrichtwerte: official land-value zone context, not exact property value
- Bebauungspläne: legally more specific planning checks
- Bebauungspläne in Aufstellung: future planning-change monitoring
- FNP: broad strategic citywide land-use context only
- Mietspiegel / Wohnlagenkarte: residential rent/location-quality context
- Erhaltungssatzung: conversion/demolition/modernization restriction context
- Buildings & Parcels references: building/parcel source paths where available,
  without ownership data

### Clicked / Area Intelligence

The panel reuses Terria's own selected-feature flow. When a map feature is
selected and Terria exposes WMS `GetFeatureInfo` or GeoJSON attributes, `Use
Selected Feature` / `Refresh Factual Layer Info` can load:

- selected feature coordinates, when available
- source layer name, when available
- feature name or summary
- factual attributes exposed by the layer

If a layer does not expose feature attributes, the panel shows a clear fallback
message and continues with manual observations plus local demand-driver counts.
There is no separate fragile map-click listener.

### Area Report

After `Score Area`, `Generate Area Report` creates a local Markdown report with:

- location and coordinate source
- total score and sub-scores
- factual clicked-layer context when available
- demand-driver counts within the selected radius
- positive drivers and risk flags
- suggested investment thesis
- next research steps and disclaimer

`Copy Report` uses the browser clipboard when available. If the browser blocks
clipboard access, the report text remains visible and manually copyable. `Export
Markdown` downloads the report as a local `.md` file.

## Scoring Priority

The local score starts from a neutral base and adjusts using:

- market/value context from Bodenrichtwerte and Gutachterausschuss references
- legal-planning context from Bebauungsplaene in force or in preparation
- residential rent/location-quality context from Mietspiegel/Wohnlage references
- strong restriction flags, especially Erhaltungssatzung / preservation areas
- flood, water, noise, environmental, green, and protected-area flags
- demand-driver density from local OSM-derived GeoJSON layers
- transit context when manually observed
- selected-feature factual attributes when Terria exposes them from WMS
  `GetFeatureInfo` or GeoJSON properties
- FNP only as broad strategic context

FNP has deliberately low scoring weight. Land-value and Bebauungsplan context
matter more than FNP because they are more practical for investment overview and
legal due diligence.

The score is explicitly labeled as a derived investor signal. It is not an
official city rating.

## Optional Local AI

If Ollama is running locally, the panel can try:

`http://localhost:11434/api/generate`

Default model field:

`llama3.1`

If Ollama is unavailable, the app falls back to the rule-based explanation and
continues working.
