---
"@xtramaps/web-map-openlayers": patch
"@xtramaps/web-map-openlayers-react": patch
---

fix: import OpenLayers modules with explicit `.js` extensions, so that the core package can be imported in Node ESM (e.g. during SSR)
