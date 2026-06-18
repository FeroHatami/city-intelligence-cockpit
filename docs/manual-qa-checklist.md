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
10. Switch to Esri World Topographic basemap.
11. Switch to Satellite View basemap.
12. Switch to CARTO Voyager basemap.
13. Switch back to OpenStreetMap.
14. Open the data catalog.
15. Confirm `City Intelligence Cockpit` business layers appear.
16. Confirm `Munich Public Datasets` appears.
17. Confirm `Germany Public Datasets` appears.
18. Confirm `Europe Public Datasets` appears.
19. Confirm `Visual Reference Layers` appears.
20. Enable and inspect each main business layer.
21. Enable and inspect office sublayers.
22. Enable Munich/Bavaria 3D local examples if needed.
23. Select a business-layer map feature.
24. Open `Saved Leads`.
25. Select `Import Selected Feature`.
26. Save the imported lead.
27. Test duplicate protection by importing the same feature again.
28. Edit the lead.
29. Change lead status.
30. Change verification status.
31. Edit notes.
32. Score the lead.
33. Generate outreach.
34. Add the lead to the outreach queue.
35. Change outreach status and channel.
36. Export outreach queue CSV.
37. Edit outreach.
38. Copy outreach if browser clipboard permissions allow it.
39. Export CSV.
40. Export JSON.
41. Create a full JSON backup.
42. Import JSON backup with a temporary test lead.
43. Import the same backup again and confirm it updates instead of duplicating.
44. Check Local Backend with the backend off and confirm the friendly message.
45. Refresh the page and confirm persistence.
46. Delete temporary test leads.
47. Confirm no API key is required.
48. Confirm no paid service is required.
49. Confirm no deployment is required.
50. Run `git status`.
51. Confirm no `node_modules`, build output, logs, cache files, `.env*`, or
    Obsidian workspace state are staged.
52. Run `bash scripts/project-health-check.sh` again.

## Pass Criteria

- The app opens locally at `http://localhost:3001`.
- No terrain/token popup appears.
- No map configuration error appears.
- Startup workbench contains only Munich Pharmacies.
- Heavy layers remain disabled until manually enabled.
- Lead workflow persists data in localStorage.
- Export/import works with duplicate protection.
- Optional backend-off mode is friendly.
- Outreach queue exports without sending messages.
- Health check passes.
- Git status is clean except allowed local-only Obsidian UI files.
