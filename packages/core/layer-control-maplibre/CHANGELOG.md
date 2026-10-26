# @xtramaps/layer-control-maplibre

## 1.3.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- 782459f: fix(deps): update dependency @maplibre/maplibre-gl-style-spec to ^22.0.1
- e473328: Update READMEs.
- Updated dependencies [41b60ec]
- Updated dependencies [782459f]
- Updated dependencies [dcb78fb]
  - @xtramaps/legend-symbols-maplibre@1.0.1

## 1.2.0

### Minor Changes

- 848561e: LayerControl: groups and radio-groups accept `opened: false` to start collapsed, and the initial selection now follows the `visibility` layout property of the style's layers instead of activating every layer. Groups start checked if all of their entries are checked, merge-groups as soon as one of their layers is visible, and radio-groups select their first entry that is not hidden in the style.

## 1.1.0

### Minor Changes

- d80e22d: Add `@xtramaps/layer-control-maplibre` (core) and `@xtramaps/layer-control-maplibre-react`: the LayerControl component extracted from `ogcapi-html`, supporting nested groups, radio-groups and merge-groups (including `sourceLayer` auto-collection). Legend icons are now provided by `@xtramaps/legend-symbols-maplibre-react` instead of a local copy. Mounted via `@vis.gl/react-maplibre`'s `useControl`/`useMap` and composed explicitly as a child of `@xtramaps/web-map-maplibre-react`'s `MapLibre` component (no dependency between the two packages).
