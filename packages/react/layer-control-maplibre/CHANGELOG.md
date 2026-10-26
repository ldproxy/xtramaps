# @xtramaps/layer-control-maplibre-react

## 1.3.0

### Minor Changes

- 06deb08: Map libraries (maplibre-gl, @vis.gl/react-maplibre, ol, rlayers, @cesium/engine, @cesium/widgets) are now regular dependencies instead of peer dependencies, so consumers no longer need to install them.

## 1.2.0

### Minor Changes

- 848561e: LayerControl: groups and radio-groups accept `opened: false` to start collapsed, and the initial selection now follows the `visibility` layout property of the style's layers instead of activating every layer. Groups start checked if all of their entries are checked, merge-groups as soon as one of their layers is visible, and radio-groups select their first entry that is not hidden in the style.

### Patch Changes

- a09264d: LayerControl: fully transparent fill layers (`fill-opacity: 0`, e.g. invisible click targets for polygons) no longer hide the line layers of a merge-group in its legend icon, which previously left the icon empty.
- Updated dependencies [848561e]
  - @xtramaps/layer-control-maplibre@1.2.0

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/layer-control-maplibre` (core) and `@xtramaps/layer-control-maplibre-react`: the LayerControl component extracted from `ogcapi-html`, supporting nested groups, radio-groups and merge-groups (including `sourceLayer` auto-collection). Legend icons are now provided by `@xtramaps/legend-symbols-maplibre-react` instead of a local copy. Mounted via `@vis.gl/react-maplibre`'s `useControl`/`useMap` and composed explicitly as a child of `@xtramaps/web-map-maplibre-react`'s `MapLibre` component (no dependency between the two packages).

### Patch Changes

- Updated dependencies [d80e22d]
  - @xtramaps/layer-control-maplibre@1.1.0
