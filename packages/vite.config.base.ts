import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

export function defineLibConfig(options?: {
  plugins?: Plugin[];
  entry?: Record<string, string>;
  external?: (string | RegExp)[] | ((id: string) => boolean);
}) {
  return defineConfig({
    plugins: [
      ...(options?.plugins ?? []),
      dts({ tsconfigPath: "./tsconfig.json" }),
    ],
    build: {
      lib: {
        entry: options?.entry ?? { index: "src/index.ts" },
        formats: ["es", "cjs"],
        cssFileName: "index",
        fileName: (format, entryName) =>
          `${entryName}.${format === "es" ? "js" : "cjs"}`,
      },
      ...(options?.external && {
        rollupOptions: { external: options.external },
      }),
    },
  });
}
