# @xtramaps/web-map-openlayers-react

## 1.2.2

### Patch Changes

- Updated dependencies [88cd82e]
- Updated dependencies [24535c6]
  - @xtramaps/web-map-openlayers@1.2.2

## 1.2.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- e473328: Update READMEs.
- Updated dependencies [41b60ec]
- Updated dependencies [e473328]
  - @xtramaps/web-map-openlayers@1.2.1

## 1.2.0

### Minor Changes

- 06deb08: Map libraries (maplibre-gl, @vis.gl/react-maplibre, ol, rlayers, @cesium/engine, @cesium/widgets) are now regular dependencies instead of peer dependencies, so consumers no longer need to install them.

### Patch Changes

- Updated dependencies [06deb08]
  - @xtramaps/web-map-openlayers@1.2.0

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-openlayers` (core) and `@xtramaps/web-map-openlayers-react`: the OpenLayers map component migrated 1:1 from `ogcapi-html`, onto current `rlayers` (`3.9.0`) and `ol` (`10.8.0`) instead of the outdated `rlayers@1.1.1`/`ol@6.9.0`. Unlike the MapLibre extraction, this is a pure migration with no new LayerControl/legend equivalent — the original component never had one. The `globalThis._map.setCurrentTileMatrixSet` global bridge is replaced with a `forwardRef`/`useImperativeHandle`-based ref API.

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/web-map-openlayers@1.1.0
