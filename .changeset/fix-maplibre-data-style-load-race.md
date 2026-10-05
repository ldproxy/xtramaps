---
"@xtramaps/web-map-maplibre-react": patch
---

Fix data (e.g. GeoJSON from `data` URL) intermittently not being added and the map not fitting its bounds: adding data waited for `map.isStyleLoaded()`/`styledata`, but `isStyleLoaded()` also waits for all visible tiles, and `styledata` does not fire again once the style is loaded. It now waits for the style itself (`map.getStyle()`/`style.load`).
