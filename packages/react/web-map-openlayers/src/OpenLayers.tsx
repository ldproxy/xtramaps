import type {
  OpenLayersStyle,
  TileMatrixSet,
} from "@xtramaps/web-map-openlayers";
import {
  computeInitialView,
  getRasterBackgroundAndAttributions,
  setupProjections,
} from "@xtramaps/web-map-openlayers";
import type { FeatureLike } from "ol/Feature";
import { MVT } from "ol/format";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { RFeatureUIEvent } from "rlayers";
import { RControl, RLayerTile, RLayerVectorTile, RMap } from "rlayers";
import DynamicSource from "./DynamicSource";
import DynamicView from "./DynamicView";

import "ol/ol.css";
import "./custom.css";

setupProjections();

const DEFAULT_BACKGROUND_URL =
  "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

interface StyleConfig {
  center?: [number, number];
  zoom?: number;
  bounds?: [number, number, number, number];
  styleObject?: OpenLayersStyle;
  backgroundId?: string;
  backgroundUrl?: string;
  attributions?: string;
}

export interface OpenLayersRef {
  /** Switches the active TileMatrixSet - replaces the old `globalThis._map.setCurrentTileMatrixSet` bridge. */
  setCurrentTileMatrixSet: (tileMatrixSet: string) => void;
}

export interface OpenLayersProps {
  backgroundUrl?: string;
  attribution?: string;
  bounds?: [[number, number], [number, number]] | null;
  dataUrl?: string | null;
  dataType?: "raster" | "vector" | null;
  tileMatrixSets?: TileMatrixSet[];
  styleUrl?: string | null;
}

