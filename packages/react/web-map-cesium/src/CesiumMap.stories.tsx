import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import CesiumMap from "./CesiumMap";
import { measureNextRenderedFrame } from "./renderedPixels";

// Cesium needs its Workers/Assets/ThirdParty static files served separately and
// `window.CESIUM_BASE_URL` set before any Viewer is created - consuming apps are
// responsible for this themselves (see the package README). Here we point at the
// prebuilt static assets shipped by the unified `cesium` npm package on unpkg,
// version-matched to this repo's `@cesium/engine`/`@cesium/widgets` dependency.
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}
window.CESIUM_BASE_URL = "https://unpkg.com/cesium@1.144.0/Build/Cesium/";

// Real dataset from the ldproxy demo deployment: "3D Buildings in Cologne (LoD2)".
const BACKGROUND_URL =
  "https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{TileMatrix}/{TileRow}/{TileCol}.png";
const ATTRIBUTION = "Geobasis NRW | &copy; basemap.de / BKG";

// Tells a failed imagery check apart: tiles never arrived, arrived with an error
// status, or arrived fine but were not painted.
function describeBackgroundTileResponses() {
  const backgroundHost = new URL(BACKGROUND_URL.split("{")[0]).host;
  const countByStatus = new Map<number, number>();
  for (const entry of performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[]) {
    if (new URL(entry.name).host !== backgroundHost) continue;
    const status = entry.responseStatus;
    countByStatus.set(status, (countByStatus.get(status) ?? 0) + 1);
  }
  const summary = [...countByStatus]
    .map(([status, count]) => `${count}x HTTP ${status || "unknown"}`)
    .join(", ");
  return summary || "none";
}

// No `?f=json` here (unlike a typical ldproxy format-negotiation URL): Cesium's
// `Resource` propagates the tileset URL's query parameters onto every derived
// subresource request (subtrees, tile content) - harmless for e.g. an auth
// token, but ldproxy's `.subtree` endpoint 400s if `f=json` rides along. The
// bare URL still negotiates to JSON by default (via `Accept`), so it's dropped.
const TILESET_URL =
  "https://demo.ldproxy.net/cologne_lod2/collections/building/3dtiles";
const STYLE_URL =
  "https://demo.ldproxy.net/cologne_lod2/collections/building/styles/surface-type?f=3dtiles";

function CesiumMapDemo() {
  return (
    <div style={{ height: "65vh", width: "100%" }}>
      <CesiumMap
        backgroundUrl={BACKGROUND_URL}
        attribution={ATTRIBUTION}
        accessToken={null}
        tileset={{ url: TILESET_URL }}
        additionalStyleUrl={STYLE_URL}
      />
    </div>
  );
}

const meta = {
  title: "web-map-cesium/CesiumMap",
  component: CesiumMapDemo,
} satisfies Meta<typeof CesiumMapDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BuildingsTileset: Story = {
  play: async ({ canvasElement, step }) => {
    await step("globe renders with a background layer", async () => {
      await waitFor(
        () => expect(canvasElement.querySelector("canvas")).not.toBeNull(),
        { timeout: 20000 },
      );
    });

    await step("the background imagery is actually painted", async () => {
      // Sky and atmosphere gradients alone paint 100-170 colours, so a low bar would
      // pass without any imagery. With imagery the view settles at ~800 colours.
      await waitFor(
        async () => {
          const canvas = canvasElement.querySelector("canvas");
          if (!canvas) throw new Error("map canvas not rendered");
          const stats = await measureNextRenderedFrame(canvas);
          await expect(
            stats.distinctColours,
            `painted colours (background tile responses: ${describeBackgroundTileResponses()})`,
          ).toBeGreaterThan(300);
        },
        { timeout: 25000, interval: 1000 },
      );
    });
  },
};
