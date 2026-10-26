import type { Viewer } from "@cesium/widgets";
import type { CesiumMapOptions } from "@xtramaps/web-map-cesium";
import { createViewer, loadTileset } from "@xtramaps/web-map-cesium";
import { useEffect, useRef } from "react";

// The aggregate `widgets.css` imports engine styles via a relative path crossing from
// @cesium/widgets/Source into @cesium/engine/Source; Vite resolves that correctly, so
// the single import replaces importing each widget stylesheet.
import "@cesium/widgets/Source/widgets.css";
import "./custom.css";

export interface CesiumMapProps extends CesiumMapOptions {}

export function CesiumMap(props: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mounted once; there is no prop-update path for the Cesium viewer
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
