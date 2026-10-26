import { copyFileSync, readdirSync } from "node:fs";
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

export function defineLibConfig(options?: {
  plugins?: Plugin[];
  entry?: Record<string, string>;
  external?: (string | RegExp)[] | ((id: string) => boolean);
}) {
  return defineConfig({
    plugins: [
      ...(options?.plugins ?? []),
      dts({
        tsconfigPath: "./tsconfig.json",
        // A single file per entry has no relative imports, so the CommonJS copy resolves the same as the original.
        rollupTypes: true,
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
