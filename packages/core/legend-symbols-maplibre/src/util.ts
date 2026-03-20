import {
  expression,
  latest,
  type StyleSpecification,
  function as styleFunction,
} from "@maplibre/maplibre-gl-style-spec";
import type {
  CancellablePromise,
  ExprFunction,
  LoadOptions,
  MapImageManager,
  SpriteData,
  SpriteDimensions,
} from "./types";

export function camelCase(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.assign(
    {},
    ...Object.keys(obj).map((key) => {
      const camelCased = key.includes("-")
        ? key.replace(/-[a-z]/g, (g) => g[1].toUpperCase())
        : key;
      return { [camelCased]: obj[key] };
    }),
  );
}

export function CSSstring(string: string): Record<string, unknown> {
  const cssJson = `{"${string
    .replace(/;$/, "")
    .replace(/;/g, '", "')
    .replace(/: /g, '": "')}"}`;
  const obj = JSON.parse(cssJson);

  return camelCase(obj);
}

const PROP_MAP: [string, string?][] = [
  ["background"],
  ["circle"],
  ["fill-extrusion"],
  ["fill"],
  ["heatmap"],
  ["hillshade"],
  ["line"],
  ["raster"],
  ["icon", "symbol"],
  ["text", "symbol"],
];

export function exprHandler({
  zoom,
  properties,
}: {
  zoom: number;
  properties?: Record<string, unknown>;
}): ExprFunction {
  function prefixFromProp(prop: string): string | null {
    const out = PROP_MAP.find((def) => {
      const type = def[0];
      return prop.startsWith(type);
    });
    return out ? out[1] || out[0] : null;
  }

  return (layer, type, prop) => {
    const prefix = prefixFromProp(prop);
    const specKey = `${type}_${prefix}` as keyof typeof latest;
    const specGroup = latest[specKey] as Record<
      string,
      { default: unknown; type?: string }
    >;
    const specItem = specGroup[prop];
    const dflt = specItem.default;

    if (!layer[type]) {
      return dflt;
    }

    const layerGroup = layer[type] as Record<string, unknown>;
    const input = layerGroup[prop];

    const objType = typeof input;
    if (objType === "undefined") {
      return specItem.default;
    }
    if (typeof input === "object") {
      let expr: { evaluate?: (...args: unknown[]) => unknown };
      if (Array.isArray(input)) {
        if (specItem.type === "array") {
          return input;
        }
        expr = expression.createExpression(input).value as typeof expr;
      } else {
        expr = styleFunction.createFunction(
          input,
          specItem as Parameters<typeof styleFunction.createFunction>[1],
        ) as typeof expr;
      }
      if (!expr.evaluate) {
        return null;
      }
      const result = expr.evaluate({ zoom }, { properties }) as
        | { name?: string }
        | string
        | number
        | null;
      if (result) {
        return typeof result === "object" && "name" in result
          ? result.name
          : result;
      }
      return null;
    }
    return input;
  };
}

export function mapImageToDataURL(
  map: MapImageManager,
  icon: string | undefined,
): string | undefined {
  if (!icon) {
    return undefined;
  }

  const image = map.style.imageManager.images[icon];
  if (!image) {
    return undefined;
  }

  const canvasEl = document.createElement("canvas");
  canvasEl.width = image.data.width;
  canvasEl.height = image.data.height;
  const ctx = canvasEl.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2d context");
  ctx.putImageData(
    new ImageData(
      Uint8ClampedArray.from(image.data.data),
      image.data.width,
      image.data.height,
    ),
    0,
    0,
  );

  return canvasEl.toDataURL();
}

const dataStore = new Map<string, { value: unknown; count: number }>();
export const cache = {
  add: (key: string, value: unknown) => {
    if (dataStore.has(key)) {
      throw new Error(`Cache already contains '${key}'`);
    }
    dataStore.set(key, {
      value,
      count: 1,
    });
  },
  fetch: (key: string): unknown => {
    const cacheObj = dataStore.get(key);
    if (cacheObj) {
      cacheObj.count += 1;
      return cacheObj.value;
    }
    return null;
  },
  release: (key: string) => {
    const cacheObj = dataStore.get(key);
    if (!cacheObj) {
      throw new Error(`No such key in cache '${key}'`);
    }
    cacheObj.count -= 1;

    if (cacheObj.count === 0) {
      dataStore.delete(key);
    }
  },
};

