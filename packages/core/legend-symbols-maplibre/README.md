# @xtramaps/legend-symbols-maplibre

Framework-agnostic library for generating legend symbols from MapLibre GL styles. Takes a style layer and produces a plain virtual DOM tree (`{ element, attributes, children }`) that can be rendered by any framework.

Supports `circle`, `line`, `fill`, and `symbol` layer types.

## Install

```sh
npm install @xtramaps/legend-symbols-maplibre
```

## Usage

```ts
import { legendSymbol } from "@xtramaps/legend-symbols-maplibre";

const tree = legendSymbol({ zoom: 14, layer: myLayer, sprite: mySpriteData });

// tree is a plain object like:
// { element: "svg", attributes: { viewBox: "0 0 20 20", ... }, children: [...] }
```

### Utilities

```ts
import {
  exprHandler,
  mapImageToDataURL,
  cache,
  loadImage,
  loadJson,
} from "@xtramaps/legend-symbols-maplibre";
```

- `exprHandler({ zoom, properties })` - Evaluates MapLibre style expressions for a given zoom level and feature properties.
- `mapImageToDataURL(map, icon)` - Extracts an icon from a MapLibre map instance as a data URL.
- `cache` - Simple reference-counted cache for sprite data.
- `loadImage(url, { transformRequest })` / `loadJson(url, { transformRequest })` - Load sprite assets with optional request transformation.

## License

MIT
