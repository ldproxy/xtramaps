# @xtramaps/web-map-maplibre-react

## 1.2.2

### Patch Changes

- 49d1083: fix(deps): update dependency maplibre-gl to ^6.16.0
- Updated dependencies [49d1083]
- Updated dependencies [161f32b]
  - @xtramaps/web-map-maplibre@1.2.2

## 1.2.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- f7db57f: fix(deps): update dependency @mapbox/mapbox-gl-draw to ^1.5.2
- 452e786: fix(deps): update dependency @vis.gl/react-maplibre to ^8.1.3
- 01a91e0: fix(deps): update dependency @turf/combine to ^7.4.0
- e473328: Update READMEs.
- Updated dependencies [41b60ec]
- Updated dependencies [e473328]
  - @xtramaps/web-map-maplibre@1.2.1

## 1.2.0

### Minor Changes

- 06deb08: Map libraries (maplibre-gl, @vis.gl/react-maplibre, ol, rlayers, @cesium/engine, @cesium/widgets) are now regular dependencies instead of peer dependencies, so consumers no longer need to install them.

### Patch Changes

- Updated dependencies [06deb08]
- Updated dependencies [73f46e7]
  - @xtramaps/web-map-maplibre@1.2.0

## 1.1.1

### Patch Changes

- de50093: Fix data (e.g. GeoJSON from `data` URL) intermittently not being added and the map not fitting its bounds: adding data waited for `map.isStyleLoaded()`/`styledata`, but `isStyleLoaded()` also waits for all visible tiles, and `styledata` does not fire again once the style is loaded. It now waits for the style itself (`map.getStyle()`/`style.load`).

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-maplibre` (core) and `@xtramaps/web-map-maplibre-react`: the MapLibre map component extracted from `ogcapi-html`, rebuilt on `@vis.gl/react-maplibre` and current `maplibre-gl` (`^6`) instead of the unmaintained `react-maplibre-ui`. Includes style/data-layer helpers, hover/click popups, and a `CanvasOverlay` (formerly `CanvasPlugin`) for rendering arbitrary React children into the map canvas.

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/web-map-maplibre@1.1.0
