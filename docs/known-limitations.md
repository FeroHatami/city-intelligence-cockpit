# Known Limitations

City Intelligence Cockpit is a local prototype. It is useful for discovery,
research, and workflow design, but it is not a production CRM or authoritative
city data platform yet.

## Data Limitations

- OpenStreetMap data is not guaranteed to be current, complete, or correct.
- Overpass results depend on the tags present in OSM at fetch time.
- Public WMS/WFS services can change URLs, layer names, schemas, or uptime.
- Official public datasets can still have update delays or field caveats.
- Real Estate Intelligence scores are derived market / legal-planning /
  residential-quality / land-use signals, not official ratings and not legal,
  tax, or investment advice.
- FNP is strategic citywide context only; it is not parcel-level permission.
- Investor Intelligence can read selected-feature facts only when Terria exposes
  WMS `GetFeatureInfo` or GeoJSON properties for the clicked layer. Some WMS
  layers may be visible but not return useful attributes.
- Gutachterausschuss Lagekarte, Mietspiegel/Wohnlagenkarte, Hausumringe, and
  ALKIS actual-use entries are reference items when a practical stable no-key
  map layer was not confirmed.
- Area reports are generated locally from visible inputs, clicked-layer
  attributes when available, and demand-driver counts. They are not official
  valuation reports.
- The app does not provide private parcel ownership data.
- Munich 3D local examples are official dataset footprints and metadata, not a
  live streamed 3D city model.

## Lead Workflow Limitations

- Leads are stored in browser localStorage.
- Browser data clearing can delete saved leads.
- Optional SQLite sync is local and manual.
- Leads do not sync across devices or browsers.
- There is no authentication, access control, shared workspace, or audit log.
- Backup/restore is manual JSON import/export.

## Scoring And Outreach Limitations

- Opportunity scoring is rule-based and approximate.
- Outreach templates are local helper drafts, not automated sales advice.
- Outreach queue statuses are manual review states; the app does not send
  messages.
- No API-based enrichment or AI scoring is used.
- A human should verify business status, contact details, and fit before
  outreach.

## App Limitations

- The app is local-only and not deployed.
- The current development server is for local use.
- Heavy layers are disabled by default to protect usability.
- Large future datasets may need tiling, simplification, or backend support.

## Future Optional Work

Hosted databases, authentication, deployment, cloud sync, and API-based
enrichment are possible later, but they are intentionally outside the current
local-first scope.
