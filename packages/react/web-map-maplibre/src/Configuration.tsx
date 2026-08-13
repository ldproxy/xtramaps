import MapboxDraw from "@mapbox/mapbox-gl-draw";
import combine from "@turf/combine";
import { useMap } from "@vis.gl/react-maplibre";
import type {
  DefaultStyleOptions,
  FeatureTitles,
  PopupMode,
} from "@xtramaps/web-map-maplibre";
import { addData, setStyleVector } from "@xtramaps/web-map-maplibre";
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
    if (data) {
      const style = {
        ...DEFAULT_STYLE,
        ...defaultStyle,
      };

      if (dataType === "geojson" && typeof data === "string") {
        fetch(data)
          .then((response) => response.json())
          .then((json: GeoJSON) => {
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
            );
          });
      } else {
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
        );
      }
    } else if (styleUrl) {
      setStyleVector(map, styleUrl, removeZoomLevelConstraints, popup);
    }
    if (custom) {
      custom(map, maplibregl, MapboxDraw, { combine });
    }
  }, [mapRef]);

  return null;
}

Configuration.displayName = "MapLibreConfiguration";

export default Configuration;