function loadImageViaTag(url: string): CancellablePromise<HTMLImageElement> {
  let cancelled = false;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      if (!cancelled) resolve(img);
    };
    img.onerror = (e) => {
      if (!cancelled) reject(e);
    };
    img.src = url;
  }) as CancellablePromise<HTMLImageElement>;
  promise.cancel = () => {
    cancelled = true;
  };
  return promise;
}

function removeUrl(obj: Record<string, unknown>): Record<string, unknown> {
  const obj2 = { ...obj };
  delete obj2.url;
  return obj2;
}

function loadImageViaFetch(
  url: string,
  init: RequestInit,
): CancellablePromise<HTMLImageElement> {
  return fetch(url, init)
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob))
    .then((url2) =>
      loadImageViaTag(url2),
    ) as CancellablePromise<HTMLImageElement>;
}

export function loadImage(
  url: string,
  { transformRequest }: LoadOptions,
): CancellablePromise<HTMLImageElement> {
  const fetchObj = { ...transformRequest(url) } as Record<string, unknown>;

  if (fetchObj.headers) {
    return loadImageViaFetch(url, removeUrl(fetchObj) as RequestInit);
  }
  return loadImageViaTag(url);
}

export function loadJson(
  url: string,
  { transformRequest }: LoadOptions,
): Promise<unknown> {
  const fetchObj = { ...transformRequest(url) };
  return fetch(
    fetchObj.url,
    removeUrl(fetchObj as unknown as Record<string, unknown>) as RequestInit,
  ).then((res) => res.json());
}

export const loadSprites = async (
  style: StyleSpecification,
): Promise<SpriteData | undefined> => {
  if (style.sprite) {
    const multipleSprites = Array.isArray(style.sprite);

    if (multipleSprites) {
      return loadMultipleSprites(style.sprite as { id: string; url: string }[]);
    }
    return loadSprite(style.sprite as string);
  }
  return undefined;
};

const loadSprite = async (url: string): Promise<SpriteData | undefined> => {
  const [image, json] = await Promise.all([
    loadSpriteImage(`${url}@2x.png`),
    loadSpriteJson(`${url}@2x.json`),
  ]);

  return {
    image,
    json,
  };
};

const loadMultipleSprites = async (
  sprites: { id: string; url: string }[],
): Promise<SpriteData | undefined> => {
  const loadedSprites = await Promise.all(
    sprites.map((sprite) =>
      Promise.allSettled([
        loadSpriteImage(`${sprite.url}@2x.png`),
        loadSpriteJson(`${sprite.url}@2x.json`),
      ]).then(([image, json]) => ({
        id: sprite.id,
        image: image as PromiseFulfilledResult<HTMLImageElement>,
        json: json as PromiseFulfilledResult<Record<string, SpriteDimensions>>,
      })),
    ),
  );

  const mergedJson: Record<string, SpriteDimensions> = {};

  loadedSprites.forEach((sprite) => {
    if (sprite.json.status === "fulfilled") {
      Object.assign(mergedJson, sprite.json.value);
    }
  });

  // first image as fallback for compatibility, but main.js will search through sprites if available
  const firstImage = (
    loadedSprites.find((sprite) => sprite.image.status === "fulfilled")
      ?.image as PromiseFulfilledResult<HTMLImageElement>
  ).value;

  return {
    image: firstImage,
    json: mergedJson,
    sprites: loadedSprites,
  };
};

type ImagePromise = Promise<HTMLImageElement> & { cancel?: () => void };

const loadSpriteImage = async (url: string): Promise<HTMLImageElement> => {
  let cancelled = false;
  const promise: ImagePromise = new Promise<HTMLImageElement>(
    (resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        if (!cancelled) resolve(img);
      };
      img.onerror = (e) => {
        if (!cancelled) reject(e);
      };
      img.src = url;
    },
  );
  promise.cancel = () => {
    cancelled = true;
  };
  return promise;
};

const loadSpriteJson = async (
  url: string,
): Promise<Record<string, SpriteDimensions>> => {
  return fetch(url).then((res) => res.json());
};
