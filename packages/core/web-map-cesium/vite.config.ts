import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  external: ["@cesium/engine", "@cesium/widgets"],
});
