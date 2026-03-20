# @xtramaps/legend-symbols-maplibre-svelte

Svelte helpers for rendering legend symbols from MapLibre GL styles. Wraps [`@xtramaps/legend-symbols-maplibre`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/legend-symbols-maplibre) and converts the virtual DOM tree into HTML strings for use with `{@html}`.

## Example

[Live example](https://raw.githack.com/ldproxy/xtramaps/main/packages/svelte/legend-symbols-maplibre/examples/svelte-legend.html) — standalone HTML using the [Daraa topographic style](https://demo.ldproxy.net/daraa/styles/topographic?f=mbs).

## Install

```sh
npm install @xtramaps/legend-symbols-maplibre-svelte
```

Requires `svelte` as a peer dependency (`^5.0.0`).

## Usage

### `createLegend`

The easiest way to get started. Pass a MapLibre style and get back a function that renders legend symbols by layer id.

```svelte
<script>
  import { createLegend } from "@xtramaps/legend-symbols-maplibre-svelte";

  let legend = $state(null);

  $effect(() => {
    createLegend(style, 14).then((l) => (legend = l));
  });
</script>

{#if legend}
  {@html legend({ layer: "agriculturesrf" })}
  {@html legend({ layer: "settlementsrf.1", zoom: 16 })}
  {@html legend({ layer: "annotationpnt", style: "width: 24px; height: 24px" })}
{/if}
```

### `LegendSymbolSvelte`

Lower-level function when you need full control over sprite loading and layer objects.

```svelte
<script>
  import { LegendSymbolSvelte } from "@xtramaps/legend-symbols-maplibre-svelte";
</script>

{@html LegendSymbolSvelte({ zoom: 14, layer: myLayer, sprite: mySpriteData })}
```

Falls back to a raster placeholder icon when the layer type is not supported.

### Exports

- `createLegend(style, zoom?)` - Async factory that loads sprites and returns a function accepting `{ layer, zoom?, properties?, style? }` and returning an HTML string.
- `LegendSymbolSvelte` - Lower-level function. Accepts `zoom`, `layer`, `sprite`, `properties`, and an optional `style` prop (CSS string). Returns an HTML string.

## License

MIT
