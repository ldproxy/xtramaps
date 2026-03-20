import {
  type LegendSymbolProps,
  legendSymbol,
  rasterSymbol,
  type SymbolTree,
} from "@xtramaps/legend-symbols-maplibre";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function styleToString(style: unknown): string {
  if (typeof style === "string") {
    return style;
  }
  if (typeof style === "object" && style !== null) {
    return Object.entries(style as Record<string, unknown>)
      .map(([k, v]) => {
        const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        return `${prop}: ${v}`;
      })
      .join("; ");
  }
  return "";
}

function asHtml(tree: SymbolTree, outerStyle?: string): string {
  const { style, ...attributes } = tree.attributes;

  let styleStr = styleToString(style);

  if (outerStyle) {
    styleStr = styleStr ? `${styleStr}; ${outerStyle}` : outerStyle;
  }

  const attrs = Object.entries(attributes)
    .map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
    .join(" ");

  const styleAttr = styleStr ? ` style="${escapeAttr(styleStr)}"` : "";
  const attrStr = attrs ? ` ${attrs}` : "";

  const children = tree.children
    ? tree.children.map((c: SymbolTree) => asHtml(c)).join("")
    : "";

  return `<${tree.element}${attrStr}${styleAttr}>${children}</${tree.element}>`;
}

export interface LegendSymbolSvelteProps extends LegendSymbolProps {
  style?: string;
}

export function LegendSymbolSvelte(props: LegendSymbolSvelteProps): string {
  const icon = legendSymbol(props);

  return asHtml(icon ?? rasterSymbol, props.style);
}
