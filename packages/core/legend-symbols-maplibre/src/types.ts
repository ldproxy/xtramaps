export interface SymbolTree {
  element: string;
  attributes: Record<string, unknown>;
  children?: SymbolTree[];
}

export type ExprFunction = (
  layer: MapLibreLayer,
  type: "paint" | "layout",
  prop: string,
) => unknown;

export interface ImageResult {
  url?: string;
  dimensions?: { width: number; height: number };
}

export type ImageFunction = (imgKey: string) => ImageResult;

export interface SymbolHandlerProps {
  layer: MapLibreLayer;
  expr: ExprFunction;
  image: ImageFunction;
}

export interface SpriteDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelRatio: number;
}

export interface SpriteEntry {
  json: PromiseSettledResult<Record<string, SpriteDimensions>>;
  image: PromiseSettledResult<HTMLImageElement>;
}

export interface SpriteData {
  json: Record<string, SpriteDimensions>;
  image: HTMLImageElement;
  sprites?: SpriteEntry[];
}

export interface LegendSymbolProps {
  sprite?: SpriteData;
  zoom: number;
  layer: MapLibreLayer;
  properties?: Record<string, unknown>;
}

export interface MapLibreLayer {
  type: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TransformRequestResult {
  url: string;
  headers?: HeadersInit;
}

export interface LoadOptions {
  transformRequest: (url: string) => TransformRequestResult;
}

export interface MapImageManager {
  style: {
    imageManager: {
      images: Record<
        string,
        {
          data: {
            width: number;
            height: number;
            data: Uint8ClampedArray | number[];
          };
        }
      >;
    };
  };
}

export type CancellablePromise<T> = Promise<T> & { cancel: () => void };
