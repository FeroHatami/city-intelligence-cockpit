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
20. Confirm `Real Estate Intelligence` appears.
21. Enable at least one official Real Estate Intelligence WMS layer.
22. Open `Investor Intelligence` and run `Score Area`.
23. Enable and inspect each main business layer.
24. Enable and inspect office sublayers.
25. Enable Munich/Bavaria 3D local examples if needed.
26. Select a business-layer map feature.
27. Open `Saved Leads`.
28. Select `Import Selected Feature`.
29. Save the imported lead.
30. Test duplicate protection by importing the same feature again.
31. Edit the lead.
32. Change lead status.
33. Change verification status.
34. Edit notes.
35. Score the lead.
36. Generate outreach.
37. Add the lead to the outreach queue.
38. Change outreach status and channel.
39. Export outreach queue CSV.
40. Edit outreach.
41. Copy outreach if browser clipboard permissions allow it.
42. Export CSV.
43. Export JSON.
44. Create a full JSON backup.
45. Import JSON backup with a temporary test lead.
46. Import the same backup again and confirm it updates instead of duplicating.
47. Check Local Backend with the backend off and confirm the friendly message.
48. Refresh the page and confirm persistence.
49. Delete temporary test leads.
50. Confirm no API key is required.
51. Confirm no paid service is required.
52. Confirm no deployment is required.
53. Run `git status`.
54. Confirm no `node_modules`, build output, logs, cache files, `.env*`, or
    Obsidian workspace state are staged.
55. Run `bash scripts/project-health-check.sh` again.

## Pass Criteria

- The app opens locally at `http://localhost:3001`.
- No terrain/token popup appears.
- No map configuration error appears.
- Startup workbench is empty; no dataset loads until manually enabled.
- Business and heavy layers remain disabled until manually enabled.
- Real Estate Intelligence official layers are available but disabled by default.
- Investor Intelligence scoring works locally without an API key.
- Lead workflow persists data in localStorage.
- Export/import works with duplicate protection.
- Optional backend-off mode is friendly.
- Outreach queue exports without sending messages.
- Health check passes.
- Git status is clean except allowed local-only Obsidian UI files.
