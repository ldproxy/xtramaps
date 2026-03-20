import { Circle } from "./Circle";
import { Fill } from "./Fill";
import { Line } from "./Line";
import { SymbolHandler } from "./Symbol";
import type {
  ImageResult,
  LegendSymbolProps,
  SymbolHandlerProps,
  SymbolTree,
} from "./types";
import { exprHandler } from "./util";

function extractPartOfImage(
  img: HTMLImageElement,
  {
    x,
    y,
    width,
    height,
    pixelRatio,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    pixelRatio: number;
  },
): { url: string; dimensions: { width: number; height: number } } {
  const dpi = 1 / pixelRatio;
  const el = document.createElement("canvas");
  el.width = width * dpi;
  el.height = height * dpi;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2d context");
  ctx.drawImage(img, x, y, width, height, 0, 0, width * dpi, height * dpi);
  return {
    url: el.toDataURL(),
    dimensions: { width: width * dpi, height: height * dpi },
  };
}

export function legendSymbol({
  sprite,
  zoom,
  layer,
  properties,
}: LegendSymbolProps): SymbolTree | null {
  const TYPE_MAP: Record<
    string,
    (props: SymbolHandlerProps) => SymbolTree | null
  > = {
    circle: Circle,
    symbol: SymbolHandler,
    line: Line,
    fill: Fill,
  };

  const handler = TYPE_MAP[layer.type];
  const expr = exprHandler({ zoom, properties });
  const image = (imgKey: string): ImageResult => {
    if (!imgKey) return {};
    const cleanKey = imgKey.includes(":") ? imgKey.split(":")[1] : imgKey;

    if (sprite?.json) {
      const dimensions = sprite.json[cleanKey];
      const multipleSprites = sprite.sprites && Array.isArray(sprite.sprites);

      if (dimensions) {
        if (multipleSprites) {
          const individualSprite = sprite.sprites?.find(
            (s) =>
              s.json.status === "fulfilled" &&
              s.json.value[cleanKey] &&
              s.image.status === "fulfilled",
          );
          if (individualSprite) {
            return extractPartOfImage(
              (
                individualSprite.image as PromiseFulfilledResult<HTMLImageElement>
              ).value,
              dimensions,
            );
          }
        }
        return extractPartOfImage(sprite.image, dimensions);
      }
    }
    return {};
  };

  if (handler) {
    return handler({ layer, expr, image });
  }
  return null;
}
