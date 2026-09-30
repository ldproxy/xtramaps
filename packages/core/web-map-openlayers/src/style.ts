import type { OpenLayersStyle } from "./types";

export interface RasterBackgroundInfo {
  rasterBackgroundId?: string;
  rasterBackgroundUrl?: string;
  combinedAttribution: string;
}

export const getRasterBackgroundAndAttributions = (
  style: OpenLayersStyle,
): RasterBackgroundInfo => {
  let rasterBackgroundId: string | undefined;
  let rasterBackgroundUrl: string | undefined;
  const usedSourceKeys: string[] = [];
  const attributionsList: string[] = [];

  style.layers?.forEach((layer, i) => {
    const key = layer.source;
    if (key && !usedSourceKeys.includes(key)) {
      usedSourceKeys.push(key);
      const source = style.sources?.[key];
      if (
        i === 0 &&
        layer.type === "raster" &&
        source?.tiles &&
        !rasterBackgroundUrl
      ) {
        const [firstTile] = source.tiles;
        rasterBackgroundUrl = firstTile;
        rasterBackgroundId = key;
      }
      if (source?.attribution) {
        attributionsList.push(source.attribution);
      }
    }
  });

  return {
    rasterBackgroundId,
    rasterBackgroundUrl,
    combinedAttribution: attributionsList.join(" | "),
  };
};