const OpenLayers = forwardRef<OpenLayersRef, OpenLayersProps>(
  function OpenLayers(
    {
      backgroundUrl = DEFAULT_BACKGROUND_URL,
      attribution = DEFAULT_ATTRIBUTION,
      bounds = null,
      dataUrl = null,
      dataType = null,
      tileMatrixSets = [],
      styleUrl = null,
    },
    ref,
  ) {
    const effectiveStyleUrl = styleUrl?.trim() ? styleUrl : null;

    const [currentFeature, setCurrentFeature] = useState<FeatureLike | null>(
      null,
    );
    const [currentTileMatrixSet, setCurrentTileMatrixSet] = useState<
      string | null
    >(tileMatrixSets[0] ? tileMatrixSets[0].tileMatrixSet : null);
    const [styleConfig, setStyleConfig] = useState<StyleConfig | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        setCurrentTileMatrixSet: (tms: string) => {
          setStyleConfig(null);
          setCurrentTileMatrixSet(tms);
        },
      }),
      [],
    );

    const onPointerEnter = useCallback(
      (e: RFeatureUIEvent<FeatureLike>) => setCurrentFeature(e.target),
      [],
    );
    const onPointerLeave = useCallback(
      (e: RFeatureUIEvent<FeatureLike>) => {
        if (currentFeature === e.target) {
          setCurrentFeature(null);
        }
      },
      [currentFeature],
    );

    useEffect(() => {
      if (effectiveStyleUrl && currentTileMatrixSet) {
        let updatedStyleUrl = effectiveStyleUrl;
        if (currentTileMatrixSet !== "WebMercatorQuad") {
          updatedStyleUrl = `${effectiveStyleUrl}${
            effectiveStyleUrl.includes("?") ? "&" : "?"
          }tile-matrix-set=${currentTileMatrixSet}`;
        }
        fetch(updatedStyleUrl)
          .then((response) => response.json())
          .then((style: OpenLayersStyle) => {
            const config: StyleConfig = {
              center: style.center,
              zoom: style.zoom,
              styleObject: style,
            };
            if (style.sources) {
              const sourceWithBounds = Object.values(style.sources).find(
                (s) => s.bounds,
              );
              if (sourceWithBounds?.bounds) {
                config.bounds = sourceWithBounds.bounds;
              }
            }

            const {
              rasterBackgroundId,
              rasterBackgroundUrl,
              combinedAttribution,
            } = getRasterBackgroundAndAttributions(style);
            if (rasterBackgroundId) config.backgroundId = rasterBackgroundId;
            if (rasterBackgroundUrl) config.backgroundUrl = rasterBackgroundUrl;
            if (combinedAttribution) config.attributions = combinedAttribution;

            setStyleConfig(config);
          })
          .catch((error) => {
            console.error(
              "[OpenLayers] Failed to load style configuration:",
              error,
            );
            setStyleConfig({});
          });
      }
    }, [effectiveStyleUrl, currentTileMatrixSet]);

    const prevTMSRef = useRef<string | null>(null);
    useEffect(() => {
      // only update previous TMS if style is not used or style is already loaded
      if (!effectiveStyleUrl || styleConfig) {
        prevTMSRef.current = currentTileMatrixSet;
      }
    }, [currentTileMatrixSet, effectiveStyleUrl, styleConfig]);
    const previousTileMatrixSet = prevTMSRef.current;

    // Wait until style is loaded if styleUrl is provided
    if (effectiveStyleUrl && !styleConfig) {
      return null;
    }

    const baseUrl = backgroundUrl.indexOf("{s}")
      ? backgroundUrl.replace(/\{s\}/, "{a-c}")
      : backgroundUrl;

    const tms =
      tileMatrixSets.find((t) => t.tileMatrixSet === currentTileMatrixSet) ??
      null;

    const initial = computeInitialView({
      effectiveStyleUrl,
      styleConfig,
      tileMatrixSets,
      currentTileMatrixSet,
      bounds,
    });

    const backgroundTms = (
      styleConfig?.styleObject?.metadata?.["ldproxy:tileMatrixSets"] as
        | Record<string, string>
        | undefined
    )?.[styleConfig?.backgroundId ?? ""];
    const applyTmsToBackground =
      Boolean(backgroundTms) && backgroundTms !== "WebMercatorQuad";

    const update = previousTileMatrixSet !== currentTileMatrixSet;

    return (
      <>
        {initial && (
          <RMap width="100%" height="100%" initial={initial} noDefaultControls>
            <DynamicView tileMatrixSet={tms} update={update} />
            <RLayerTile
              properties={{ label: "Base map" }}
              url={styleConfig?.backgroundUrl || baseUrl}
              attributions={styleConfig?.attributions || attribution}
            >
              {applyTmsToBackground && (
                <DynamicSource
                  tileMatrixSet={tms}
                  dataUrl={styleConfig?.backgroundUrl || baseUrl}
                  dataType="raster"
                  update={update}
                />
              )}
            </RLayerTile>
            {dataType === "raster" && dataUrl && (
              <RLayerTile properties={{ label: "Vector tiles" }} url={dataUrl}>
                <DynamicSource
                  tileMatrixSet={tms}
                  dataUrl={dataUrl}
                  dataType={dataType}
                  styleObject={styleConfig?.styleObject}
                  update={update}
                />
              </RLayerTile>
            )}
            {dataType === "vector" && dataUrl && (
              <RLayerVectorTile
                properties={{ label: "Vector tiles" }}
                url={dataUrl}
                format={new MVT()}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
              >
                <DynamicSource
                  tileMatrixSet={tms}
                  dataUrl={dataUrl}
                  dataType={dataType}
                  styleObject={styleConfig?.styleObject}
                  update={update}
                />
              </RLayerVectorTile>
            )}
            <RControl.RZoom />
            <RControl.RAttribution collapsible={false} />
          </RMap>
        )}
        <div id="map-info" style={{ opacity: currentFeature === null ? 0 : 1 }}>
          {currentFeature &&
            JSON.stringify(
              { id: currentFeature.getId(), ...currentFeature.getProperties() },
              null,
              2,
            )}
        </div>
      </>
    );
  },
);

OpenLayers.displayName = "OpenLayers";

export default OpenLayers;
