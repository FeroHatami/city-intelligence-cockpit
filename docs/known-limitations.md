# Known Limitations

City Intelligence Cockpit is a local prototype. It is useful for discovery,
research, and workflow design, but it is not a production CRM or authoritative
city data platform yet.

## Data Limitations

- OpenStreetMap data is not guaranteed to be current, complete, or correct.
- Overpass results depend on the tags present in OSM at fetch time.
- Public WMS/WFS services can change URLs, layer names, schemas, or uptime.
- Official public datasets can still have update delays or field caveats.
- Munich 3D local examples are official dataset footprints and metadata, not a
  live streamed 3D city model.

## Lead Workflow Limitations

- Leads are stored in browser localStorage.
- Browser data clearing can delete saved leads.
- Leads do not sync across devices or browsers.
- There is no authentication, access control, shared workspace, or audit log.
- Backup/restore is manual JSON import/export.

## Scoring And Outreach Limitations

- Opportunity scoring is rule-based and approximate.
- Outreach templates are local helper drafts, not automated sales advice.
- No API-based enrichment or AI scoring is used.
- A human should verify business status, contact details, and fit before
  outreach.

## App Limitations

- The app is local-only and not deployed.
- The current development server is for local use.
- Heavy layers are disabled by default to protect usability.
- Large future datasets may need tiling, simplification, or backend support.

## Future Optional Work

Backend, database, authentication, deployment, and API-based enrichment are
possible later, but they are intentionally outside the current local-first scope.
