# Real Estate Intelligence

City Intelligence Cockpit includes a local-first Real Estate Intelligence MVP
for Munich planning-zone, land-use, land-value, and investment-signal research.

This module separates three things:

- raw factual data from official WMS services
- open/community demand-driver data from existing OSM-derived GeoJSON layers
- derived rule-based investor scoring and explanation

It does not provide parcel ownership data. It is not legal, tax, or investment
advice. Verify with official planning documents before making decisions.

## Catalog Group

The app adds a top-level catalog group:

`Real Estate Intelligence`

Structure:

- `Planning & Zoning`
- `Land Values`
- `Risk & Constraints`
- `Demand Drivers`

All layers are disabled by default.

## Official Raw Data Layers

### Munich Flächennutzungsplan / FNP

- Type: WMS
- Source: Landeshauptstadt Muenchen GeoPortal
- Service: `https://geoportal.muenchen.de/geoserver/plan/wms`
- Layer: `g_fnp`
- Data type: official city planning data
- Interpretation: raw factual planning visualization

### Munich Bebauungspläne

- Type: WMS
- Source: Landeshauptstadt Muenchen GeoPortal
- Service: `https://geoportal.muenchen.de/geoserver/plan/wms`
- Layer: `baug_umgriff_veredelt_in_kraft_und_aufstellung`
- Data type: official city planning data
- Interpretation: raw factual building-plan area visualization

### Bodenrichtwerte Bayern / Munich 2026

- Type: WMS
- Source: GDI Bayern / LDBV
- Service: `https://gdi.bayern.de/services/bodenrichtwerte/2026/vboris`
- Layer: `bodenrichtwerte_2026`
- Data type: official state land-value zone data
- Interpretation: raw factual land-value visualization

### Risk & Constraints

Initial official Munich WMS context layers:

- `step_2024_ueberschwemmungsgebiete_c4`: flood / water constraint context
- `schutz_unb_lsg_poly`: landscape protection areas
- `naturschutzgebiet`: nature protection areas
- `inko_02_laermminderungsplan`: noise mitigation planning context

These layers are visual context and need manual verification against official
documents before any investment decision.

## Demand Drivers

The module reuses existing City Intelligence Cockpit GeoJSON layers:

- Munich Offices
- Munich Restaurants
- Munich Clinics
- Munich Pharmacies
- Munich Coworking Spaces

These are OSM-derived, open/community data. They are useful for demand-signal
research but are not official planning data.

## Investor Intelligence Panel

Open `Investor Intelligence` from the top menu.

The panel supports:

- latitude/longitude/radius analysis
- loading coordinates from a selected map feature when available
- rule-based score from `0` to `100`
- signal labels: `Low Signal`, `Watch`, `Research`, `Strong Opportunity`
- positive drivers
- risk flags
- source/data basis
- next research steps
- optional local AI rewrite through Ollama

The default explanation is fully local and rule-based. No OpenAI API key or paid
API is required.

## Scoring Rules

The local score starts from a neutral base and adjusts using:

- nearby offices
- nearby restaurants / retail activity
- nearby clinics / pharmacies / services
- nearby coworking / business activity
- manual planning signal from official WMS layers
- manual transit context
- manual flood/noise/environment/green risk flags

The score is explicitly labeled:

`Derived investor signal based on available planning and demand-driver data.`

It is not an official city rating.

## Optional Local AI

If Ollama is running locally, the panel can try:

`http://localhost:11434/api/generate`

Default model field:

`llama3.1`

If Ollama is unavailable, the app falls back to the rule-based explanation and
continues working.
