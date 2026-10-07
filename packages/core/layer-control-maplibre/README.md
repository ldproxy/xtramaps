# @xtramaps/layer-control-maplibre

Framework-agnostic core logic for the LayerControl component: parses a nested group / radio-group / merge-group configuration (or a style's own embedded `metadata["ldproxy:layerControl"]`) against a MapLibre style into a hydrated, ready-to-render tree. Extracted from `ogcapi-html`'s `LayerControl` component.

## Install

```sh
npm install @xtramaps/layer-control-maplibre
```

Uses [`@xtramaps/legend-symbols-maplibre`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/legend-symbols-maplibre)'s `loadSprites()` for sprite loading.

## Usage

```ts
import { parse, initialCfg } from "@xtramaps/layer-control-maplibre";

const config = await parse(style, entries, /* preferStyle */ true);
// config.entries -> hydrated tree ready to render
// config.selectedIds / radioIds -> initial selection, derived from the layers' `visibility`
// config.openedIds -> initially expanded groups (all except those with `opened: false`)
// config.deps / depsParent / depsChild -> selection-cascade dependency maps
```

Layers with `layout.visibility: "none"` in the style start deselected, groups start selected only if all their entries are selected, merge-groups (shown as a single entry) as soon as one of their layers is visible, and radio-groups start with their first entry that is not hidden. Groups and radio-groups are expanded unless configured with `opened: false`.

### Exports

- `parse()` - the main entry point: hydrates `entries` against a style's layers and loads sprites
- `getIds()`, `getDeps()`, `getParentDeps()`, `getChildDeps()`, `getRadioGroups()`, `asLayer()`, `getId()`, `getLabel()` - tree-walking helpers
- `initialCfg` - empty default config, useful as initial React/Vue/Svelte state

## License

MIT
