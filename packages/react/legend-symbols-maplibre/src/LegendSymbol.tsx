import {
  type LegendSymbolProps,
  legendSymbol,
  type SymbolTree,
} from "@xtramaps/legend-symbols-maplibre";
import { type CSSProperties, createElement, type ReactElement } from "react";
import Raster from "./Raster";

function camelCase(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.assign(
    {},
    ...Object.keys(obj).map((key) => {
      const camelCased = key.includes("-")
        ? key.replace(/-[a-z]/g, (g) => g[1].toUpperCase())
        : key;
      return { [camelCased]: obj[key] };
    }),
  );
}

function CSSstring(string: string): Record<string, unknown> {
  const cssJson = `{"${string
    .replace(/;$/, "")
    .replace(/;/g, '", "')
    .replace(/: /g, '": "')}"}`;
  const obj = JSON.parse(cssJson);

  return camelCase(obj);
}

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

  if (!icon) {
    return <Raster style={props.style} />;
  }

  return asReact(icon, props.style);
}
