# City Intelligence Cockpit

City Intelligence Cockpit is a Munich-focused 2D/3D city intelligence prototype. It starts with a real OpenStreetMap pharmacy layer and is structured for additional city layers such as offices, coworking spaces, clinics, and restaurants.

## Local Development

```bash
nvm use 22
yarn gulp dev
```

Open http://localhost:3001.

## Current Prototype

- City Intelligence Cockpit visible branding
- Munich default map view
- City Intelligence Cockpit catalog group
- Munich Pharmacies layer generated from OpenStreetMap / Overpass
- Placeholder GeoJSON files for future city intelligence layers

## Technical Notes

- Keep the existing application directory and build artifact names unchanged.
- Do not rename `build/TerriaMap.js`, `build/TerriaMap.css`, or the upstream package paths.
- The local development app is served from `wwwroot`.
