import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import { loadSprites } from "@xtramaps/legend-symbols-maplibre";
import { LegendSymbolSvelte } from "./LegendSymbol";

export interface LegendSymbolWrappedProps {
  layer: string;
  zoom?: number;
  properties?: Record<string, unknown>;
  style?: string;
}

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
  }: LegendSymbolWrappedProps): string => {
    const l = style.layers.find((l) => l.id === layer);
    if (!l) {
      throw new Error(`Layer ${layer} not found in the provided style`);
    }

    return LegendSymbolSvelte({
      layer: l,
      zoom: zoom || layerZoom || 12,
      properties,
      style: cssStyle,
      sprite: sprites,
    });
  };
};
