# Screenshot Checklist

This folder is reserved for project screenshots. Capture screenshots from the
local app only:

```bash
cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
nvm use 22
yarn gulp dev
open http://localhost:3001
```

Do not include private leads or personal browser data. Use temporary test leads
and delete them after capture.

Recommended filenames:

1. `01-main-map-openstreetmap.png` - Munich startup map with OpenStreetMap.
2. `02-data-catalog-city-intelligence.png` - City Intelligence Cockpit catalog group.
3. `03-saved-leads-panel.png` - Saved Leads panel with an empty or test lead state.
4. `04-lead-status-board.png` - lead counters, filters, and sorting controls.
5. `05-natural-earth-basemap.png` - Natural Earth selected in Map Settings.
6. `06-outreach-generator.png` - generated local outreach message on a test lead.
7. `07-public-datasets-catalog.png` - Munich/Germany/Europe public dataset groups.
8. `08-3d-local-examples.png` - Munich/Bavaria 3D local example layers.

Before committing screenshots:

- confirm there is no map configuration error
- confirm there is no terrain 401 popup
- confirm Saved Leads contains no real private lead data
- run `bash scripts/project-health-check.sh`
