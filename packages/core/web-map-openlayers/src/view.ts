import type { Coordinate } from "ol/coordinate";
import { boundingExtent, getCenter } from "ol/extent";
import { fromLonLat } from "ol/proj";
import type { OpenLayersStyle, TileMatrixSet } from "./types";

export interface RView {
  center: Coordinate;
  zoom: number;
}

export interface ComputeInitialViewOptions {
  effectiveStyleUrl?: string | null;
  styleConfig?: Pick<OpenLayersStyle, "center" | "zoom" | "bounds"> | null;
  tileMatrixSets: TileMatrixSet[];
  currentTileMatrixSet?: string | null;
  bounds?: [[number, number], [number, number]] | null;
}

/**
 * Precedence, ported 1:1 from the source: a style's own center/bounds first, then the
 * active TileMatrixSet's default view, then the `bounds` prop, else no initial view at all.
 */
export const computeInitialView = ({
  effectiveStyleUrl,
  styleConfig,
  tileMatrixSets,
  currentTileMatrixSet,
  bounds,
}: ComputeInitialViewOptions): RView | null => {
  const tms = tileMatrixSets.find(
    (t) => t.tileMatrixSet === currentTileMatrixSet,
  );

  if (effectiveStyleUrl && styleConfig) {
    if (styleConfig.center) {
      return {
        center: fromLonLat(styleConfig.center),
        zoom: styleConfig.zoom || 0,
      };
    }
    if (styleConfig.bounds && styleConfig.bounds.length === 4) {
      const boundsExtent = boundingExtent([
        fromLonLat([styleConfig.bounds[0], styleConfig.bounds[1]]),
        fromLonLat([styleConfig.bounds[2], styleConfig.bounds[3]]),
      ]);
      return { center: getCenter(boundsExtent), zoom: styleConfig.zoom || 0 };
    }
    return { center: fromLonLat([0, 0]), zoom: styleConfig.zoom || 0 };
  }
  if (tms) {
    return {
      center: fromLonLat([tms.defaultCenterLon, tms.defaultCenterLat]),
      zoom: tms.defaultZoomLevel,
    };
  }
  if (bounds) {
    const extent = boundingExtent([
      fromLonLat(bounds[0]),
      fromLonLat(bounds[1]),
    ]);
    return { center: getCenter(extent), zoom: 6 };
  }
  return null;
};
