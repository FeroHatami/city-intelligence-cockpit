# Manual QA Checklist

Use this checklist before calling a local build stable.

## Setup

1. Run `git status`.
2. Confirm only expected files are changed and local Obsidian UI state is not
   staged.
3. Run `bash scripts/project-health-check.sh`.
4. Start the app:

   ```bash
   cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
   nvm use 22
   yarn gulp dev
   ```

5. Open `http://localhost:3001`.

## Map And Catalog

1. Confirm City Intelligence Cockpit branding is visible.
2. Confirm no map configuration error appears.
3. Confirm no terrain 401 popup appears.
4. Confirm OpenStreetMap loads as the startup basemap.
5. Switch to Natural Earth and back to OpenStreetMap.
6. Open the data catalog.
7. Confirm the City Intelligence Cockpit business group appears.
8. Confirm Munich/Germany/Europe public dataset groups appear.
9. Confirm Visual Reference Layers appears.
10. Enable each business layer one at a time and inspect a feature.
11. Enable office sublayers one at a time and inspect a feature.

## Saved Leads

1. Select a map feature.
2. Open `Saved Leads`.
3. Select `Import Selected Feature`.
4. Save the lead.
5. Try importing the same selected feature again and confirm duplicate
   protection.
6. Edit notes.
7. Change status.
8. Change verification status.
9. Refresh the page and confirm persistence.
10. Score the lead.
11. Generate an outreach message.
12. Edit the outreach message.
13. Export JSON.
14. Export CSV.
15. Create a JSON backup.
16. Restore from JSON using a temporary test lead.
17. Delete the temporary lead.

## Final Checks

1. Confirm no API key is required.
2. Confirm no paid service is required.
3. Confirm no deployment is required.
4. Run `git status`.
5. Run `bash scripts/project-health-check.sh`.
