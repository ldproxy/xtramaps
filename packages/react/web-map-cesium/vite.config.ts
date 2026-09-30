import react from "@vitejs/plugin-react";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [react()],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@cesium/engine",
    "@cesium/widgets",
    "@xtramaps/web-map-cesium",
  ],
});
