# City Intelligence Cockpit — Architecture

## 1. Product Definition

City Intelligence Cockpit is a 2D/3D city observation and opportunity intelligence platform.

It gives a top-down view of a city and lets the user filter, inspect, save, and analyze locations such as offices, pharmacies, restaurants, suppliers, universities, coworking spaces, clinics, warehouses, industrial areas, and shops.

The first target city is Munich, Germany.

The map is not the product by itself. The map is the interface. The real product is the intelligence layer that helps identify useful locations, business opportunities, and possible leads.

---

## 2. Core Goal

Create a cockpit where the user can answer questions like:

- What businesses are around me?
- Which offices, shops, or suppliers are nearby?
- Which locations could be useful leads?
- Which businesses may need AI automation?
- Which places should I visit, contact, or research?
- What is happening around my environment?

---

## 3. First MVP

The first MVP should be simple and functional.

### MVP Features

1. 2D/3D map of Munich
2. Location filters
3. OpenStreetMap-based city data
4. Clickable places
5. Sidebar with place details
6. Save place as lead
7. Basic opportunity score
8. Notes for each saved lead
9. Export saved leads later

---

## 4. Recommended Build Strategy

Do not build the whole thing from scratch.

Use an existing open-source geospatial platform first.

### Preferred base

City Intelligence Cockpit geospatial prototype foundation

Reason:
The current foundation is already a complete catalog-based 2D/3D geospatial application. It can be customized with Munich data layers, City Intelligence Cockpit branding, and focused city intelligence catalogs without rebuilding the map platform from scratch.

### Alternative later

If the product becomes serious and needs a fully custom user experience, rebuild later with:

- Next.js
- MapLibre GL JS
- deck.gl
- PostgreSQL
- PostGIS
- FastAPI or Node.js backend

---

## 5. High-Level System

```text
User Interface
    ↓
2D/3D Map
    ↓
City Data Layers
    ↓
Filters + Search
    ↓
Selected Place Panel
    ↓
Lead Saving System
    ↓
AI Opportunity Analysis
cd ~/Projects/city-intelligence-cockpit

mkdir -p open-source
cd open-source

git clone https://github.com/TerriaJS/TerriaMap.git

cd TerriaMap

ls
