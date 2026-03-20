import type { SymbolHandlerProps, SymbolTree } from "./types";

function renderIconSymbol({
  expr,
  layer,
  image,
}: SymbolHandlerProps): SymbolTree | null {
  const imgKey = expr(layer, "layout", "icon-image") as string | undefined;
  const imgSize = expr(layer, "layout", "icon-size") as number | undefined;

  if (!imgKey) {
    return null;
  }
  const { url: dataUrl, dimensions } = image(imgKey);

  if (!dataUrl || !dimensions) {
    return null;
  }

  const { width, height } = dimensions;

  const backgroundSize = imgSize
    ? imgSize * width > 16 || imgSize * height > 16
      ? "contain"
      : `${imgSize * width}px ${imgSize * height}px`
    : "contain";

  return {
    element: "div",
    attributes: {
      style: {
        backgroundImage: `url(${dataUrl})`,
        backgroundSize,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
      },
    },
  };
}

function renderTextSymbol({
  expr,
  layer,
}: Pick<SymbolHandlerProps, "expr" | "layer">): SymbolTree {
  const textColor = expr(layer, "paint", "text-color") as string;
  const textOpacity = expr(layer, "paint", "text-opacity") as number;
  const textHaloColor = expr(layer, "paint", "text-halo-color") as string;
  const textHaloWidth = expr(layer, "paint", "text-halo-width") as number;

  const d = "M 4,4 L 16,4 L 16,7 L 11.5 7 L 11.5 16 L 8.5 16 L 8.5 7 L 4 7 Z";

  return {
    element: "svg",
    attributes: {
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg",
    },
    children: [
      {
        element: "path",
        attributes: {
          key: "l1",
          d,
          stroke: textHaloColor,
          "stroke-width": textHaloWidth * 2,
          fill: "transparent",
          "stroke-linejoin": "round",
        },
      },
      {
        element: "path",
        attributes: {
          key: "l2",
          d,
          fill: "white",
        },
      },
      {
        element: "path",
        attributes: {
          key: "l3",
          d,
          fill: textColor,
          opacity: textOpacity,
        },
      },
    ],
  };
}

export function SymbolHandler(props: SymbolHandlerProps): SymbolTree | null {
  return renderIconSymbol(props) || renderTextSymbol(props);
}
