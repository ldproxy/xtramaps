import vue from "@vitejs/plugin-vue";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [vue()],
  external: ["vue", "@xtramaps/legend-symbols-maplibre"],
});
