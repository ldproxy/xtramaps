---
"@xtramaps/layer-control-maplibre": patch
"@xtramaps/legend-symbols-maplibre": patch
"@xtramaps/web-map-cesium": patch
"@xtramaps/web-map-maplibre": patch
"@xtramaps/web-map-openlayers": patch
"@xtramaps/layer-control-maplibre-react": patch
"@xtramaps/legend-symbols-maplibre-react": patch
"@xtramaps/web-map-cesium-react": patch
"@xtramaps/web-map-maplibre-react": patch
"@xtramaps/web-map-openlayers-react": patch
"@xtramaps/legend-symbols-maplibre-svelte": patch
"@xtramaps/legend-symbols-maplibre-vue": patch
---

Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
