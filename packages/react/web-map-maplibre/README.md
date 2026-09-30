# @xtramaps/web-map-maplibre-react

React MapLibre map component. Wraps [`@xtramaps/web-map-maplibre`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/web-map-maplibre) and [`@vis.gl/react-maplibre`](https://visgl.github.io/react-maplibre/) — replaces the unmaintained `react-maplibre-ui`.

## Example

Not published to npm yet, so there is no CDN-hosted live example (once published, this section will link one the same way [`legend-symbols-maplibre-react`](https://github.com/ldproxy/xtramaps/tree/main/packages/react/legend-symbols-maplibre#example) does). To try the standalone demo locally:

```sh
git clone https://github.com/ldproxy/xtramaps.git
cd xtramaps
npm install
npm run build
python3 -m http.server 8080   # any static file server serving the repo root works
```

Then open `http://localhost:8080/packages/react/web-map-maplibre/examples/web-map.html`. A plain `file://` open won't work — browsers block ES module imports from `file://` URLs.

## Install

```sh
npm install @xtramaps/web-map-maplibre-react
```

Requires `react`, `react-dom` (`^18.0.0 || ^19.0.0`), `@vis.gl/react-maplibre` (`^8.1.2`), and `maplibre-gl` (`^6.0.0`) as peer dependencies. Import `@xtramaps/web-map-maplibre-react/dist/index.css` once — it bundles `maplibre-gl.css`, `mapbox-gl-draw.css`, and the component's own styles.

## Usage

```tsx
import MapLibre from "@xtramaps/web-map-maplibre-react";
import "@xtramaps/web-map-maplibre-react/dist/index.css";

<MapLibre
  styleUrl="https://demo.ldproxy.net/daraa/styles/topographic?f=mbs"
  center={[36.1, 32.62]}
  zoom={13}
/>;
```

### Exports

- `MapLibre` (default) - the map component
- `Configuration` - data-layer/popup wiring, used internally by `MapLibre` but exported for custom compositions
- `CanvasOverlay` (alias `CanvasPlugin`) - renders arbitrary React children into the map canvas, with `map`/`maplibre` injected as props
- `polygonFromBounds` - re-exported from core

## License

MIT
