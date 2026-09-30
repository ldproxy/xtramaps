# Agents

Instructions for AI coding agents working on this repo.

## Project

TypeScript monorepo for libraries enhancing web map clients (`@xtramaps` scope) with framework-specific variants. Libraries are published to npm.

## Structure

```
packages/
  vite.config.base.ts  # Shared Vite lib config factory
  core/<lib>/          # Plain TypeScript (no framework deps)
  react/<lib>/         # React variant (depends on core, peers on react)
  vue/<lib>/           # Vue variant (depends on core, peers on vue)
  svelte/<lib>/        # Svelte variant (depends on core, peers on svelte)
```

Each library has: `package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.ts`.

## Naming

- `@xtramaps/<lib>` — core package
- `@xtramaps/<lib>-react` — React variant
- `@xtramaps/<lib>-vue` — Vue variant
- `@xtramaps/<lib>-svelte` — Svelte variant

## Commands

- `npm run build` — build all packages (via Turborepo)
- `npm run lint` — lint and format check (Biome)
- `npm run lint:fix` — auto-fix lint/format issues
- `npm run typecheck` — type-check all packages
- `npm run test` — run all Storybook stories as automated tests (Vitest browser mode, real Chromium via Playwright)
- `npm run storybook` — start the Storybook dev server (root-level, covers all packages)
- `npm run build-storybook` — build a static Storybook

## Key Conventions

- All packages output ESM + CJS + `.d.ts` via Vite library mode
- `vite.config.ts` uses `defineLibConfig()` from `packages/vite.config.base.ts`
- `tsconfig.json` extends `tsconfig.base.json` (must specify `outDir`, `rootDir`, `include` locally)
- Shared devDeps (`typescript`, `vite`, `vite-plugin-dts`) live in root only — do not add to individual packages
- Framework deps (react, vue, svelte) are externalized and declared as `peerDependencies`
- Core deps are listed in `dependencies` (not peers)
- Biome handles formatting and linting — no Prettier or ESLint
- Changesets for versioning — run `npx changeset` after changes
- Storybook config lives at the repo root (`.storybook/`); stories live next to the code they cover (`packages/react/<lib>/src/*.stories.tsx`), not in a separate app. `@storybook/addon-vitest` runs every story (including its `play` function) as a Vitest test in real Chromium — no separate test framework needed
- Playwright's Chromium binary installs automatically via the root `prepare` script (`npm install` → `playwright install chromium`)

## Adding a New Library

1. Create `packages/core/<lib>/` with `package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.ts`
2. Create corresponding `packages/{react,vue,svelte}/<lib>/` variants
3. Run `npm install` to link workspaces
4. Run `npm run build` to verify

## Checks Before Committing

1. `npm run lint` passes
2. `npm run build` succeeds
3. `npm run typecheck` passes
4. `npm run test` passes (if stories exist for the changed package)
