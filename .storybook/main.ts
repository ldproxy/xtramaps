import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../packages/react/*/src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  addons: ["@storybook/addon-vitest"],
  async viteFinal(config) {
    // maplibre-gl spawns its worker via a relative sibling-file URL
    // (maplibre-gl-worker.mjs). Vite's dependency pre-bundler copies packages
    // into a content-hashed cache dir and breaks that relative reference,
    // so the worker 404s and the map never renders tile data. Excluding
    // maplibre-gl from pre-bundling serves it straight from node_modules,
    // where the sibling worker file resolves correctly.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude ?? []), "maplibre-gl"],
    };
    return config;
  },
};

export default config;
