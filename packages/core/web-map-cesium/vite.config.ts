import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  entry: { index: "src/index.ts", vite: "src/vite.ts" },
  external: ["@cesium/engine", "@cesium/widgets", "vite", /^node:/],
});
