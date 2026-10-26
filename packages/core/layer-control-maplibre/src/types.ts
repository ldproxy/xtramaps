import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { SpriteData } from "@xtramaps/legend-symbols-maplibre";

export interface LayerEntryObject {
  id: string;
  label?: string;
  zoom?: number;
  properties?: Record<string, unknown>;
}

export type LayerEntry = string | LayerEntryObject;

export interface RadioGroupEntry {
  id: string;
  label?: string;
  type: "radio-group";
  opened?: boolean;
  entries?: LayerEntry[];
}

export interface MergeGroupEntry {
  id: string;
  label?: string;
  type: "merge-group";
  sourceLayer?: string;
  entries?: LayerEntry[];
}

export interface GroupEntry {
  id: string;
  label?: string;
  type: "group";
  opened?: boolean;
  onlyLegend?: boolean;
  entries: LayerControlEntry[];
}

export type LayerControlEntry =
  | LayerEntry
  | RadioGroupEntry
  | MergeGroupEntry
  | GroupEntry;

export interface HydratedLayer {
  id: string;
  label?: string;
  zoom?: number;
  properties?: Record<string, unknown>;
  isLayer: true;
  type: "layer";
  sourceLayer?: string;
  index?: number;
  onlyLegend?: boolean;
}

export interface HydratedRadioGroup {
  id: string;
  label?: string;
  type: "radio-group";
  opened?: boolean;
  entries: HydratedLayer[];
  onlyLegend?: boolean;
}

export interface HydratedMergeGroup {
  id: string;
  label?: string;
  type: "merge-group";
  sourceLayer?: string;
  entries: HydratedLayer[];
  onlyLegend?: boolean;
}

export interface HydratedGroup {
  id: string;
  label?: string;
  type: "group";
  opened?: boolean;
  onlyLegend?: boolean;
  entries: HydratedEntry[];
}

export type HydratedEntry =
  | HydratedLayer
  | HydratedRadioGroup
  | HydratedMergeGroup
  | HydratedGroup;

export interface StyleWithSpriteLoaded extends StyleSpecification {
  spriteLoaded?: SpriteData;
}

export interface LayerControlConfig {
  opened?: boolean;
  onlyLegend?: boolean;
  entries: HydratedEntry[];
  allIds: string[];
  layerIds: string[];
  groupIds: string[];
  /** Ids initially selected, derived from the `visibility` layout property of the style's layers. */
  selectedIds: string[];
  /** Ids of groups and radio-groups that are initially expanded (all except `opened: false`). */
  openedIds: string[];
  /** Ids of layers inside merge-groups - not shown as entries of their own. */
  mergeGroupLayerIds: string[];
  radioIds: Record<string, string | null>;
  radioGroups: Record<string, string[]>;
  deps: Record<string, string[]>;
  depsParent: Record<string, string[]>;
  depsChild: Record<string, string[]>;
  style: StyleWithSpriteLoaded | null;
}
