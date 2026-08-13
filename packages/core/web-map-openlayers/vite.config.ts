import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  external: ["ol", "ol-mapbox-style", "proj4", /^ol\//],
});
