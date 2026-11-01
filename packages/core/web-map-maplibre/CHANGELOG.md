# @xtramaps/web-map-maplibre

## 1.2.2

### Patch Changes

- 49d1083: fix(deps): update dependency maplibre-gl to ^6.16.0
- 161f32b: fix(deps): update dependency vite to >=6.4.5

## 1.2.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- e473328: Update READMEs.

## 1.2.0

### Minor Changes

- 06deb08: Map libraries (maplibre-gl, @vis.gl/react-maplibre, ol, rlayers, @cesium/engine, @cesium/widgets) are now regular dependencies instead of peer dependencies, so consumers no longer need to install them.
- 73f46e7: Add Vite plugins (`@xtramaps/web-map-cesium/vite`, `@xtramaps/web-map-maplibre/vite`) that serve and emit the runtime files Cesium and maplibre-gl load outside the module graph, so consumers no longer need direct dependencies on the map libraries just to copy them.

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-maplibre` (core) and `@xtramaps/web-map-maplibre-react`: the MapLibre map component extracted from `ogcapi-html`, rebuilt on `@vis.gl/react-maplibre` and current `maplibre-gl` (`^6`) instead of the unmaintained `react-maplibre-ui`. Includes style/data-layer helpers, hover/click popups, and a `CanvasOverlay` (formerly `CanvasPlugin`) for rendering arbitrary React children into the map canvas.
