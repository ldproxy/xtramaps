---
"@xtramaps/web-map-cesium": minor
"@xtramaps/web-map-maplibre": minor
---

Add Vite plugins (`@xtramaps/web-map-cesium/vite`, `@xtramaps/web-map-maplibre/vite`) that serve and emit the runtime files Cesium and maplibre-gl load outside the module graph, so consumers no longer need direct dependencies on the map libraries just to copy them.
