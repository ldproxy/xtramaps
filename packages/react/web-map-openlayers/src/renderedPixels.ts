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

function measurePixels(image: ImageBitmap): RenderedPixelStats {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, image.width, image.height).data;

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
 * Measures what the browser actually shows for `element`, via a real screenshot.
 * Reading the OpenLayers canvas directly is not an option: the base map's tiles are
 * loaded without CORS, which taints the canvas against `getImageData`.
 *
 * Returns `null` when the story runs in the Storybook UI rather than under Vitest,
 * where screenshots are unavailable.
 */
export async function screenshotPixelStats(
  element: Element,
): Promise<RenderedPixelStats | null> {
  let page: typeof import("vitest/browser").page;
  try {
    ({ page } = await import("vitest/browser"));
  } catch {
    return null;
  }
  const base64Png = await page.screenshot({ element, save: false });
  const png = await fetch(`data:image/png;base64,${base64Png}`).then(
    (response) => response.blob(),
  );
  return measurePixels(await createImageBitmap(png));
}
