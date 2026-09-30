# @xtramaps/layer-control-maplibre-react

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/layer-control-maplibre` (core) and `@xtramaps/layer-control-maplibre-react`: the LayerControl component extracted from `ogcapi-html`, supporting nested groups, radio-groups and merge-groups (including `sourceLayer` auto-collection). Legend icons are now provided by `@xtramaps/legend-symbols-maplibre-react` instead of a local copy. Mounted via `@vis.gl/react-maplibre`'s `useControl`/`useMap` and composed explicitly as a child of `@xtramaps/web-map-maplibre-react`'s `MapLibre` component (no dependency between the two packages).

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/layer-control-maplibre@1.1.0
