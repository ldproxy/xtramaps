import { createReadStream, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative } from "node:path";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const packageDir = (name: string) =>
  dirname(require.resolve(`${name}/package.json`));

const engineDir = packageDir("@cesium/engine");
const widgetsDir = packageDir("@cesium/widgets");
const version: string = JSON.parse(
  readFileSync(join(widgetsDir, "package.json"), "utf-8"),
).version;

/**
 * Where the Cesium assets end up, relative to the build's `assetsDir`.
 * `CESIUM_BASE_URL` has to point there at runtime.
 */
export const cesiumAssetsPath = `cesium/${version}`;

// Cesium loads these at runtime via fetch()/Worker() relative to CESIUM_BASE_URL,
// so no bundler can discover them on its own.
const sourceDirs: Record<string, string> = {
  Workers: join(engineDir, "Build/Workers"),
  Assets: join(engineDir, "Source/Assets"),
  ThirdParty: join(engineDir, "Source/ThirdParty"),
  "Widgets/CesiumWidget": join(engineDir, "Source/Widget"),
  Widgets: join(widgetsDir, "Source"),
};

// Module workers and wasm are rejected by browsers when served with a generic type.
const contentTypes: Record<string, string> = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".xml": "application/xml",
};

const listFiles = (dir: string) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));

/**
 * Serves (dev) and emits (build) the static files Cesium needs at runtime
 * under `<assetsDir>/<cesiumAssetsPath>`.
 */
export function cesiumAssets(): Plugin {
  // output path below the build's outDir -> absolute source path
  const files = new Map<string, string>();
  let urlPrefix = "/";

  return {
    name: "xtramaps:cesium-assets",
    configResolved(config) {
      const targetDir = `${config.build.assetsDir}/${cesiumAssetsPath}`;
      for (const [target, sourceDir] of Object.entries(sourceDirs)) {
        for (const file of listFiles(sourceDir)) {
          files.set(
            `${targetDir}/${target}/${relative(sourceDir, file)}`,
            file,
          );
        }
      }
      urlPrefix = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent(req.url?.split("?")[0] ?? "");
        const file = path.startsWith(urlPrefix)
          ? files.get(path.slice(urlPrefix.length))
          : undefined;
        if (!file) return next();
        res.setHeader(
          "Content-Type",
          contentTypes[extname(file)] ?? "application/octet-stream",
        );
        createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      for (const [fileName, file] of files) {
        this.emitFile({ type: "asset", fileName, source: readFileSync(file) });
      }
    },
  };
}
