# @xtramaps/legend-symbols-maplibre-vue

Vue component for rendering legend symbols from MapLibre GL styles. Wraps [`@xtramaps/legend-symbols-maplibre`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/legend-symbols-maplibre) and converts the virtual DOM tree into Vue VNodes.

## Example

[Live example](https://raw.githack.com/ldproxy/xtramaps/main/packages/vue/legend-symbols-maplibre/examples/vue-legend.html) — standalone HTML using the [Daraa topographic style](https://demo.ldproxy.net/daraa/styles/topographic?f=mbs).

## Install

```sh
npm install @xtramaps/legend-symbols-maplibre-vue
```

Requires `vue` as a peer dependency (`^3.0.0`).

## Usage

### `createLegend`

The easiest way to get started. Pass a MapLibre style and get back a component that renders legend symbols by layer id.

```vue
<script setup>
import { createLegend } from "@xtramaps/legend-symbols-maplibre-vue";
import { shallowRef, onMounted } from "vue";

const LegendSymbol = shallowRef(null);

onMounted(async () => {
  LegendSymbol.value = await createLegend(style, 14);
});
</script>

<template>
  <component v-if="LegendSymbol" :is="LegendSymbol" layer="agriculturesrf" />
  <component :is="LegendSymbol" layer="settlementsrf.1" :zoom="16" />
  <component :is="LegendSymbol" layer="annotationpnt" :style="{ width: '24px', height: '24px' }" />
</template>
```

### `LegendSymbolVue`

Lower-level function when you need full control over sprite loading and layer objects.

```ts
import { LegendSymbolVue } from "@xtramaps/legend-symbols-maplibre-vue";

// In a render function:
LegendSymbolVue({ zoom: 14, layer: myLayer, sprite: mySpriteData });
```

Falls back to a raster placeholder icon when the layer type is not supported.

### Exports

- `createLegend(style, zoom?)` - Async factory that loads sprites and returns a Vue component accepting `layer`, `zoom?`, `properties?`, and `style?` props.
- `LegendSymbolVue` - Lower-level function. Accepts `zoom`, `layer`, `sprite`, `properties`, and an optional `style` prop.

## License

MIT
