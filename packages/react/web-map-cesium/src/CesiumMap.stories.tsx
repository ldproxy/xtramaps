import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import CesiumMap from "./CesiumMap";

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

// Real dataset from ldproxy's own demo deployment - "3D Buildings in Cologne
// (LoD2)" - the same one the original ogcapi-html Cesium component was built to
// render (`FeaturesView`/`TilesetView`'s glTF-from-features and Tiles3D paths).
const BACKGROUND_URL =
  "https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{TileMatrix}/{TileRow}/{TileCol}.png";
const ATTRIBUTION = "Geobasis NRW | &copy; basemap.de / BKG";
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
  },
};
