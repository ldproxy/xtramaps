import {
  CSSstring,
  camelCase,
  type LegendSymbolProps,
  legendSymbol,
  rasterSymbol,
  type SymbolTree,
} from "@xtramaps/legend-symbols-maplibre";
import { type CSSProperties, createElement, type ReactElement } from "react";

function asReact(tree: SymbolTree, outerStyle?: CSSProperties): ReactElement {
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

  return createElement(
    tree.element,
    { ...camelCase(attributes), style: newStyle },
    tree.children ? tree.children.map((c: SymbolTree) => asReact(c)) : null,
  );
}

export interface LegendSymbolReactProps extends LegendSymbolProps {
  style?: CSSProperties;
}

export function LegendSymbolReact(props: LegendSymbolReactProps) {
  const icon = legendSymbol(props);

  return asReact(icon ?? rasterSymbol, props.style);
}
