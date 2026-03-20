import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import { loadSprites } from "@xtramaps/legend-symbols-maplibre";
import type { CSSProperties } from "react";
import { LegendSymbolReact } from "./LegendSymbol";

export const createLegend = async (
  style: StyleSpecification,
  zoom?: number,
) => {
  const sprites = await loadSprites(style);

  return ({
    layer,
    zoom: layerZoom,
    properties,
    style: cssStyle,
  }: LegendSymbolWrappedProps) => {
    const l = style.layers.find((l) => l.id === layer);
    if (!l) {
      throw new Error(`Layer ${layer} not found in the provided style`);
    }

    return LegendSymbolReact({
      layer: l,
      zoom: zoom || layerZoom || 12,
      properties,
      style: cssStyle,
      sprite: sprites,
    });
  };
};

export interface LegendSymbolWrappedProps {
  layer: string;
  zoom?: number;
  properties?: Record<string, unknown>;
  style?: CSSProperties;
}
