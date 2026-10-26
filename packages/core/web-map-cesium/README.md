# @xtramaps/web-map-cesium

Framework-agnostic core logic for the Cesium web map component: viewer construction (background imagery, terrain) and 3D Tileset loading. The API is imperative, so it can be called from any framework; [`@xtramaps/web-map-cesium-react`](https://github.com/ldproxy/xtramaps/tree/main/packages/react/web-map-cesium) wraps it in a React component.

## Install

```sh
npm install @xtramaps/web-map-cesium
```

Brings `@cesium/engine` (`^26`) and `@cesium/widgets` (`^16`) as dependencies.

## Usage

```ts
import { createViewer, loadTileset } from "@xtramaps/web-map-cesium";

const viewer = createViewer(container, {
  backgroundUrl:
    "https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{TileMatrix}/{TileRow}/{TileCol}.png",
  attribution: "Geobasis NRW | &copy; basemap.de / BKG",
  accessToken: null,
});

await loadTileset(
  viewer,
  {
    url: "https://demo.ldproxy.net/cologne_lod2/collections/building/3dtiles?f=json",
  },
  "https://demo.ldproxy.net/cologne_lod2/collections/building/styles/surface-type?f=3dtiles",
);

// call viewer.destroy() when done with it
```

### Exports

- `createViewer()` - builds a Cesium `Viewer` with the background imagery layer and, optionally, a terrain provider (Ion asset `1` / Cesium World Terrain by default if no `terrainProvider.url` is given)
- `loadTileset()` - loads a 3D Tileset, applies the optional vertical-shift correction (`terrainHeightDifference`) and an optional external 3D Tiles style, then flies the camera to it. Failures are caught and logged instead of producing an unhandled rejection

### Vite plugin

Cesium loads its workers, assets and widget styles at runtime from `CESIUM_BASE_URL`, so a bundler can't discover them. `cesiumAssets()` serves them in dev and emits them on build under `<assetsDir>/<cesiumAssetsPath>`:

```js
// vite.config.js
import { cesiumAssets, cesiumAssetsPath } from "@xtramaps/web-map-cesium/vite";

export default defineConfig({
  plugins: [cesiumAssets()],
  define: { "process.env.CESIUM_PATH": JSON.stringify(cesiumAssetsPath) },
});

// at runtime, before creating the viewer
globalThis.CESIUM_BASE_URL = `${assetsUrl}/${process.env.CESIUM_PATH}`;
```

## License

MIT
