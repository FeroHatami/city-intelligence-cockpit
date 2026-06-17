# Manual QA Checklist

Use this checklist before calling a local build stable. Use temporary leads only
and delete them after testing.

## Required Steps

1. Run `git status`.
2. Confirm git status is clean except allowed local Obsidian UI state.
3. Run `bash scripts/project-health-check.sh`.
4. Start the app:

   ```bash
   cd ~/Projects/city-intelligence-cockpit/open-source/TerriaMap
   nvm use 22
   yarn gulp dev
   ```

5. Open `http://localhost:3001`.
6. Confirm no map configuration error appears.
7. Confirm no terrain 401 popup appears.
8. Confirm City Intelligence Cockpit branding is visible.
9. Switch to OpenStreetMap basemap.
10. Switch to Natural Earth basemap.
11. Switch back to OpenStreetMap.
12. Open the data catalog.
13. Confirm `City Intelligence Cockpit` business layers appear.
14. Confirm `Munich Public Datasets` appears.
15. Confirm `Germany Public Datasets` appears.
16. Confirm `Europe Public Datasets` appears.
17. Confirm `Visual Reference Layers` appears.
18. Enable and inspect each main business layer.
19. Enable and inspect office sublayers.
20. Enable Munich/Bavaria 3D local examples if needed.
21. Select a business-layer map feature.
22. Open `Saved Leads`.
23. Select `Import Selected Feature`.
24. Save the imported lead.
25. Test duplicate protection by importing the same feature again.
26. Edit the lead.
27. Change lead status.
28. Change verification status.
29. Edit notes.
30. Score the lead.
31. Generate outreach.
32. Edit outreach.
33. Copy outreach if browser clipboard permissions allow it.
34. Export CSV.
35. Export JSON.
36. Create a full JSON backup.
37. Import JSON backup with a temporary test lead.
38. Import the same backup again and confirm it updates instead of duplicating.
39. Refresh the page and confirm persistence.
40. Delete temporary test leads.
41. Confirm no API key is required.
42. Confirm no paid service is required.
43. Confirm no deployment is required.
44. Run `git status`.
45. Confirm no `node_modules`, build output, logs, cache files, `.env*`, or
    Obsidian workspace state are staged.
46. Run `bash scripts/project-health-check.sh` again.

## Pass Criteria

- The app opens locally at `http://localhost:3001`.
- No terrain/token popup appears.
- No map configuration error appears.
- Startup workbench contains only Munich Pharmacies.
- Heavy layers remain disabled until manually enabled.
- Lead workflow persists data in localStorage.
- Export/import works with duplicate protection.
- Health check passes.
- Git status is clean except allowed local-only Obsidian UI files.
