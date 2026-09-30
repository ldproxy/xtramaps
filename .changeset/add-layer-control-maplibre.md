---
"@xtramaps/layer-control-maplibre": minor
"@xtramaps/layer-control-maplibre-react": minor
---

Add `@xtramaps/layer-control-maplibre` (core) and `@xtramaps/layer-control-maplibre-react`: the LayerControl component extracted from `ogcapi-html`, supporting nested groups, radio-groups and merge-groups (including `sourceLayer` auto-collection). Legend icons are now provided by `@xtramaps/legend-symbols-maplibre-react` instead of a local copy. Mounted via `@vis.gl/react-maplibre`'s `useControl`/`useMap` and composed explicitly as a child of `@xtramaps/web-map-maplibre-react`'s `MapLibre` component (no dependency between the two packages).
