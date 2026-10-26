---
"@xtramaps/layer-control-maplibre-react": patch
---

LayerControl: fully transparent fill layers (`fill-opacity: 0`, e.g. invisible click targets for polygons) no longer hide the line layers of a merge-group in its legend icon, which previously left the icon empty.
