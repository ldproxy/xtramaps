# @xtramaps/web-map-maplibre

Framework-agnostic core logic for the MapLibre web map component: basemap style resolution, GeoJSON/vector/raster data-layer wiring, and hover/click popups. Extracted from `ogcapi-html`'s `MapLibre` component.

## Install

```sh
npm install @xtramaps/web-map-maplibre
```

Requires `maplibre-gl` (`^6.0.0`) as a peer dependency.

## Usage

```ts
import { resolveWireframeBaseStyle, addData } from "@xtramaps/web-map-maplibre";

const style = await resolveWireframeBaseStyle({
  backgroundUrl: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  defaultUrl: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  defaultAttribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
});

// after creating a maplibre-gl Map with `style`:
addData(map, null, false, geojson, "geojson", {}, defaultStyle, true, "HOVER_ID", featureTitles);
```

### Exports

- `emptyStyle()`, `resolveWireframeBaseStyle()`, `rasterBaseStyle()`, `fetchBasemapStyle()`, `sanitizeBasemapStyle()`, `isValidStyle()`, `isRasterTileUrl()` - basemap style helpers
- `geoJsonLayers()`, `vectorLayers()`, `hoverLayers`, `isDataLayer()` - default layer builders
- `addData()`, `setStyleGeoJson()`, `setStyleVector()` - data-layer wiring
- `addPopup()`, `addPopupProps()` - hover/click popups
- `getBounds()`, `getFeaturesWithIdAsProperty()`, `polygonFromBounds()`, `idProperty` - GeoJSON helpers

## License

MIT
