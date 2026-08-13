# @xtramaps/web-map-cesium

Framework-agnostic core logic for the Cesium web map component: viewer construction (background imagery, terrain) and 3D Tileset loading. Migrated from `ogcapi-html`'s `Cesium` component onto current `@cesium/engine`/`@cesium/widgets` (`^26`/`^16`).

Unlike the MapLibre/OpenLayers migrations, the original `Cesium` component was never a React component - it was a single imperative function called once per page load. This package ports that same imperative logic (viewer + tileset construction) so it can be called from any framework; [`@xtramaps/web-map-cesium-react`](https://github.com/ldproxy/xtramaps/tree/main/packages/react/web-map-cesium) wraps it in a `useEffect`-driven React component.

## Install

```sh
npm install @xtramaps/web-map-cesium
```

Requires `@cesium/engine` (`^26.0.0`) and `@cesium/widgets` (`^16.0.0`) as peer dependencies.

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
  { url: "https://demo.ldproxy.net/cologne_lod2/collections/building/3dtiles?f=json" },
  "https://demo.ldproxy.net/cologne_lod2/collections/building/styles/surface-type?f=3dtiles",
);

// call viewer.destroy() when done with it - the original never needed to (single page-lifetime mount)
```

### Exports

- `createViewer()` - builds a Cesium `Viewer` with the background imagery layer and, optionally, a terrain provider (Ion asset `1` / Cesium World Terrain by default if no `terrainProvider.url` is given)
- `loadTileset()` - loads a 3D Tileset, applies the optional vertical-shift correction (`terrainHeightDifference`) and an optional external 3D Tiles style, then flies the camera to it. Unlike the original (fire-and-forget, no error handling), failures are caught and logged instead of producing an unhandled rejection

## License

MIT
