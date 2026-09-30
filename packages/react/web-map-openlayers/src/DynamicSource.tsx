import type {
  OpenLayersStyle,
  TileMatrixSet,
} from "@xtramaps/web-map-openlayers";
import { setDynamicSource } from "@xtramaps/web-map-openlayers";
import { useEffect } from "react";
import { useOL } from "rlayers";

export interface DynamicSourceProps {
  tileMatrixSet?: TileMatrixSet | null;
  dataUrl: string;
  dataType?: string | null;
  update?: boolean;
  styleObject?: OpenLayersStyle | null;
}

function DynamicSource({
  tileMatrixSet = null,
  dataUrl,
  dataType = null,
  update = false,
  styleObject = null,
}: DynamicSourceProps) {
  const { layer } = useOL();

  useEffect(() => {
    setDynamicSource(layer, {
      tileMatrixSet,
      dataUrl,
      dataType,
      update,
      styleObject,
    });
  }, [layer, tileMatrixSet, dataUrl, dataType, update, styleObject]);

  return null;
}

DynamicSource.displayName = "DynamicSource";

export default DynamicSource;
