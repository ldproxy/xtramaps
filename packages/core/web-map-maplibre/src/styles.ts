import type {
  BackgroundLayerSpecification,
  HillshadeLayerSpecification,
  LayerSpecification,
  RasterLayerSpecification,
} from "@maplibre/maplibre-gl-style-spec";
import type {
  DefaultStyleOptions,
  GeometryType,
  StyleSpecification,
} from "./types";

export type DataLayerSpecification = Exclude<
  LayerSpecification,
  | BackgroundLayerSpecification
  | RasterLayerSpecification
  | HillshadeLayerSpecification
>;

export const emptyStyle = (): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [],
});

const normalizedUrl = (url = "") => {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
};

const hasPlaceholder = (url: string, key: string) =>
  new RegExp(`\\{${key}\\}`, "i").test(url);

export const isRasterTileUrl = (url = ""): boolean => {
  const decoded = normalizedUrl(url);
  return (
    hasPlaceholder(decoded, "z") &&
    hasPlaceholder(decoded, "x") &&
    hasPlaceholder(decoded, "y")
  );
};

const getBaseAttribution = (
  url: string | null | undefined,
  attribution: string | undefined,
  defaultUrl: string,
  defaultAttribution: string,
): string | string[] =>
  url === defaultUrl && attribution !== defaultAttribution
    ? [attribution ?? "", defaultAttribution]
    : attribution || defaultAttribution;

const expandTileServers = (url: string): string[] =>
  url.indexOf("{s}") > -1 || url.indexOf("{a-c}") > -1
    ? ["a", "b", "c"].map((prefix) =>
        url.replace(/\{s\}/, prefix).replace(/\{a-c\}/, prefix),
      )
    : [url];

export const rasterBaseStyle = (
  url: string | null | undefined,
  attribution: string | undefined,
  defaultUrl: string,
  defaultAttribution: string,
): StyleSpecification => {
  const baseAttribution = getBaseAttribution(
    url,
    attribution,
    defaultUrl,
    defaultAttribution,
  );

  const finalUrl = url || defaultUrl;
  const servers = expandTileServers(finalUrl);

  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: servers,
        tileSize: 256,
        attribution: Array.isArray(baseAttribution)
          ? baseAttribution.join(" | ")
          : baseAttribution,
      },
    },
    layers: [
      {
        id: "background",
        type: "raster",
        source: "base",
      },
    ],
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isValidStyle = (style: unknown): style is StyleSpecification =>
  isObject(style) &&
  typeof style.version === "number" &&
  isObject(style.sources) &&
  Array.isArray(style.layers);

export const sanitizeBasemapStyle = (
  style: unknown,
): StyleSpecification | null => {
  if (!isValidStyle(style)) {
    return null;
  }

  return {
    ...style,
    version: style.version || 8,
    sources: style.sources || {},
    layers: style.layers || [],
  };
};

