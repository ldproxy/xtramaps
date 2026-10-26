import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  entry: { index: "src/index.ts", vite: "src/vite.ts" },
  external: [
    "@maplibre/maplibre-gl-style-spec",
    "@mapbox/geojson-extent",
    "maplibre-gl",
    "vite",
    /^node:/,
  ],
});
