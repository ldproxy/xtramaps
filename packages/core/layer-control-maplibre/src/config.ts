import { loadSprites } from "@xtramaps/legend-symbols-maplibre";
import type {
  HydratedEntry,
  LayerControlConfig,
  LayerControlEntry,
  StyleWithSpriteLoaded,
} from "./types";

/**
 * Loose recursive tree-node shape shared by the config-parsing helpers below - entries
 * are either plain layer-id strings or objects that may recurse via `entries`,
 * `subLayers` or `layers` (the latter two never occur in the current data model but are
 * preserved 1:1 from the source implementation, which supported them defensively).
 */
type EntryLike =
  | string
  | (Record<string, unknown> & { id?: string; type?: string });

export const getLabel = (entry: EntryLike): string =>
  typeof entry === "string"
    ? entry
    : (entry.label as string) || (entry.id as string);

export const getId = (entry: EntryLike): string =>
  typeof entry === "string" ? entry : (entry.id as string);

export const asLayer = (entry: EntryLike): Record<string, unknown> =>
  typeof entry === "string"
    ? { id: entry, isLayer: true, type: "layer" }
    : { ...entry, isLayer: true, type: "layer" };

export const getRadioGroups = (
  groups: EntryLike[],
  selected?: boolean,
): Record<string, string | string[] | null> => {
  const radioGroups: Record<string, string | string[] | null> = {};

  groups
    .filter(
      (g): g is Record<string, unknown> =>
        typeof g !== "string" && g.isBasemap === true,
    )
    .forEach((g) => {
      const entries = g.entries as EntryLike[] | undefined;
      const id = g.id as string;
      if (selected) {
        radioGroups[id] =
          entries && entries.length > 0 ? getId(entries[0]) : null;
      } else {
        radioGroups[id] = entries ? entries.map((e) => getId(e)) : [];
      }
    });

  return radioGroups;
};

const getRadioGroupLayers = (
  groups: EntryLike[],
  selectedOnly?: boolean,
): Record<string, string | string[] | null> => {
  const radioGroups: Record<string, string | string[] | null> = {};

  groups
    .filter(
      (g): g is Record<string, unknown> =>
        typeof g !== "string" && g.type === "radio-group",
    )
    .forEach((g) => {
      const entries = g.entries as EntryLike[] | undefined;
      const id = g.id as string;
      if (selectedOnly) {
        radioGroups[id] =
          entries && entries.length > 0 ? getId(entries[0]) : null;
      } else {
        radioGroups[id] = entries ? entries.map((e) => getId(e)) : [];
      }
    });

  return radioGroups;
};

export const getIds = (entries: EntryLike[], types?: string[]): string[] => {
  const ids: string[] = [];

  entries.forEach((e) => {
    const type = typeof e === "string" ? undefined : e.type;
    if (!types || types.includes(type as string)) {
      ids.push(getId(e));
    }
    const children =
      typeof e === "string"
        ? undefined
        : (e.entries as EntryLike[] | undefined);
    if (children) {
      getIds(children, types).forEach((id) => {
        ids.push(id);
      });
    }
  });

  return ids;
};

/** Every entry (string or object) reduces to a plain id string - preserved from `g.id || g`. */
const idOf = (g: EntryLike): string =>
  typeof g === "string" ? g : (g.id as string);

const childrenOf = (g: EntryLike): EntryLike[] =>
  typeof g === "string"
    ? []
    : ((g.entries || g.subLayers || g.layers || []) as EntryLike[]);

export const getDeps = (
  groups: EntryLike[],
  parents: string[] = [],
): Record<string, string[]> => {
  const deps: Record<string, string[]> = {};

  groups.forEach((g) => {
    const id = idOf(g);
    const childDeps = getDeps(childrenOf(g), parents.concat([id]));
    deps[id] = [
      ...new Set(parents.concat([id]).concat(Object.values(childDeps).flat())),
    ];
    Object.keys(childDeps).forEach((c) => {
      deps[c] = childDeps[c];
    });
  });

  return deps;
};

export const getParentDeps = (
  groups: EntryLike[],
  parents: string[] = [],
): Record<string, string[]> => {
  const deps: Record<string, string[]> = {};

  groups.forEach((g) => {
    const id = idOf(g);
    const childDeps = getParentDeps(childrenOf(g), [id].concat(parents));
    deps[id] = parents.filter((id2) => id2 !== id);
    Object.keys(childDeps).forEach((c) => {
      deps[c] = childDeps[c];
    });
  });

  return deps;
};

export function getChildDeps(groups: EntryLike[]): Record<string, string[]>;
export function getChildDeps(
  groups: EntryLike[],
  tmp: true,
): { clean: Record<string, string[]>; tmp: Record<string, string[]> };
export function getChildDeps(
  groups: EntryLike[],
  tmp?: boolean,
):
  | Record<string, string[]>
  | { clean: Record<string, string[]>; tmp: Record<string, string[]> } {
  const deps: {
    clean: Record<string, string[]>;
    tmp: Record<string, string[]>;
  } = {
    clean: {},
    tmp: {},
  };

  groups.forEach((g) => {
    const id = idOf(g);
    const childDeps = getChildDeps(childrenOf(g), true);
    deps.tmp[id] =
      Object.keys(childDeps.tmp).length > 0
        ? [...new Set([id].concat(Object.values(childDeps.tmp).flat()))]
        : [id];
    deps.clean[id] = deps.tmp[id].filter((id2) => id2 !== id);
    Object.keys(childDeps.clean).forEach((c) => {
      deps.clean[c] = childDeps.clean[c];
    });
  });

  return tmp ? deps : deps.clean;
}

