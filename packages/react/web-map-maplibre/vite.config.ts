import react from "@vitejs/plugin-react";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [react()],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@vis.gl/react-maplibre",
    "maplibre-gl",
    "@mapbox/mapbox-gl-draw",
    "@turf/combine",
    "@xtramaps/web-map-maplibre",
  ],
});
