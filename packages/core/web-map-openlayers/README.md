# @xtramaps/web-map-openlayers

Framework-agnostic core logic for the OpenLayers web map component: projection setup, initial-view computation, and dynamic view/source switching when the active TileMatrixSet changes.

## Install

```sh
npm install @xtramaps/web-map-openlayers
```

Brings `ol` as a dependency, pinned to `10.8.0` exactly because [`rlayers`](https://github.com/mmomtchev/rlayers) pins its own `ol` peer dependency.

## Usage

```ts
import {
  setupProjections,
  computeInitialView,
} from "@xtramaps/web-map-openlayers";

// register EPSG:25832/25833/3395 with ol - call once at module load
setupProjections();

const initial = computeInitialView({
  effectiveStyleUrl: styleUrl,
  styleConfig,
  tileMatrixSets,
  currentTileMatrixSet,
  bounds,
});
```

### Exports

- `setupProjections()` - registers the custom EPSG:25832/25833/3395 projections, needed for TileMatrixSets in those CRSs
- `computeInitialView()` - computes the initial `{center, zoom}` view from a style, a TileMatrixSet, or bounds (in that precedence order)
- `getRasterBackgroundAndAttributions()` - derives a raster background URL/id and combined attribution string from a style
- `setDynamicView()` / `setDynamicSource()` - imperative helpers that swap an `ol` map's view or a layer's source when the active TileMatrixSet changes

## License

MIT
