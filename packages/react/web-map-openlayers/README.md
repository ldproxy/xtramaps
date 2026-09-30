# @xtramaps/web-map-openlayers-react

React OpenLayers map component. Wraps [`@xtramaps/web-map-openlayers`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/web-map-openlayers) and [`rlayers`](https://github.com/mmomtchev/rlayers) — migrated 1:1 from `ogcapi-html`'s `OpenLayers` component onto current `rlayers` (`3.9.0`) and `ol` (`10.8.0`). Unlike the MapLibre side of this migration, there is no LayerControl/legend equivalent to port here — the original component never had one.

## Example

Browse it interactively via Storybook: `npm run storybook` from the repo root, then open the `web-map-openlayers/OpenLayers` story.

Not published to npm yet, so there is no CDN-hosted live example. To try the standalone demo locally:

```sh
git clone https://github.com/ldproxy/xtramaps.git
cd xtramaps
npm install
npm run build
python3 -m http.server 8080   # any static file server serving the repo root works
```

Then open `http://localhost:8080/packages/react/web-map-openlayers/examples/web-map-openlayers.html`. A plain `file://` open won't work — browsers block ES module imports from `file://` URLs.

## Install

```sh
npm install @xtramaps/web-map-openlayers-react
```

Requires `react`, `react-dom` (`^18.0.0 || ^19.0.0`), `rlayers` (`^3.9.0`), and `ol` (`10.8.0` exactly) as peer dependencies. Import `@xtramaps/web-map-openlayers-react/dist/index.css` once — it bundles `ol`'s own stylesheet plus the component's own styles.

## Usage

```tsx
import OpenLayers, { type OpenLayersRef } from "@xtramaps/web-map-openlayers-react";
import "@xtramaps/web-map-openlayers-react/dist/index.css";
import { useRef } from "react";

const ref = useRef<OpenLayersRef>(null);

<OpenLayers
  ref={ref}
  styleUrl="https://demo.ldproxy.net/daraa/styles/topographic?f=mbs"
  dataType="vector"
  dataUrl="https://demo.ldproxy.net/daraa/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt"
  tileMatrixSets={tileMatrixSets}
/>;

// switch the active TileMatrixSet - replaces the old `globalThis._map.setCurrentTileMatrixSet` bridge
ref.current?.setCurrentTileMatrixSet("WorldMercatorWGS84Quad");
```

`styleUrl` requires at least one complete entry in `tileMatrixSets` (with `extent`/`resolutions`/`sizes` as JSON-encoded strings) - the style fetch only fires once a TileMatrixSet is active. In production, ldproxy computes these entries server-side; see the example page for how to build one from the raw OGC TileMatrixSet resource.

### Exports

- `OpenLayers` (default) - the map component, accepts a `ref` typed as `OpenLayersRef`

## License

MIT
