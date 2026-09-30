export interface TileMatrixSet {
  tileMatrixSet: string;
  projection?: string;
  defaultCenterLon: number;
  defaultCenterLat: number;
  defaultZoomLevel: number;
  maxLevel?: number;
  extent?: string;
  resolutions?: string;
  sizes?: string;
}

export interface OpenLayersStyleSource {
  type?: string;
  tiles?: string[];
  attribution?: string;
  bounds?: [number, number, number, number];
}

export interface OpenLayersStyleLayer {
  type?: string;
  source?: string;
}

export interface OpenLayersStyle {
  layers?: OpenLayersStyleLayer[];
  sources?: Record<string, OpenLayersStyleSource>;
  center?: [number, number];
  zoom?: number;
  bounds?: [number, number, number, number];
  metadata?: Record<string, unknown>;
}
