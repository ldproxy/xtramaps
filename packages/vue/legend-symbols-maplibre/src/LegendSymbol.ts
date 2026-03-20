import {
  CSSstring,
  camelCase,
  type LegendSymbolProps,
  legendSymbol,
  rasterSymbol,
  type SymbolTree,
} from "@xtramaps/legend-symbols-maplibre";
import { type CSSProperties, h, type VNode } from "vue";

function asVue(tree: SymbolTree, outerStyle?: CSSProperties): VNode {
  let newStyle: CSSProperties = {};
  const { style, ...attributes } = tree.attributes;

  if (typeof style === "string") {
    newStyle = CSSstring(style) as CSSProperties;
  } else if (typeof style === "object") {
    newStyle = style as CSSProperties;
  }

  if (outerStyle) {
    newStyle = { ...newStyle, ...outerStyle };
  }

  return h(
    tree.element,
    { ...camelCase(attributes), style: newStyle },
    tree.children ? tree.children.map((c: SymbolTree) => asVue(c)) : undefined,
  );
}

export interface LegendSymbolVueProps extends LegendSymbolProps {
  style?: CSSProperties;
}

export function LegendSymbolVue(props: LegendSymbolVueProps) {
  const icon = legendSymbol(props);

  return asVue(icon ?? rasterSymbol, props.style);
}
