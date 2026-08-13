import type { Map as OlMap } from "ol";
import { fromLonLat } from "ol/proj";
import View from "ol/View";
import type { TileMatrixSet } from "./types";

export const setDynamicView = (
  map: OlMap,
  tileMatrixSet: TileMatrixSet | null | undefined,
  update: boolean,
): void => {
  if (update && tileMatrixSet) {
    map.setView(
      new View({
        center: fromLonLat(
          [tileMatrixSet.defaultCenterLon, tileMatrixSet.defaultCenterLat],
          tileMatrixSet.projection,
        ),
        zoom: tileMatrixSet.defaultZoomLevel,
        projection: tileMatrixSet.projection,
      }),
    );
  }
};
