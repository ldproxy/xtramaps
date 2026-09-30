# @xtramaps/web-map-cesium

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/web-map-cesium` (core) and `@xtramaps/web-map-cesium-react`: the Cesium map component migrated from `ogcapi-html`, onto current `@cesium/engine`/`@cesium/widgets` (`^26`/`^16`, up from `^2.3.0`/`^2.2.0`). Same viewer construction (background imagery, terrain), 3D Tileset loading (including the vertical-shift correction math), and no LayerControl/legend equivalent - the original never had one for Cesium either.

  Unlike the OpenLayers/MapLibre migrations, the original `Cesium` component was never a React component - it was a single imperative function called once per page load, with no cleanup, no error handling on its async tileset/style loading, and two previously-dead CSS rules (`style.css` was never imported). `web-map-cesium-react` wraps the same logic in a `useEffect`-driven component and makes three deliberate additions the original didn't have, since a reusable library component can be mounted and unmounted repeatedly (Storybook, demos, consumer apps) unlike a one-shot page script:

  - `viewer.destroy()` runs on unmount
  - viewer/tileset creation failures are caught and logged instead of failing silently
  - the credit-bar CSS rules are now actually imported and applied

  The component mounts once; prop changes after the initial render aren't reflected, matching the original's single-mount design (Cesium never had a dynamic update path the way OpenLayers/MapLibre's TileMatrixSet switching does).
