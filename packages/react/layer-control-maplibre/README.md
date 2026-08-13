# @xtramaps/layer-control-maplibre-react

React LayerControl component for MapLibre: nested groups, radio-groups, and merge-groups (including `sourceLayer` auto-collection), with legend icons via [`@xtramaps/legend-symbols-maplibre-react`](https://github.com/ldproxy/xtramaps/tree/main/packages/react/legend-symbols-maplibre). Must be rendered as a child of [`@xtramaps/web-map-maplibre-react`](https://github.com/ldproxy/xtramaps/tree/main/packages/react/web-map-maplibre)'s `<MapLibre>` (or any `@vis.gl/react-maplibre` `<Map>`) — the two packages have no dependency on each other.

## Example

Browse it interactively via Storybook: `npm run storybook` from the repo root, then open the `layer-control-maplibre/LayerControl` story.

Not published to npm yet, so there is no CDN-hosted live example. To try the standalone demo locally:

```sh
git clone https://github.com/ldproxy/xtramaps.git
cd xtramaps
npm install
npm run build
python3 -m http.server 8080   # any static file server serving the repo root works
```

Then open `http://localhost:8080/packages/react/layer-control-maplibre/examples/layer-control.html`. A plain `file://` open won't work — browsers block ES module imports from `file://` URLs.

## Install

```sh
npm install @xtramaps/layer-control-maplibre-react
```

Requires `react`, `react-dom` (`^18.0.0 || ^19.0.0`), `@vis.gl/react-maplibre` (`^8.1.2`), and `maplibre-gl` (`^6.0.0`) as peer dependencies. Ships `reactstrap` as a regular dependency — bring your own Bootstrap CSS.

## Usage

```tsx
import MapLibre from "@xtramaps/web-map-maplibre-react";
import { LayerControl } from "@xtramaps/layer-control-maplibre-react";

<MapLibre styleUrl="https://demo.ldproxy.net/daraa/styles/topographic?f=mbs">
  <LayerControl
    entries={[
      "militarysrf",
      {
        id: "Basemap",
        type: "radio-group",
        entries: ["utilityinfrastructurepnt", "agriculturesrf"],
      },
    ]}
    opened
  />
</MapLibre>;
```

### Exports

- `LayerControl` (default) - the map control component

## License

MIT
