import type { SymbolHandlerProps, SymbolTree } from "./types";

export function Line({ layer, image, expr }: SymbolHandlerProps): SymbolTree {
  const { url: dataUrl } = image(
    expr(layer, "paint", "line-pattern") as string,
  );

  const style = {
    stroke: dataUrl
      ? `url(#img1)`
      : (expr(layer, "paint", "line-color") as string),
    strokeWidth: Math.max(
      2,
      Math.min(expr(layer, "paint", "line-width") as number, 8),
    ),
    strokeOpacity: expr(layer, "paint", "line-opacity") as number | null,
    strokeDasharray: expr(layer, "paint", "line-dasharray") as string | null,
  };
  const sw = style.strokeWidth;
  let cssStyle = `stroke: ${style.stroke};`;
  cssStyle += `stroke-width: ${sw};`;
  if (style.strokeOpacity) {
    cssStyle += `stroke-opacity: ${style.strokeOpacity};`;
  }
  if (style.strokeDasharray) {
    cssStyle += `stroke-dasharray: ${style.strokeDasharray};`;
  }

  return {
    element: "svg",
    attributes: {
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg",
    },
    children: [
      {
        element: "defs",
        attributes: {
          key: "defs",
        },
        children: [
          {
            element: "pattern",
            attributes: {
              key: "pattern",
              id: "img1",
              x: 0,
              y: 0,
              width: style.strokeWidth,
              height: style.strokeWidth,
              patternUnits: "userSpaceOnUse",
              patternTransform: `translate(${-(sw / 2)} ${-(sw / 2)}) rotate(45)`,
            },
            children: dataUrl
              ? [
                  {
                    element: "image",
                    attributes: {
                      key: "img",
                      xlinkHref: dataUrl,
                      x: 0,
                      y: 0,
                      width: style.strokeWidth,
                      height: style.strokeWidth,
                    },
                  },
                ]
              : [],
          },
        ],
      },
      {
        element: "path",
        attributes: {
          key: "path",
          style: cssStyle,
          d: "M0 20 L 20 0",
        },
      },
    ],
  };
}
