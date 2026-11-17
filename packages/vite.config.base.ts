import { copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

function copyDeclarationsForCommonJs() {
  for (const file of readdirSync("dist")) {
    if (file.endsWith(".d.ts")) {
      copyFileSync(
        `dist/${file}`,
        `dist/${file.replace(/\.d\.ts$/, ".d.cts")}`,
      );
    }
  }
}

// Anything bundled from outside src ships a private copy of a dependency to
// consumers, next to the one npm installs: a second React or OpenLayers instance.
// Stylesheets are the exception, they are meant to be bundled into dist/index.css.
function failOnBundledDependencies(): Plugin {
  const sourceDir = join(process.cwd(), "src");
  const isOwnSource = (id: string) => id.startsWith(sourceDir);
  const isBundlerRuntime = (id: string) => id.startsWith("\0");
  const isStylesheet = (id: string) => id.endsWith(".css");

  return {
    name: "xtramaps:fail-on-bundled-dependencies",
    generateBundle(_outputOptions, bundle) {
      const bundledDependencies = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue;
        for (const id of Object.keys(output.modules)) {
          if (!isOwnSource(id) && !isBundlerRuntime(id) && !isStylesheet(id)) {
            bundledDependencies.add(id);
          }
        }
      }
      if (bundledDependencies.size > 0) {
        this.error(
          `Bundled modules from outside src, add them to "external":\n  ${[...bundledDependencies].join("\n  ")}`,
        );
      }
    },
  };
}

export function defineLibConfig(options?: {
  plugins?: Plugin[];
  entry?: Record<string, string>;
  external?: (string | RegExp)[] | ((id: string) => boolean);
}) {
  return defineConfig({
    plugins: [
      ...(options?.plugins ?? []),
      failOnBundledDependencies(),
      dts({
        tsconfigPath: "./tsconfig.json",
        // A single file per entry has no relative imports, so the CommonJS copy resolves the same as the original.
        bundleTypes: true,
        afterBuild: copyDeclarationsForCommonJs,
      }),
    ],
    build: {
      lib: {
        entry: options?.entry ?? { index: "src/index.ts" },
        formats: ["es", "cjs"],
        cssFileName: "index",
        fileName: (format, entryName) =>
          `${entryName}.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external: options?.external,
        // Already the bundler's choice for mixed exports; stating it silences MIXED_EXPORTS.
        output: { exports: "named" },
      },
    },
  });
}
