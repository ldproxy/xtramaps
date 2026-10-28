# @xtramaps/web-map-cesium-react

## 1.2.2

### Patch Changes

- Updated dependencies [161f32b]
  - @xtramaps/web-map-cesium@1.2.2

## 1.2.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- 717e946: fix(deps): update cesium
- e473328: Update READMEs.
- Updated dependencies [41b60ec]
- Updated dependencies [717e946]
- Updated dependencies [e473328]
  - @xtramaps/web-map-cesium@1.2.1

## 1.2.0

### Minor Changes

- 06deb08: Map libraries (maplibre-gl, @vis.gl/react-maplibre, ol, rlayers, @cesium/engine, @cesium/widgets) are now regular dependencies instead of peer dependencies, so consumers no longer need to install them.

### Patch Changes

- Updated dependencies [06deb08]
- Updated dependencies [73f46e7]
  - @xtramaps/web-map-cesium@1.2.0

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-cesium` (core) and `@xtramaps/web-map-cesium-react`: the Cesium map component migrated from `ogcapi-html`, onto current `@cesium/engine`/`@cesium/widgets` (`^26`/`^16`, up from `^2.3.0`/`^2.2.0`). Same viewer construction (background imagery, terrain), 3D Tileset loading (including the vertical-shift correction math), and no LayerControl/legend equivalent - the original never had one for Cesium either.

  Unlike the OpenLayers/MapLibre migrations, the original `Cesium` component was never a React component - it was a single imperative function called once per page load, with no cleanup, no error handling on its async tileset/style loading, and two previously-dead CSS rules (`style.css` was never imported). `web-map-cesium-react` wraps the same logic in a `useEffect`-driven component and makes three deliberate additions the original didn't have, since a reusable library component can be mounted and unmounted repeatedly (Storybook, demos, consumer apps) unlike a one-shot page script:
  - `viewer.destroy()` runs on unmount
  - viewer/tileset creation failures are caught and logged instead of failing silently
  - the credit-bar CSS rules are now actually imported and applied

  The component mounts once; prop changes after the initial render aren't reflected, matching the original's single-mount design (Cesium never had a dynamic update path the way OpenLayers/MapLibre's TileMatrixSet switching does).

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/web-map-cesium@1.1.0
