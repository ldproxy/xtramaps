import type { Map as MaplibreMap } from "maplibre-gl";

export interface RenderedPixelStats {
  distinctColours: number;
  /** Share of pixels whose colour differs from the single most common one. */
  nonDominantShare: number;
}

// Quantising to 4 bits per channel keeps anti-aliasing noise from inflating the
// colour count of an otherwise empty map.
function quantisedColourKey(pixels: Uint8ClampedArray, offset: number) {
  return (
    ((pixels[offset] >> 4) << 8) |
    ((pixels[offset + 1] >> 4) << 4) |
    (pixels[offset + 2] >> 4)
  );
}

function measurePixels(canvas: HTMLCanvasElement): RenderedPixelStats {
  const copy = new OffscreenCanvas(canvas.width, canvas.height);
  const context = copy.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");
  context.drawImage(canvas, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

  const pixelCountByColour = new Map<number, number>();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const key = quantisedColourKey(pixels, offset);
    pixelCountByColour.set(key, (pixelCountByColour.get(key) ?? 0) + 1);
  }
  const pixelCount = pixels.length / 4;
  const dominantPixelCount = Math.max(...pixelCountByColour.values());

  return {
    distinctColours: pixelCountByColour.size,
    nonDominantShare: (pixelCount - dominantPixelCount) / pixelCount,
  };
}

/**
 * Measures the next frame MapLibre paints. The WebGL drawing buffer is only readable
 * inside the frame that rendered it (no `preserveDrawingBuffer`), and the `render`
 * event fires synchronously right after painting, before the browser clears it.
 */
export function measureNextRenderedFrame(
  map: MaplibreMap,
): Promise<RenderedPixelStats> {
  return new Promise((resolve, reject) => {
    map.once("render", () => {
      try {
        resolve(measurePixels(map.getCanvas()));
      } catch (error) {
        reject(error);
      }
    });
    map.triggerRepaint();
  });
}
