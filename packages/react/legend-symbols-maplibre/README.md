# @xtramaps/legend-symbols-maplibre-react

React component for rendering legend symbols from MapLibre GL styles. Wraps [`@xtramaps/legend-symbols-maplibre`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/legend-symbols-maplibre) and converts the virtual DOM tree into React elements.

## Example

[Live example](https://raw.githack.com/ldproxy/xtramaps/main/packages/react/legend-symbols-maplibre/examples/react-legend.html) — standalone HTML using the [Daraa topographic style](https://demo.ldproxy.net/daraa/styles/topographic?f=mbs).

## Install

```sh
npm install @xtramaps/legend-symbols-maplibre-react
```

Requires `react` and `react-dom` as peer dependencies (`^18.0.0 || ^19.0.0`).

## Usage

### `createLegend`

The easiest way to get started. Pass a MapLibre style and get back a component that renders legend symbols by layer id.

```tsx
import { createLegend } from "@xtramaps/legend-symbols-maplibre-react";

// Initialize once (loads sprites automatically)
const LegendSymbol = await createLegend(style, 14);

// Then render by layer id
<LegendSymbol layer="agriculturesrf" />
<LegendSymbol layer="settlementsrf.1" zoom={16} />
<LegendSymbol layer="annotationpnt" style={{ width: 24, height: 24 }} />
```

### `LegendSymbolReact`

Lower-level component when you need full control over sprite loading and layer objects.

```tsx
import { LegendSymbolReact } from "@xtramaps/legend-symbols-maplibre-react";

<LegendSymbolReact zoom={14} layer={myLayer} sprite={mySpriteData} />;
```

Falls back to a raster placeholder icon when the layer type is not supported.

### Exports

- `createLegend(style, zoom?)` - Async factory that loads sprites and returns a component accepting `{ layer, zoom?, properties?, style? }`.
- `LegendSymbolReact` - Lower-level component. Accepts `zoom`, `layer`, `sprite`, `properties`, and an optional `style` prop.

## License

MIT
