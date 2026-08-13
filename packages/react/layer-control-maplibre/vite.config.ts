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
    "reactstrap",
    "@xtramaps/layer-control-maplibre",
    "@xtramaps/legend-symbols-maplibre-react",
  ],
});
