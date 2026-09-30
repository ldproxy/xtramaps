import { useMap } from "@vis.gl/react-maplibre";
import * as maplibregl from "maplibre-gl";
import type { ReactElement } from "react";
import { cloneElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface CanvasOverlayInjectedProps {
  map: maplibregl.Map;
  maplibre: typeof maplibregl;
}

export interface CanvasOverlayProps {
  children: ReactElement<Partial<CanvasOverlayInjectedProps>>;
}

function CanvasOverlay({ children }: CanvasOverlayProps) {
  const { current: mapRef } = useMap();
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef) return;

    const canvas = mapRef.getMap().getCanvasContainer();
    const el = document.createElement("div");
    el.className = "canvas-container";
    canvas.appendChild(el);
    setWrapper(el);

    return () => {
      canvas.removeChild(el);
    };
  }, [mapRef]);

  if (!wrapper || !mapRef) {
    return null;
  }

  const childrenWithMap = cloneElement(children, {
    map: mapRef.getMap(),
    maplibre: maplibregl,
  });

  return createPortal(childrenWithMap, wrapper);
}

CanvasOverlay.displayName = "CanvasOverlay";

export default CanvasOverlay;
