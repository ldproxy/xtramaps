# @xtramaps/web-map-cesium-react

React Cesium map component. Wraps [`@xtramaps/web-map-cesium`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/web-map-cesium) - migrated from `ogcapi-html`'s `Cesium` component onto current `@cesium/engine`/`@cesium/widgets` (`^26`/`^16`).

Unlike the MapLibre/OpenLayers migrations, the original `Cesium` component was never a React component - it was a single imperative function, called once per page load, with no cleanup, no error handling on its async tileset/style loading, and no LayerControl/legend equivalent (there never was one for Cesium either). This wrapper is new: a thin `useEffect`-driven component around the same viewer/tileset logic, plus two deliberate additions the original didn't have -

- `viewer.destroy()` runs on unmount, since a reusable component can mount/unmount repeatedly (Storybook, demos, consumer apps), unlike the original's one-shot page script
- viewer/tileset creation failures are caught and logged instead of failing silently

The component mounts once; prop changes after the initial render are not reflected (Cesium never had a dynamic update path the way OpenLayers/MapLibre's TileMatrixSet switching does).

## Example

Browse it interactively via Storybook: `npm run storybook` from the repo root, then open the `web-map-cesium/CesiumMap` story.

Not published to npm yet, so there is no CDN-hosted live example. To try the standalone demo locally:

```sh
git clone https://github.com/ldproxy/xtramaps.git
cd xtramaps
npm install
npm run build
python3 -m http.server 8080   # any static file server serving the repo root works
```

Then open `http://localhost:8080/packages/react/web-map-cesium/examples/web-map-cesium.html`. A plain `file://` open won't work - browsers block ES module imports from `file://` URLs.

## Install

```sh
npm install @xtramaps/web-map-cesium-react
```

Requires `react`, `react-dom` (`^18.0.0 || ^19.0.0`), `@cesium/engine` (`^26.0.0`), and `@cesium/widgets` (`^16.0.0`) as peer dependencies. Import `@xtramaps/web-map-cesium-react/dist/index.css` once - it bundles Cesium's own widget stylesheet plus the component's own styles.

Cesium also needs its `Workers`/`Assets`/`ThirdParty` static files served separately, with `window.CESIUM_BASE_URL` set to point at them **before** the component mounts - this package does not do that for you. The example page sets it to a CDN-hosted, version-matched build (`https://unpkg.com/cesium@<version>/Build/Cesium/`); a production app would typically copy these files into its own build output instead (e.g. via `vite-plugin-static-copy` or an equivalent bundler plugin).

## Usage

```tsx
import CesiumMap from "@xtramaps/web-map-cesium-react";
import "@xtramaps/web-map-cesium-react/dist/index.css";

window.CESIUM_BASE_URL = "https://unpkg.com/cesium@1.144.0/Build/Cesium/";

<CesiumMap
  backgroundUrl="https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{TileMatrix}/{TileRow}/{TileCol}.png"
  attribution="Geobasis NRW | &copy; basemap.de / BKG"
  accessToken={null}
  tileset={{ url: "https://demo.ldproxy.net/cologne_lod2/collections/building/3dtiles?f=json" }}
  additionalStyleUrl="https://demo.ldproxy.net/cologne_lod2/collections/building/styles/surface-type?f=3dtiles"
/>;
```

### Exports

- `CesiumMap` (default) - the map component

## License

MIT
