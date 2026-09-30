import { MVT } from "ol/format";
import type { Layer } from "ol/layer";
import type VectorTileLayer from "ol/layer/VectorTile";
import { VectorTile as VectorTileSource, XYZ as XYZSource } from "ol/source";
import TileGrid from "ol/tilegrid/TileGrid";
import { stylefunction } from "ol-mapbox-style";
import type { OpenLayersStyle, TileMatrixSet } from "./types";

export interface SetDynamicSourceOptions {
  tileMatrixSet?: TileMatrixSet | null;
  dataUrl: string;
  dataType?: string | null;
  update: boolean;
  styleObject?: OpenLayersStyle | null;
}

export const setDynamicSource = (
  layer: Layer,
  {
    tileMatrixSet,
    dataUrl,
    dataType,
    update,
    styleObject,
  }: SetDynamicSourceOptions,
): void => {
  if (!tileMatrixSet || !update) {
    return;
  }

  const url = dataUrl.replace(
    "/WebMercatorQuad/",
    `/${tileMatrixSet.tileMatrixSet}/`,
  );
  const tileGrid = new TileGrid({
    extent: JSON.parse(tileMatrixSet.extent as string),
    resolutions: JSON.parse(tileMatrixSet.resolutions as string),
    sizes: JSON.parse(tileMatrixSet.sizes as string),
  });

  layer.set(
    "source",
    dataType === "raster"
      ? new XYZSource({
          url,
          maxZoom: tileMatrixSet.maxLevel,
          projection: tileMatrixSet.projection,
          tileGrid,
        })
      : new VectorTileSource({
          url,
          format: new MVT(),
          maxZoom: tileMatrixSet.maxLevel,
          projection: tileMatrixSet.projection,
          tileGrid,
        }),
  );

  if (styleObject?.sources) {
    const sourceName = Object.entries(styleObject.sources).find(
      ([, source]) => source.type === "vector",
    )?.[0];
    if (sourceName) {
      // The source passes styleObject for both raster and vector-tile layers alike
      // (preserved from the original), but stylefunction only makes sense - and is only
      // ever actually exercised - for the vector-tile layer.
      stylefunction(
        layer as unknown as VectorTileLayer,
        styleObject,
        sourceName,
        JSON.parse(tileMatrixSet.resolutions as string),
      );
    }
  }
};
