import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  external: [
    "@maplibre/maplibre-gl-style-spec",
    "@mapbox/geojson-extent",
    "maplibre-gl",
  ],
});
