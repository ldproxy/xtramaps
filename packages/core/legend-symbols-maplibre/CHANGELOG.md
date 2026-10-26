# @xtramaps/legend-symbols-maplibre

## 1.0.1

### Patch Changes

- 41b60ec: Ship CommonJS type declarations (`index.d.cts`), so `require` consumers with `moduleResolution: node16`/`nodenext` get types. Declarations are now bundled into one file per entry.
- 782459f: fix(deps): update dependency @maplibre/maplibre-gl-style-spec to ^22.0.1
- dcb78fb: Return no sprite data instead of throwing when none of multiple sprite images could be loaded.

## 1.0.0

### Major Changes

- 5328e01: add core library to create legend symbols for maplibre styles
