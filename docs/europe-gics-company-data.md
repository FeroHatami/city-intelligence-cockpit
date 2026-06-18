# Europe GICS Company Data

This note documents the safe path for adding a Europe-wide company dataset by
GICS sector to City Intelligence Cockpit.

## Current Decision

Do not add an empty or guessed map layer for Europe GICS companies.

A complete, current, company-level dataset with authoritative GICS sector
classification is a market-data/licensed-data problem, not a public geodata
layer. The app now includes a visible local GeoJSON reference-anchor layer,
research-only catalog references, and an import template, but it does not expose
a fake or broken live company layer.

Local template:

`data/imports/europe-gics-company-dataset-template.json`

Local catalog reference layer:

`open-source/TerriaMap/wwwroot/data/city-intelligence/europe-gics-company-data-sources.geojson`

## Requested Sectors

- Information Technology
- Health Care
- Financials
- Consumer Discretionary
- Communication Services
- Industrials
- Consumer Staples
- Energy
- Utilities
- Materials
- Real Estate

## Source Findings

Official GICS references:

- S&P Dow Jones Indices GICS page:
  `https://www.spglobal.com/spdji/en/landing/topic/gics/`
- MSCI GICS page:
  `https://www.msci.com/indexes/index-resources/gics`

Useful open identity or matching sources:

- GLEIF LEI data:
  `https://www.gleif.org/en/lei-data/access-and-use-lei-data`
- GLEIF Golden Copy downloads:
  `https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy`
- OpenFIGI API overview:
  `https://www.openfigi.com/api/overview`

Important distinction:

- GLEIF can help with legal entity names, LEIs, and registered addresses.
- OpenFIGI can help with security identifier mapping.
- Neither is a complete, authoritative Europe-wide GICS company dataset.
- Company-level GICS classifications should come from a licensed S&P/MSCI or
  market-data source before being shown as authoritative in the cockpit.

## Import Requirements

Before adding a real Europe GICS company layer, confirm:

- source license permits local use in the cockpit
- source license permits display/export if needed
- every record has an authoritative GICS sector or documented mapping method
- latitude/longitude exists or addresses are geocoded under an approved license
- Europe coverage definition is explicit
- data date and refresh cadence are documented
- provider identifiers are preserved for auditability

Minimum map-ready fields:

- `company_name`
- `gics_sector`
- `latitude`
- `longitude`
- `source_name`
- `source_url`
- `license_status`
- `last_checked_at`

Recommended fields:

- `lei`
- `isin`
- `ticker`
- `exchange`
- `country`
- `city`
- `address`
- `website`
- `gics_industry_group`
- `gics_industry`
- `gics_sub_industry`
- `data_provider`
- `provider_record_id`
- `verification_status`
- `notes`

## Promotion Rule

Keep Europe GICS company data as research-only until an approved source file is
available locally. Then convert it to GeoJSON, validate feature count and
required fields, add it to `city-intelligence.json`, run the project health
check, and browser-verify the catalog before committing.
