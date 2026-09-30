import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  external: [
    "@xtramaps/legend-symbols-maplibre",
    "@maplibre/maplibre-gl-style-spec",
  ],
});
