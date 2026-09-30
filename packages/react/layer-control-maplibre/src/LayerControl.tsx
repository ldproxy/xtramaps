import { useControl, useMap } from "@vis.gl/react-maplibre";
import type { LayerControlEntry } from "@xtramaps/layer-control-maplibre";
import type { IControl } from "maplibre-gl";
import { useRef } from "react";
import { createPortal } from "react-dom";
import Control from "./Control";

export interface LayerControlProps {
  opened?: boolean;
  onlyLegend?: boolean;
  preferStyle?: boolean;
  entries?: LayerControlEntry[];
}

function LayerControl({
  opened = false,
  onlyLegend = false,
  preferStyle = true,
  entries = [],
}: LayerControlProps) {
  const { current: mapRef } = useMap();
  const containerRef = useRef<HTMLDivElement | null>(null);
  if (!containerRef.current) {
    containerRef.current = document.createElement("div");
  }
  const container = containerRef.current;

  useControl<IControl>(
    () => ({
      onAdd: () => container,
      onRemove: () => {
        container.parentNode?.removeChild(container);
      },
    }),
    { position: "top-left" },
  );

  if (!mapRef) {
    return null;
  }

  const map = mapRef.getMap();

  return createPortal(
    <Control
      opened={opened}
      onlyLegend={onlyLegend}
      preferStyle={preferStyle}
      entries={entries}
      map={map}
      maxHeight={map.getContainer().offsetHeight * 0.75}
    />,
    container,
  );
}

LayerControl.displayName = "LayerControl";

export default LayerControl;
