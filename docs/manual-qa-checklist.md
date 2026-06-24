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
22. Click a Real Estate Intelligence feature where the service returns feature
    info, then open `Investor Intelligence`.
23. Confirm the Real Estate Legend and layer explanation cards are readable.
24. Use `Use Selected Feature` or `Refresh Factual Layer Info` and confirm
    factual attributes load or a clear fallback appears.
25. Run `Score Area` and confirm sub-scores are shown.
26. Generate an area report.
27. Copy/export the area report if browser permissions allow it.
28. Enable and inspect each main business layer.
29. Enable and inspect office sublayers.
30. Enable Munich/Bavaria 3D local examples if needed.
31. Select a business-layer map feature.
32. Open `Saved Leads`.
33. Select `Import Selected Feature`.
34. Save the imported lead.
35. Test duplicate protection by importing the same feature again.
36. Edit the lead.
37. Change lead status.
38. Change verification status.
39. Edit notes.
40. Score the lead.
41. Generate outreach.
42. Add the lead to the outreach queue.
43. Change outreach status and channel.
44. Export outreach queue CSV.
45. Edit outreach.
46. Copy outreach if browser clipboard permissions allow it.
47. Export CSV.
48. Export JSON.
49. Create a full JSON backup.
50. Import JSON backup with a temporary test lead.
51. Import the same backup again and confirm it updates instead of duplicating.
52. Check Local Backend with the backend off and confirm the friendly message.
53. Refresh the page and confirm persistence.
54. Delete temporary test leads.
55. Confirm no API key is required.
56. Confirm no paid service is required.
57. Confirm no deployment is required.
58. Run `git status`.
59. Confirm no `node_modules`, build output, logs, cache files, `.env*`, or
    Obsidian workspace state are staged.
60. Run `bash scripts/project-health-check.sh` again.

## Pass Criteria

- The app opens locally at `http://localhost:3001`.
- No terrain/token popup appears.
- No map configuration error appears.
- Startup workbench is empty; no dataset loads until manually enabled.
- Business and heavy layers remain disabled until manually enabled.
- Real Estate Intelligence official layers are available but disabled by default.
- Investor Intelligence scoring, sub-scores, factual fallback, and report export
  work locally without an API key.
- Lead workflow persists data in localStorage.
- Export/import works with duplicate protection.
- Optional backend-off mode is friendly.
- Outreach queue exports without sending messages.
- Health check passes.
- Git status is clean except allowed local-only Obsidian UI files.
