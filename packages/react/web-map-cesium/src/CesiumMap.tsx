import type { Viewer } from "@cesium/widgets";
import type { CesiumMapOptions } from "@xtramaps/web-map-cesium";
import { createViewer, loadTileset } from "@xtramaps/web-map-cesium";
import { useEffect, useRef } from "react";

// The original ported this as ~19 individual widget CSS imports, with a comment
// that the aggregate `widgets.css` "does not work because of relative engine
// import" under the old webpack build. That relative import (crossing from
// @cesium/widgets/Source into @cesium/engine/Source) resolves correctly under
// this repo's Vite build (verified via a full production build + browser
// check), so the single aggregate import is used here instead.
import "@cesium/widgets/Source/widgets.css";
import "./custom.css";

export interface CesiumMapProps extends CesiumMapOptions {}

export function CesiumMap(props: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mounted once, matching the original's single page-lifetime mount - Cesium never had a dynamic prop-update path (unlike the OpenLayers/MapLibre TMS-switching equivalents)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let viewer: Viewer | undefined;

    createViewer(container, props)
      .then((createdViewer) => {
        if (cancelled) {
          createdViewer.destroy();
          return;
        }
        viewer = createdViewer;
        if (props.tileset?.url) {
          loadTileset(createdViewer, props.tileset, props.additionalStyleUrl);
        }
      })
      .catch((error) => {
        console.error("[web-map-cesium-react] Failed to create viewer:", error);
      });

    return () => {
      cancelled = true;
      viewer?.destroy();
    };
  }, []);

  return <div ref={containerRef} className="cesium-map-container" />;
}

CesiumMap.displayName = "CesiumMap";

export default CesiumMap;
