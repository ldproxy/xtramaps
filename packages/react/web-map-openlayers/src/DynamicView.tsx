import type { TileMatrixSet } from "@xtramaps/web-map-openlayers";
import { setDynamicView } from "@xtramaps/web-map-openlayers";
import { useEffect } from "react";
import { useOL } from "rlayers";

export interface DynamicViewProps {
  tileMatrixSet?: TileMatrixSet | null;
  update?: boolean;
}

function DynamicView({
  tileMatrixSet = null,
  update = false,
}: DynamicViewProps) {
  const { map } = useOL();

  useEffect(() => {
    setDynamicView(map, tileMatrixSet, update);
  }, [map, tileMatrixSet, update]);

  return null;
}

DynamicView.displayName = "DynamicView";

export default DynamicView;
