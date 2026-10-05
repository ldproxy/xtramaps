# @xtramaps/web-map-maplibre-react

## 1.1.1

### Patch Changes

- de50093: Fix data (e.g. GeoJSON from `data` URL) intermittently not being added and the map not fitting its bounds: adding data waited for `map.isStyleLoaded()`/`styledata`, but `isStyleLoaded()` also waits for all visible tiles, and `styledata` does not fire again once the style is loaded. It now waits for the style itself (`map.getStyle()`/`style.load`).

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-maplibre` (core) and `@xtramaps/web-map-maplibre-react`: the MapLibre map component extracted from `ogcapi-html`, rebuilt on `@vis.gl/react-maplibre` and current `maplibre-gl` (`^6`) instead of the unmaintained `react-maplibre-ui`. Includes style/data-layer helpers, hover/click popups, and a `CanvasOverlay` (formerly `CanvasPlugin`) for rendering arbitrary React children into the map canvas.

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/web-map-maplibre@1.1.0
