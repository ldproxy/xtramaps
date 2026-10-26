---
"@xtramaps/layer-control-maplibre": minor
"@xtramaps/layer-control-maplibre-react": minor
---

LayerControl: groups and radio-groups accept `opened: false` to start collapsed, and the initial selection now follows the `visibility` layout property of the style's layers instead of activating every layer. Groups start checked if all of their entries are checked, merge-groups as soon as one of their layers is visible, and radio-groups select their first entry that is not hidden in the style.
