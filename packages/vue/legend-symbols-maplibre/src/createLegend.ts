import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import { loadSprites } from "@xtramaps/legend-symbols-maplibre";
import { type CSSProperties, defineComponent } from "vue";
import { LegendSymbolVue } from "./LegendSymbol";

export interface LegendSymbolWrappedProps {
  layer: string;
  zoom?: number;
  properties?: Record<string, unknown>;
  style?: CSSProperties;
}

export const createLegend = async (
  style: StyleSpecification,
  zoom?: number,
) => {
  const sprites = await loadSprites(style);

  return defineComponent({
    name: "LegendSymbol",
    props: {
      layer: { type: String, required: true },
      zoom: { type: Number },
      properties: { type: Object as () => Record<string, unknown> },
      style: { type: Object as () => CSSProperties },
    },
    setup(props) {
      return () => {
        const l = style.layers.find((l) => l.id === props.layer);
        if (!l) {
          throw new Error(
            `Layer ${props.layer} not found in the provided style`,
          );
        }

        return LegendSymbolVue({
          layer: l,
          zoom: zoom || props.zoom || 12,
          properties: props.properties,
          style: props.style,
          sprite: sprites,
        });
      };
    },
  });
};
