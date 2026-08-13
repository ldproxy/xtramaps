import turfBbox from "@turf/bbox";
import type { Feature, FeatureCollection, GeoJSON, Polygon } from "geojson";

export type Bounds2D = [number, number, number, number];

export const getBounds = (geojson: GeoJSON): Bounds2D =>
  turfBbox(geojson) as Bounds2D;

export const idProperty = "__id";

export const isCollection = (geojson: GeoJSON): geojson is FeatureCollection =>
  geojson.type === "FeatureCollection";

const featureWithIdAsProperty = (feature: Feature): Feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    [idProperty]: feature.id,
  },
});

export const getFeaturesWithIdAsProperty = (geojson: GeoJSON): GeoJSON =>
  isCollection(geojson)
    ? {
        ...geojson,
        features: geojson.features.map(featureWithIdAsProperty),
      }
    : featureWithIdAsProperty(geojson as Feature);

export const polygonFromBounds = (
  bounds: [[number, number], [number, number]],
): Feature<Polygon> => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]],
        [bounds[0][0], bounds[1][1]],
        [bounds[0][0], bounds[0][1]],
      ],
    ],
  },
  properties: {},
});
