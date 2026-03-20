import type { SymbolHandlerProps, SymbolTree } from "./types";

export function Fill({ image, expr, layer }: SymbolHandlerProps): SymbolTree {
  const { url: dataUrl } = image(
    expr(layer, "paint", "fill-pattern") as string,
  );
  const baseStyle: Record<string, unknown> = {
    width: "100%",
    height: "100%",
    opacity: expr(layer, "paint", "fill-opacity"),
  };
  const style = dataUrl
    ? {
        ...baseStyle,
        backgroundImage: `url(${dataUrl})`,
        backgroundPosition: "top left",
      }
    : {
        ...baseStyle,
        backgroundColor: expr(layer, "paint", "fill-color"),
        backgroundSize: "66% 66%",
        backgroundPosition: "center",
      };

  return {
    element: "div",
    attributes: {
      style,
    },
  };
}
