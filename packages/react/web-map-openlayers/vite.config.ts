import react from "@vitejs/plugin-react";
import { defineLibConfig } from "../../vite.config.base";

export default defineLibConfig({
  plugins: [react()],
  // ol/ol.css must stay bundled (it's a real stylesheet, not a JS module to defer to the
  // peer); everything else under the "ol"/"ol/..." specifiers is externalized.
  external: (id) => {
    if (id === "ol/ol.css") return false;
    return (
      id === "react" ||
      id === "react-dom" ||
      id === "react/jsx-runtime" ||
      id === "rlayers" ||
      id === "ol" ||
      id.startsWith("ol/") ||
      id === "@xtramaps/web-map-openlayers"
    );
  },
});
