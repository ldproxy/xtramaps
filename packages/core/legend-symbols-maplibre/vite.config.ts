import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  external: ["@maplibre/maplibre-gl-style-spec"],
});
