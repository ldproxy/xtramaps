# xtramaps

Monorepo for libraries enhancing web map clients.

## Packages

| Package | Description |
| --- | --- |
| `@xtramaps/legend-symbols-maplibre` | Legend symbols for MapLibre styles |
| `@xtramaps/legend-symbols-maplibre-react` | React bindings |
| `@xtramaps/legend-symbols-maplibre-vue` | Vue bindings |
| `@xtramaps/legend-symbols-maplibre-svelte` | Svelte bindings |
| `@xtramaps/web-map-maplibre` | MapLibre web map core logic (styles, data layers, popups) |
| `@xtramaps/web-map-maplibre-react` | React MapLibre map component |
| `@xtramaps/layer-control-maplibre` | LayerControl core logic (groups, radio-groups, merge-groups) |
| `@xtramaps/layer-control-maplibre-react` | React LayerControl component |
| `@xtramaps/web-map-openlayers` | OpenLayers web map core logic (projections, view/source switching) |
| `@xtramaps/web-map-openlayers-react` | React OpenLayers map component |
| `@xtramaps/web-map-cesium` | Cesium web map core logic (viewer construction, 3D Tileset loading) |
| `@xtramaps/web-map-cesium-react` | React Cesium map component |

## Setup

```sh
npm install
```

## Development

```sh
npm run build        # Build all packages
npm run typecheck    # Type-check all packages
npm run lint         # Lint all packages
npm run test         # Run every Storybook story as an automated test (Vitest + real Chromium)
```

Turborepo handles task orchestration and caching. To build a single package:

```sh
npx turbo build --filter=@xtramaps/legend-symbols-maplibre
```

## Trying things out manually

- **Storybook** (`npm run storybook`, then open `http://localhost:6006`) is the main way to browse and interact with components — currently covers `legend-symbols-maplibre`, `layer-control-maplibre`, `web-map-openlayers`, and `web-map-cesium`. `npm run build-storybook` builds a static version. Storybook's CLI requires Node `>=20.19`; see `engines` in `package.json`.
- Some packages also ship a standalone HTML demo under `examples/*.html` (see that package's README). These aren't published anywhere yet, so they load sibling packages from local `dist/` output instead of a CDN — they only work when served over `http://`, not opened directly as a `file://` URL (browsers block ES module imports there). Any static file server works, e.g. from the repo root:
  ```sh
  npm run build
  python3 -m http.server 8080
  ```
  then open e.g. `http://localhost:8080/packages/react/web-map-maplibre/examples/web-map.html`.

## Project Structure

```
packages/
  core/      # Plain TypeScript libraries
  react/     # React variants
  vue/       # Vue variants
  svelte/    # Svelte variants
```

Each category contains library directories (e.g. `packages/core/legend-symbols-maplibre/`).

Each package uses Vite library mode and outputs ESM, CJS, and declaration files to `dist/`.

## Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

```sh
npx changeset              # Add a changeset
npm run version-packages   # Bump versions and update changelogs
npm run release            # Build and publish to npm
```

## License

[MIT](LICENSE)
