# Land Navigation & Boundary Intelligence MVP

This repository contains a working web MVP for the project idea described in the study document: converting a land survey number into a usable map view with boundary, road access, and last-mile field guidance.

## What the demo does

- Search sample land records by survey number, village, taluka, or district.
- Show the selected plot boundary on an OpenStreetMap base map.
- Mark the plot center, nearest road point, and field entry point.
- Display a manually mapped last-mile farm path.
- Use browser GPS to compare the user's current position with the selected entry point.
- Open Google Maps directions to the field entry point.

The current data is intentionally small and manual. This matches the recommended MVP approach: start with one village, map a limited set of parcels, validate the workflow, and then expand.

## Tech stack

- React
- TypeScript
- Vite
- Leaflet
- OpenStreetMap tiles

## Getting started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

## Project structure

```text
src/
  App.tsx              Main search, details, GPS, and map workflow
  data/parcels.ts      Sample manual parcel records
  main.tsx             React entry point
  styles.css           App styling
```

## Next steps

1. Replace sample parcel coordinates with manually mapped village data.
2. Add an admin workflow to draw or upload GeoJSON parcel boundaries.
3. Store parcels in PostgreSQL/PostGIS instead of static TypeScript data.
4. Add village/taluka/district filters and authenticated data management.
5. Add field verification metadata, photos, and legal/survey evidence records.