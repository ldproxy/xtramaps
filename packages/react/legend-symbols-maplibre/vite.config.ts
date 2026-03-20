import react from "@vitejs/plugin-react";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [react()],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@xtramaps/legend-symbols-maplibre",
  ],
});
