import { Map as MapLibreGlMap } from "@vis.gl/react-maplibre";
import type {
  DefaultStyleOptions,
  FeatureTitles,
  PopupMode,
  StyleSpecification,
} from "@xtramaps/web-map-maplibre";
import {
  polygonFromBounds,
  resolveWireframeBaseStyle,
} from "@xtramaps/web-map-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Configuration, { type CustomCallback } from "./Configuration";
import "./custom.css";

const DEFAULT_BACKGROUND_URL =
  "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const DEFAULT_FIT_BOUNDS_OPTIONS = {
  padding: 30,
  maxZoom: 16,
  animate: false,
};

export interface MapLibreProps {
  styleUrl?: string | null;
  removeZoomLevelConstraints?: boolean;
  backgroundUrl?: string;
  attribution?: string;
  center?: [number, number];
  zoom?: number;
  bounds?: [[number, number], [number, number]] | null;
  dataUrl?: string | null;
  dataType?: "geojson" | "vector" | "raster";
  dataLayers?: Record<string, string[]>;
  interactive?: boolean;
  savePosition?: boolean;
  drawBounds?: boolean;
  defaultStyle?: Partial<DefaultStyleOptions>;
  fitBoundsOptions?: {
    padding?: number;
    maxZoom?: number;
    animate?: boolean;
  };
  popup?: PopupMode | null;
  featureTitles?: FeatureTitles;
  custom?: CustomCallback | null;
  showCompass?: boolean;
  children?: ReactNode;
}

function MapLibre({
  styleUrl = null,
  removeZoomLevelConstraints = false,
  backgroundUrl = DEFAULT_BACKGROUND_URL,
  center = [0, 0],
  zoom = 0,
  bounds = null,
  attribution = DEFAULT_ATTRIBUTION,
  dataUrl = null,
  dataType = "geojson",
  dataLayers = {},
  interactive = true,
  savePosition = false,
  drawBounds = false,
  defaultStyle,
  fitBoundsOptions = DEFAULT_FIT_BOUNDS_OPTIONS,
  popup = null,
  featureTitles = {},
  custom = null,
  showCompass = true,
  children,
}: MapLibreProps) {
  const [style, setStyle] = useState<StyleSpecification | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (styleUrl) {
      // Fetched and applied here (React state -> the `mapStyle` prop below) rather than
      // imperatively via map.setStyle() from within Configuration: @vis.gl/react-maplibre's
      // Map wrapper owns the source cache bookkeeping through its own managed `mapStyle`
      // update path, and setting the style outside of that leaves the wrapper unaware of the
      // change - vector sources get registered (map.getStyle() shows them fine) but never
      // actually start loading tiles (isSourceLoaded stays false forever, no tile requests).
      fetch(styleUrl)
        .then((response) => response.json())
        .then((fetchedStyle: StyleSpecification) => {
          if (!cancelled) {
            setStyle(fetchedStyle);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    resolveWireframeBaseStyle({
      backgroundUrl,
      attribution,
      defaultUrl: DEFAULT_BACKGROUND_URL,
      defaultAttribution: DEFAULT_ATTRIBUTION,
    }).then((nextStyle) => {
      if (!cancelled) {
        setStyle(nextStyle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [styleUrl, backgroundUrl, attribution]);

  const data = drawBounds && bounds ? polygonFromBounds(bounds) : dataUrl;

  if (!style) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    );
  }

  return (
    <MapLibreGlMap
      mapStyle={style}
      initialViewState={{
        longitude: center[0],
        latitude: center[1],
        zoom,
        bounds: bounds ?? undefined,
        fitBoundsOptions,
      }}
      style={{
        height: "100%",
        width: "100%",
      }}
      attributionControl={false}
      interactive={interactive}
      hash={savePosition}
    >
      <Configuration
        styleUrl={styleUrl}
        removeZoomLevelConstraints={removeZoomLevelConstraints}
        data={data ?? undefined}
        dataType={dataType}
        dataLayers={dataLayers}
        controls={interactive}
        showCompass={showCompass}
        defaultStyle={defaultStyle}
        fitBounds={!drawBounds && Boolean(bounds)}
        popup={popup}
        featureTitles={featureTitles}
        custom={custom}
      />
      {children}
    </MapLibreGlMap>
  );
}

MapLibre.displayName = "MapLibre";

export default MapLibre;
