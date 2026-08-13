import {
  Camera,
  CesiumTerrainProvider,
  Credit,
  ImageryLayer,
  Ion,
  IonResource,
  Rectangle,
  WebMapTileServiceImageryProvider,
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import type { CesiumMapOptions } from "./types";

/**
 * Mirrors ldproxy's ogcapi-html `Cesium` component. `Ion.defaultAccessToken` and
 * `Camera.DEFAULT_VIEW_RECTANGLE`/`DEFAULT_VIEW_FACTOR` are mutated here because
 * they're global statics on the Cesium API itself, not per-viewer state.
 *
 * Async because `CesiumTerrainProvider.fromUrl`/`IonResource.fromAssetId` are
 * promise-based in current `@cesium/engine` - the original's synchronous
 * `new CesiumTerrainProvider({ url, ... })` no longer exists.
 */
export async function createViewer(
  container: string | HTMLElement,
  options: CesiumMapOptions,
): Promise<Viewer> {
  const { backgroundUrl, attribution, extent, accessToken, terrainProvider } =
    options;

  Ion.defaultAccessToken = accessToken ?? "";

  if (extent) {
    Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(
      extent.minLon,
      extent.minLat,
      extent.maxLon,
      extent.maxLat,
    );
    Camera.DEFAULT_VIEW_FACTOR = 0;
  }

  const baseLayer = new ImageryLayer(
    new WebMapTileServiceImageryProvider({
      url: backgroundUrl,
      layer: "Base",
      style: "default",
      tileMatrixSetID: "WebMercatorQuad",
    }),
  );

  let viewer: Viewer;
  if (terrainProvider) {
    const { url, credit, ...rest } = terrainProvider;
    viewer = new Viewer(container, {
      baseLayer,
      terrainProvider: await CesiumTerrainProvider.fromUrl(
        url ?? (await IonResource.fromAssetId(1)),
        {
          ...rest,
          credit: credit ? new Credit(credit, true) : undefined,
        },
      ),
      animation: false,
      baseLayerPicker: false,
      homeButton: false,
      geocoder: false,
      timeline: false,
      scene3DOnly: true,
      fullscreenButton: false,
      navigationInstructionsInitiallyVisible: false,
    });
  } else {
    viewer = new Viewer(container, {
      baseLayer,
      animation: false,
      baseLayerPicker: false,
      homeButton: true,
      geocoder: false,
      timeline: false,
      scene3DOnly: true,
      fullscreenButton: false,
      navigationInstructionsInitiallyVisible: false,
    });
  }

  if (attribution) {
    viewer.creditDisplay.addStaticCredit(new Credit(attribution));
  }

  return viewer;
}
