import type { GeoJSON } from "geojson";
import type { Map as MaplibreMap } from "maplibre-gl";
import { getBounds, getFeaturesWithIdAsProperty, idProperty } from "./geojson";
import { addPopup, addPopupProps } from "./popup";
import {
  geoJsonLayers,
  hoverLayers,
  isDataLayer,
  vectorLayers,
} from "./styles";
import type {
  DefaultStyleOptions,
  FeatureTitles,
  PopupMode,
  StyleSpecification,
} from "./types";

export const setStyleGeoJson = (
  map: MaplibreMap,
  styleUrl: string,
  removeZoomLevelConstraints: boolean,
  popup: PopupMode | null | undefined,
  featureTitles: FeatureTitles,
): void => {
  fetch(styleUrl)
    .then((response) => response.json())
    .then((style: StyleSpecification) => {
      let baseStyle: Partial<StyleSpecification> = { sources: {} };
      try {
        baseStyle = map.getStyle() as StyleSpecification;
      } catch {
        // ignore
      }
      const dataStyle: StyleSpecification = {
        ...style,
        sources: {
          ...style.sources,
          ...baseStyle.sources,
        },
        layers: style.layers.map((layer) => {
          if (isDataLayer(layer)) {
            const newLayer = {
              ...layer,
              source: "data",
            };
            delete (newLayer as Record<string, unknown>)["source-layer"];
            if (removeZoomLevelConstraints) {
              delete newLayer.minzoom;
              delete newLayer.maxzoom;
            }
            return newLayer;
          }

          return layer;
        }),
      };

      const dataSource = dataStyle.sources.data;
      if (dataSource && "attribution" in dataSource) {
        dataSource.attribution = style.layers
          .filter(isDataLayer)
          .map(
            (layer) =>
              (
                style.sources[layer.source] as
                  | { attribution?: string }
                  | undefined
              )?.attribution,
          )
          .filter((attribution): attribution is string => Boolean(attribution))
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(" | ");
      }

      delete (dataStyle as Record<string, unknown>).terrain;

      map.setStyle(dataStyle, { diff: false });

      if (popup === "HOVER_ID") {
        addPopup(
          map,
          featureTitles,
          dataStyle.layers
            .filter((layer) => isDataLayer(layer) === true)
            .map((layer) => layer.id),
        );
      }
    });
};

export const setStyleVector = (
  map: MaplibreMap,
  styleUrl: string,
  removeZoomLevelConstraints: boolean,
  popup: PopupMode | null | undefined,
  sourceUrl?: string,
  sourceLayers: string[] = [],
): void => {
  fetch(styleUrl)
    .then((response) => response.json())
    .then((style: StyleSpecification) => {
      let baseStyle: Partial<StyleSpecification> = { sources: {} };
      try {
        baseStyle = map.getStyle() as StyleSpecification;
      } catch {
        // ignore
      }
      let dataStyle: StyleSpecification = style;

      if (sourceUrl) {
        const newSources: StyleSpecification["sources"] = {};
        Object.keys(style.sources).forEach((source) => {
          const sourceSpec = style.sources[source];
          if (sourceSpec.type === "vector") {
            newSources[source] = {
              ...sourceSpec,
              tiles: [sourceUrl],
            };
          } else {
            newSources[source] = sourceSpec;
          }
        });

        dataStyle = {
          ...style,
          sources: {
            ...newSources,
            ...baseStyle.sources,
          },
          layers: style.layers
            .filter(
              (layer) =>
                !isDataLayer(layer) ||
                ("source-layer" in layer &&
                  layer["source-layer"] &&
                  (sourceLayers.length === 0 ||
                    sourceLayers.includes(layer["source-layer"]))),
            )
            .map((layer) => {
              // "vector" is a source type, not a layer type, so this never matches any
              // real layer - preserved 1:1 from the source implementation.
              if ((layer as { type: string }).type === "vector") {
                const newLayer = {
                  ...layer,
                };
                if (removeZoomLevelConstraints) {
                  delete newLayer.minzoom;
                  delete newLayer.maxzoom;
                }
                return newLayer;
              }
              return layer;
            }),
        };
      }

      map.setStyle(dataStyle, { diff: false });

      if (popup === "CLICK_PROPERTIES") {
        addPopupProps(
          map,
          dataStyle.layers
            .filter((layer) => isDataLayer(layer) === true)
            .map((layer) => layer.id),
        );
      }
    });
};

export const addData = (
  map: MaplibreMap,
  styleUrl: string | null | undefined,
  removeZoomLevelConstraints: boolean,
  data: GeoJSON | string,
  dataType: "geojson" | "vector" | "raster",
  dataLayers: Record<string, string[]>,
  defaultStyle: DefaultStyleOptions,
  fitBounds: boolean | undefined,
  popup: PopupMode | null | undefined,
  featureTitles: FeatureTitles,
): void => {
  if (dataType === "geojson") {
    const features = getFeaturesWithIdAsProperty(data as GeoJSON);

    map.addSource("data", {
      type: "geojson",
      data: features,
      promoteId: idProperty,
    });

    if (fitBounds) {
      const bounds = getBounds(data as GeoJSON);

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 16,
        duration: 500,
      });
    }

    if (styleUrl) {
      setStyleGeoJson(
        map,
        styleUrl,
        removeZoomLevelConstraints,
        popup,
        featureTitles,
      );
    } else {
      const defaultLayers = geoJsonLayers(defaultStyle);

      defaultLayers.forEach((layer) => {
        map.addLayer(layer);
      });

      if (popup === "HOVER_ID") {
        addPopup(map, featureTitles, hoverLayers);
      } else if (popup === "CLICK_PROPERTIES") {
        addPopupProps(
          map,
          defaultLayers.map((l) => l.id),
        );
      }
    }
  } else if (dataType === "vector") {
    if (styleUrl) {
      setStyleVector(
        map,
        styleUrl,
        removeZoomLevelConstraints,
        popup,
        data as string,
        Object.keys(dataLayers),
      );
    } else {
      map.addSource("data", {
        type: "vector",
        tiles: [data as string],
      });

      const layers = Object.keys(dataLayers).flatMap((layer) =>
        vectorLayers(
          layer,
          dataLayers[layer] as ("points" | "lines" | "polygons")[],
          defaultStyle,
        ),
      );

      layers.forEach((vectorLayer) => {
        map.addLayer(vectorLayer);
      });

      if (popup === "CLICK_PROPERTIES") {
        addPopupProps(
          map,
          layers.map((l) => l.id),
        );
      }
    }
  } else if (dataType === "raster") {
    map.addSource("data", {
      type: "raster",
      tiles: [data as string],
    });
    map.addLayer({
      id: "data",
      type: "raster",
      source: "data",
    });
  }
};
