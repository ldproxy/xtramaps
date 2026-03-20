import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [svelte()],
  external: ["svelte", "@xtramaps/legend-symbols-maplibre"],
});