export const fetchBasemapStyle = async (
  url: string,
): Promise<StyleSpecification> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load basemap style: ${response.status}`);
  }
  const style = await response.json();
  const sanitizedStyle = sanitizeBasemapStyle(style);

  if (!sanitizedStyle) {
    throw new Error("Invalid basemap style");
  }

  return sanitizedStyle;
};

export interface ResolveWireframeBaseStyleOptions {
  backgroundUrl?: string;
  attribution?: string;
  defaultUrl: string;
  defaultAttribution: string;
}

export const resolveWireframeBaseStyle = async ({
  backgroundUrl,
  attribution,
  defaultUrl,
  defaultAttribution,
}: ResolveWireframeBaseStyleOptions): Promise<StyleSpecification> => {
  const finalUrl = backgroundUrl || defaultUrl;

  if (isRasterTileUrl(finalUrl)) {
    return rasterBaseStyle(
      backgroundUrl,
      attribution,
      defaultUrl,
      defaultAttribution,
    );
  }

  try {
    return await fetchBasemapStyle(finalUrl);
  } catch {
    return rasterBaseStyle(null, attribution, defaultUrl, defaultAttribution);
  }
};

// backward-compatible export name
export const baseStyle = rasterBaseStyle;

export const hoverLayers: GeometryType[] = ["points", "lines", "polygons"];

export const isDataLayer = (
  layer: LayerSpecification,
): layer is DataLayerSpecification => {
  switch (layer.type) {
    case "raster":
    case "hillshade":
    case "background":
      return false;
    default:
      return true;
  }
};

const circleLayers = (
  color: string,
  opacity: number,
  circleRadius: number,
  minZoom: number,
  maxZoom: number,
): LayerSpecification[] => [
  {
    id: "points",
    type: "circle",
    source: "data",
    paint: {
      "circle-color": color,
      "circle-opacity": opacity,
      "circle-radius": circleRadius,
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  },
];

const lineLayers = (
  color: string,
  opacity: number,
  lineWidth: number,
  minZoom: number,
  maxZoom: number,
): LayerSpecification[] => [
  {
    id: "lines",
    type: "line",
    source: "data",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": color,
      "line-opacity": opacity,
      "line-width": lineWidth,
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  },
];

const polygonLayers = (
  color: string,
  opacity: number,
  fillOpacity: number,
  outlineWidth: number,
  minZoom: number,
  maxZoom: number,
): LayerSpecification[] => [
  {
    id: "polygons",
    type: "fill",
    source: "data",
    paint: {
      "fill-color": color,
      "fill-opacity": fillOpacity,
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  },
  {
    id: "polygons-outline",
    type: "line",
    source: "data",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": color,
      "line-opacity": opacity,
      "line-width": outlineWidth,
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  },
];

const withFilter = (
  layers: LayerSpecification[],
  geometryType: string,
): LayerSpecification[] =>
  layers.map((layer) => ({
    ...layer,
    filter: ["==", "$type", geometryType],
  })) as LayerSpecification[];

export const geoJsonLayers = ({
  color,
  opacity,
  circleRadius,
  circleMinZoom,
  circleMaxZoom,
  lineWidth,
  lineMinZoom,
  lineMaxZoom,
  fillOpacity,
  outlineWidth,
  polygonMinZoom,
  polygonMaxZoom,
}: DefaultStyleOptions): LayerSpecification[] => {
  return ["Polygon", "LineString", "Point"].flatMap((geometryType) => {
    switch (geometryType) {
      case "Point":
        return withFilter(
          circleLayers(
            color,
            opacity,
            circleRadius,
            circleMinZoom,
            circleMaxZoom,
          ),
          geometryType,
        );
      case "LineString":
        return withFilter(
          lineLayers(color, opacity, lineWidth, lineMinZoom, lineMaxZoom),
          geometryType,
        );
      case "Polygon":
        return withFilter(
          polygonLayers(
            color,
            opacity,
            fillOpacity,
            outlineWidth,
            polygonMinZoom,
            polygonMaxZoom,
          ),
          geometryType,
        );
      default:
        return [];
    }
  });
};

const withSourceAndFilter = (
  layers: LayerSpecification[],
  source: string,
  geometryType: string,
): LayerSpecification[] =>
  layers.map((layer) => ({
    ...layer,
    id: `${source}_${layer.id}`,
    "source-layer": source,
    filter: ["==", "$type", geometryType],
  })) as LayerSpecification[];

export const vectorLayers = (
  source: string,
  geometryTypes: GeometryType[],
  {
    color,
    opacity,
    circleRadius,
    circleMinZoom,
    circleMaxZoom,
    lineWidth,
    lineMinZoom,
    lineMaxZoom,
    fillOpacity,
    outlineWidth,
    polygonMinZoom,
    polygonMaxZoom,
  }: DefaultStyleOptions,
): LayerSpecification[] =>
  geometryTypes.flatMap((geometryType) => {
    switch (geometryType) {
      case "points":
        return withSourceAndFilter(
          circleLayers(
            color,
            opacity,
            circleRadius,
            circleMinZoom,
            circleMaxZoom,
          ),
          source,
          "Point",
        );
      case "lines":
        return withSourceAndFilter(
          lineLayers(color, opacity, lineWidth, lineMinZoom, lineMaxZoom),
          source,
          "LineString",
        );
      case "polygons":
        return withSourceAndFilter(
          polygonLayers(
            color,
            opacity,
            fillOpacity,
            outlineWidth,
            polygonMinZoom,
            polygonMaxZoom,
          ),
          source,
          "Polygon",
        );
      default:
        return [];
    }
  });
