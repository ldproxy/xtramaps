import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const distDir = join(
  dirname(require.resolve("maplibre-gl/package.json")),
  "dist",
);

// maplibre-gl computes its worker URL at runtime from the `import.meta.url` of its own
// bundled code, which Vite can't detect. The worker imports the shared chunk via a
// relative specifier, so both have to sit next to the bundled code.
const workerFiles = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

// The .map files are not shipped, so drop the reference to keep browsers from requesting them.
const readWithoutSourceMap = (file: string) =>
  readFileSync(join(distDir, file), "utf-8").replace(
    /^\/\/# sourceMappingURL=.*$/m,
    "",
  );

/**
 * Serves (dev) and emits (build) the maplibre-gl worker scripts into the build's `assetsDir`,
 * where the bundled maplibre-gl code expects them.
 */
export function maplibreWorker(): Plugin {
  let assetsDir = "assets";
  let urlPrefix = "/";

  return {
    name: "xtramaps:maplibre-worker",
    configResolved(config) {
      assetsDir = config.build.assetsDir;
      urlPrefix = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        const file = workerFiles.find(
          (name) => path === `${urlPrefix}${assetsDir}/${name}`,
        );
        if (!file) return next();
        res.setHeader("Content-Type", "text/javascript");
        res.end(readWithoutSourceMap(file));
      });
    },
    generateBundle() {
      for (const file of workerFiles) {
        this.emitFile({
          type: "asset",
          fileName: `${assetsDir}/${file}`,
          source: readWithoutSourceMap(file),
        });
      }
    },
  };
}
