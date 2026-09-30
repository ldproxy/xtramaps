export interface CesiumExtent {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface CesiumTerrainHeightDifference {
  difference: number;
  centerLon: number;
  centerLat: number;
  centerHeight: number;
}

export interface CesiumTilesetConfig {
  url: string;
  terrainHeightDifference?: CesiumTerrainHeightDifference;
  outlineColor?: string;
}

export interface CesiumTerrainProviderConfig {
  url?: string;
  credit?: string;
  requestVertexNormals?: boolean;
}

export interface CesiumMapOptions {
  backgroundUrl: string;
  attribution?: string;
  extent?: CesiumExtent;
  accessToken?: string | null;
  tileset?: CesiumTilesetConfig;
  terrainProvider?: CesiumTerrainProviderConfig;
  additionalStyleUrl?: string;
}
