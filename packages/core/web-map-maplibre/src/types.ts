import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";

export type { StyleSpecification };

export interface DefaultStyleOptions {
  color: string;
  opacity: number;
  circleRadius: number;
  circleMinZoom: number;
  circleMaxZoom: number;
  lineWidth: number;
  lineMinZoom: number;
  lineMaxZoom: number;
  fillOpacity: number;
  outlineWidth: number;
  polygonMinZoom: number;
  polygonMaxZoom: number;
}

export type GeometryType = "points" | "lines" | "polygons";

export type PopupMode = "HOVER_ID" | "CLICK_PROPERTIES";

export interface FeatureTitles {
  [featureId: string]: string;
}