const getLayers = (
  style: StyleWithSpriteLoaded | null,
): Record<string, Record<string, unknown>> =>
  style?.layers
    ? style.layers.reduce(
        (layers: Record<string, Record<string, unknown>>, layer, index) => {
          layers[layer.id] = {
            id: layer.id,
            isLayer: true,
            type: "layer",
            sourceLayer: (layer as { "source-layer"?: string })["source-layer"],
            index,
          };
          return layers;
        },
        {},
      )
    : {};

const getLayersFor = (
  sourceLayer: string,
  layers: Record<string, Record<string, unknown>>,
): Record<string, unknown>[] =>
  Object.values(layers)
    .filter((layer) => layer.sourceLayer === sourceLayer)
    .slice()
    .sort((layer) => layer.index as number);

const enrichLayer = (
  target: Record<string, unknown>,
  layers: Record<string, Record<string, unknown>>,
): Record<string, unknown> =>
  Object.hasOwn(layers, target.id as string)
    ? { ...target, ...layers[target.id as string] }
    : target;

const mergeLayers = (
  from: Record<string, unknown>[],
  into: Record<string, unknown>[],
): Record<string, unknown>[] => {
  return from.map((layer) => {
    const matching = into.find((layer2) => layer2.id === layer.id);
    if (matching) {
      return { ...matching, ...layer };
    }
    return layer;
  });
};

const entryTypes = ["merge-group", "radio-group", "group", "layer", undefined];

const validate = (entry: EntryLike): boolean => {
  if (typeof entry !== "string" && !Object.hasOwn(entry, "id")) {
    // eslint-disable-next-line no-console
    console.error(
      "Invalid entry, only strings or objects with id allowed.",
      entry,
    );
    return false;
  }
  if (
    !entryTypes.includes(typeof entry === "string" ? undefined : entry.type)
  ) {
    // eslint-disable-next-line no-console
    console.error(
      "Invalid entry, unknown type:",
      typeof entry === "string" ? undefined : entry.type,
    );
    return false;
  }
  return true;
};

const hydrate = (
  entries: EntryLike[],
  layers: Record<string, Record<string, unknown>>,
): Record<string, unknown>[] => {
  return entries
    .map((entry) => {
      if (!validate(entry)) {
        return null;
      }
      if (
        typeof entry !== "string" &&
        entry.type === "merge-group" &&
        entry.sourceLayer
      ) {
        const matching = getLayersFor(entry.sourceLayer as string, layers);
        return {
          ...entry,
          entries: entry.entries
            ? mergeLayers(
                matching,
                hydrate(entry.entries as EntryLike[], layers),
              )
            : matching,
        };
      }
      if (typeof entry !== "string" && entry.entries) {
        return {
          ...entry,
          entries: hydrate(entry.entries as EntryLike[], layers),
        };
      }
      if (typeof entry !== "string" && (entry.layers || entry.subLayers)) {
        return entry;
      }
      return enrichLayer(asLayer(entry), layers);
    })
    .filter((entry): entry is Record<string, unknown> => entry !== null);
};

export const parse = async (
  style: StyleWithSpriteLoaded,
  entriesCfg: LayerControlEntry[],
  preferStyle?: boolean,
): Promise<LayerControlConfig> => {
  const styleMetadataCfg =
    preferStyle &&
    style.metadata &&
    (style.metadata as Record<string, unknown>)["ldproxy:layerControl"]
      ? ((style.metadata as Record<string, unknown>)[
          "ldproxy:layerControl"
        ] as {
          opened?: boolean;
          onlyLegend?: boolean;
          entries?: LayerControlEntry[];
        })
      : ({} as {
          opened?: boolean;
          onlyLegend?: boolean;
          entries?: LayerControlEntry[];
        });

  const { opened, onlyLegend, entries = entriesCfg } = styleMetadataCfg;
  const layers = getLayers(style);
  const hydrated = hydrate(entries as EntryLike[], layers);

  const config: LayerControlConfig = {
    opened,
    onlyLegend,
    entries: hydrated as unknown as HydratedEntry[],
    allIds: getIds(hydrated as EntryLike[]),
    layerIds: getIds(hydrated as EntryLike[], ["layer"]),
    groupIds: getIds(hydrated as EntryLike[], ["group", "radio-group"]),
    radioIds: getRadioGroupLayers(hydrated as EntryLike[], true) as Record<
      string,
      string | null
    >,
    radioGroups: getRadioGroupLayers(hydrated as EntryLike[]) as Record<
      string,
      string[]
    >,
    deps: getDeps(hydrated as EntryLike[]),
    depsParent: getParentDeps(hydrated as EntryLike[]),
    depsChild: getChildDeps(hydrated as EntryLike[]),
    style,
  };

  const sprite = await loadSprites(style);
  if (sprite) {
    style.spriteLoaded = sprite;
  }

  return config;
};

export const initialCfg: LayerControlConfig = {
  entries: [],
  allIds: [],
  layerIds: [],
  groupIds: [],
  radioIds: {},
  radioGroups: {},
  deps: {},
  depsParent: {},
  depsChild: {},
  style: null,
};
