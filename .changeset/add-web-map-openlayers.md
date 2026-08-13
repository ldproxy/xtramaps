---
"@xtramaps/web-map-openlayers": minor
"@xtramaps/web-map-openlayers-react": minor
---

Add `@xtramaps/web-map-openlayers` (core) and `@xtramaps/web-map-openlayers-react`: the OpenLayers map component migrated 1:1 from `ogcapi-html`, onto current `rlayers` (`3.9.0`) and `ol` (`10.8.0`) instead of the outdated `rlayers@1.1.1`/`ol@6.9.0`. Unlike the MapLibre extraction, this is a pure migration with no new LayerControl/legend equivalent — the original component never had one. The `globalThis._map.setCurrentTileMatrixSet` global bridge is replaced with a `forwardRef`/`useImperativeHandle`-based ref API.
