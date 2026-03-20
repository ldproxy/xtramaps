# xtramaps

Monorepo for libraries enhancing web map clients.

## Packages

| Package | Description |
| --- | --- |
| `@xtramaps/legend-symbols-maplibre` | Legend symbols for MapLibre styles |
| `@xtramaps/legend-symbols-maplibre-react` | React bindings |
| `@xtramaps/legend-symbols-maplibre-vue` | Vue bindings |
| `@xtramaps/legend-symbols-maplibre-svelte` | Svelte bindings |

## Setup

```sh
npm install
```

## Development

```sh
npm run build        # Build all packages
npm run typecheck    # Type-check all packages
npm run lint         # Lint all packages
```

Turborepo handles task orchestration and caching. To build a single package:

```sh
npx turbo build --filter=@xtramaps/legend-symbols-maplibre
```

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
