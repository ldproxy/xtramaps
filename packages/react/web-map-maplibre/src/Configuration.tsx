import MapboxDraw from "@mapbox/mapbox-gl-draw";
import combine from "@turf/combine";
import { useMap } from "@vis.gl/react-maplibre";
import type {
  DefaultStyleOptions,
  FeatureTitles,
  PopupMode,
} from "@xtramaps/web-map-maplibre";
import {
  addData,
  addPopup,
  addPopupProps,
  hoverLayers,
  isDataLayer,
} from "@xtramaps/web-map-maplibre";
import type { GeoJSON } from "geojson";
import * as maplibregl from "maplibre-gl";
import { useEffect } from "react";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const DEFAULT_STYLE: DefaultStyleOptions = {
  color: "#1D4E89",
  opacity: 1,
  circleRadius: 8,
  circleMinZoom: 0,
  circleMaxZoom: 24,
  lineWidth: 4,
  lineMinZoom: 0,
  lineMaxZoom: 24,
  fillOpacity: 0.2,
  outlineWidth: 2,
  polygonMinZoom: 0,
  polygonMaxZoom: 24,
};

export type CustomCallback = (
  map: maplibregl.Map,
  maplibre: typeof maplibregl,
  MapboxGlDraw: typeof MapboxDraw,
  turf: { combine: typeof combine },
) => void;

export interface ConfigurationProps {
  styleUrl?: string | null;
  removeZoomLevelConstraints?: boolean;
  data?: string | GeoJSON;
  dataType?: "geojson" | "vector" | "raster";
  dataLayers?: Record<string, string[]>;
  controls?: boolean;
  defaultStyle?: Partial<DefaultStyleOptions>;
  fitBounds?: boolean;
  popup?: PopupMode | null;
  featureTitles?: FeatureTitles;
  custom?: CustomCallback | null;
  showCompass?: boolean;
}

function Configuration({
  styleUrl = null,
  removeZoomLevelConstraints = false,
  data,
  dataType = "geojson",
  dataLayers = {},
  controls = true,
  defaultStyle,
  fitBounds = true,
  popup = null,
  featureTitles = {},
  custom = null,
  showCompass = true,
}: ConfigurationProps) {
  const { current: mapRef } = useMap();

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once when the map instance becomes available, matching the original useMaplibreUIEffect(..., []) semantics
  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();

    map.addControl(
      new maplibregl.AttributionControl({
        compact: false,
      }),
    );
    map.addControl(new maplibregl.ScaleControl());
    if (controls) {
      map.addControl(new maplibregl.NavigationControl({ showCompass }));
    }

    // Everything below touches sources/layers, which maplibre-gl refuses ("Style is not done
    // loading") if the map's own initial style hasn't finished loading yet - a race that isn't
    // guaranteed to lose even on a freshly-mounted map (it did, reliably, right up until an
    // unrelated change shifted the timing). Deferring until the style is loaded makes this
    // deterministic instead of relying on incidental slowness elsewhere to win the race.
    // Not isStyleLoaded()/"styledata": that also waits for all visible tiles, and "styledata"
    // may never fire again, so data was intermittently never added.
    const runWhenStyleLoaded = (fn: () => void) => {
      if (map.getStyle()) {
        fn();
      } else {
        map.once("style.load", fn);
      }
    };

    if (data) {
      // Java emits unset optional style fields (e.g. circleMinZoom) as the literal JS value
      // `undefined`, not as an absent key - a plain `{...DEFAULT_STYLE, ...defaultStyle}` spread
      // still copies those `undefined`s over DEFAULT_STYLE's real numbers, so every layer ends
      // up with minzoom/maxzoom: undefined and maplibre-gl silently refuses to add it.
      const style = { ...DEFAULT_STYLE };
      (
        Object.keys(defaultStyle ?? {}) as (keyof DefaultStyleOptions)[]
      ).forEach((key) => {
        const value = defaultStyle?.[key];
        if (value !== undefined) {
          (style as Record<keyof DefaultStyleOptions, unknown>)[key] = value;
        }
      });

      if (dataType === "geojson" && typeof data === "string") {
        fetch(data)
          .then((response) => response.json())
          .then((json: GeoJSON) => {
            runWhenStyleLoaded(() =>
              addData(
                map,
                styleUrl,
                removeZoomLevelConstraints,
                json,
                dataType,
                dataLayers,
                style,
                fitBounds,
                popup,
                featureTitles,
              ),
            );
          });
      } else {
        runWhenStyleLoaded(() =>
          addData(
            map,
            styleUrl,
            false,
            data,
            dataType,
            dataLayers,
            style,
            fitBounds,
            popup,
            featureTitles,
          ),
        );
      }
    } else if (styleUrl && popup) {
      // The style itself is already applied via MapLibre's `mapStyle` prop (see MapLibre.tsx) -
      // setting it imperatively here instead used to leave @vis.gl/react-maplibre's own source
      // cache bookkeeping out of sync, so vector sources were registered but never actually
      // started loading tiles. Only popup wiring for the style's own layers is left to do here.
      runWhenStyleLoaded(() => {
        if (popup === "HOVER_ID") {
          addPopup(map, featureTitles, hoverLayers);
        } else if (popup === "CLICK_PROPERTIES") {
          const dataLayerIds = (map.getStyle()?.layers ?? [])
            .filter((layer) => isDataLayer(layer) === true)
            .map((layer) => layer.id);
          addPopupProps(map, dataLayerIds);
        }
      });
    }
    if (custom) {
      runWhenStyleLoaded(() =>
        custom(map, maplibregl, MapboxDraw, { combine }),
      );
    }
  }, [mapRef]);

  return null;
}

Configuration.displayName = "MapLibreConfiguration";

export default Configuration;
