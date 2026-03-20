import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

export function defineLibConfig(options?: {
  plugins?: Plugin[];
  external?: string[];
}) {
  return defineConfig({
    plugins: [
      ...(options?.plugins ?? []),
      dts({ tsconfigPath: "./tsconfig.json" }),
    ],
    build: {
      lib: {
        entry: "src/index.ts",
        formats: ["es", "cjs"],
        fileName: "index",
      },
      ...(options?.external && {
        rollupOptions: { external: options.external },
      }),
    },
  });
}
