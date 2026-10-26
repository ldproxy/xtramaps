# @xtramaps/web-map-cesium-react

React Cesium map component. A thin wrapper around [`@xtramaps/web-map-cesium`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/web-map-cesium)'s viewer and tileset logic:

- the viewer is created on mount and destroyed (`viewer.destroy()`) on unmount
- viewer/tileset creation failures are caught and logged

The component mounts once; prop changes after the initial render are not applied.

## Example

Browse it interactively via Storybook: `npm run storybook` from the repo root, then open the `web-map-cesium/CesiumMap` story.

To try the standalone demo locally:

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

Requires `react` and `react-dom` (`^18.0.0 || ^19.0.0`) as peer dependencies; brings `@cesium/engine` and `@cesium/widgets` as dependencies (see [`@xtramaps/web-map-cesium`](https://github.com/ldproxy/xtramaps/tree/main/packages/core/web-map-cesium) for the Vite plugin that serves Cesium's runtime assets). Import `@xtramaps/web-map-cesium-react/dist/index.css` once - it bundles Cesium's own widget stylesheet plus the component's own styles.

Cesium also needs its `Workers`/`Assets`/`ThirdParty` static files served separately, with `window.CESIUM_BASE_URL` pointing at them **before** the component mounts. With Vite, the `cesiumAssets()` plugin from `@xtramaps/web-map-cesium/vite` serves and emits them. The example page and Storybook point it at a CDN-hosted build instead (`https://unpkg.com/cesium@<version>/Build/Cesium/`).

## Usage

```tsx
import CesiumMap from "@xtramaps/web-map-cesium-react";
import "@xtramaps/web-map-cesium-react/dist/index.css";

window.CESIUM_BASE_URL = "https://unpkg.com/cesium@1.144.0/Build/Cesium/";

<CesiumMap
  backgroundUrl="https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{TileMatrix}/{TileRow}/{TileCol}.png"
  attribution="Geobasis NRW | &copy; basemap.de / BKG"
  accessToken={null}
  tileset={{
    url: "https://demo.ldproxy.net/cologne_lod2/collections/building/3dtiles?f=json",
  }}
  additionalStyleUrl="https://demo.ldproxy.net/cologne_lod2/collections/building/styles/surface-type?f=3dtiles"
/>;
```

### Exports

- `CesiumMap` (default) - the map component

## License

MIT
