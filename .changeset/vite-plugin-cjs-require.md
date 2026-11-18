---
"@xtramaps/web-map-cesium": patch
"@xtramaps/web-map-maplibre": patch
---

Fix the CommonJS build of the `./vite` entry, which threw on load because `import.meta.url` is undefined there. It broke Vite configs that are loaded as CommonJS (no `"type": "module"`).
