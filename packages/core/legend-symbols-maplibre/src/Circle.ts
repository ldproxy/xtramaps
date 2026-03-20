import type { SymbolHandlerProps, SymbolTree } from "./types";

export function Circle({ expr, layer }: SymbolHandlerProps): SymbolTree {
  const radius = Math.min(expr(layer, "paint", "circle-radius") as number, 8);
  const strokeWidth = Math.min(
    expr(layer, "paint", "circle-stroke-width") as number,
    4,
  );
  const fillColor = expr(layer, "paint", "circle-color") as string;
  const fillOpacity = expr(layer, "paint", "circle-opacity") as number;
  const strokeColor = expr(layer, "paint", "circle-stroke-color") as string;
  const strokeOpacity = expr(layer, "paint", "circle-stroke-opacity") as number;
  const blur = expr(layer, "paint", "circle-blur") as number;

  const innerRadius = radius - strokeWidth / 2;

  return {
    element: "svg",
    attributes: {
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg",
      style: {
        filter: `blur(${blur * innerRadius}px)`,
      },
    },
    children: [
      {
        element: "circle",
        attributes: {
          key: "l1",
          cx: 10,
          cy: 10,
          fill: fillColor,
          opacity: fillOpacity,
          r: innerRadius,
        },
      },
      {
        element: "circle",
        attributes: {
          key: "l2",
          cx: 10,
          cy: 10,
          fill: "transparent",
          opacity: strokeOpacity,
          r: radius,
          "stroke-width": strokeWidth,
          stroke: strokeColor,
        },
      },
    ],
  };
}
