import {
  Cartesian3,
  Cesium3DTileStyle,
  Cesium3DTileset,
  Color,
  Matrix4,
} from "@cesium/engine";
import type { Viewer } from "@cesium/widgets";
import type { CesiumTilesetConfig } from "./types";

/**
 * Loads a 3D Tileset into `viewer`, ported from ldproxy's ogcapi-html `Cesium`
 * component. Unlike the original (fire-and-forget, no `.catch`), failures are
 * logged instead of failing silently - a reusable component can be mounted
 * more than once and shouldn't leave an unhandled rejection behind.
 */
export async function loadTileset(
  viewer: Viewer,
  config: CesiumTilesetConfig,
  additionalStyleUrl?: string,
): Promise<void> {
  const { url, terrainHeightDifference, outlineColor } = config;

  const options: Cesium3DTileset.ConstructorOptions = {
    outlineColor: outlineColor
      ? (Color[outlineColor as keyof typeof Color] as Color)
      : Color.DIMGREY,
  };

  if (terrainHeightDifference) {
    const { difference, centerLon, centerLat, centerHeight } =
      terrainHeightDifference;
    options.modelMatrix = Matrix4.fromTranslation(
      Cartesian3.subtract(
        Cartesian3.fromRadians(centerLon, centerLat, centerHeight + difference),
        Cartesian3.fromRadians(centerLon, centerLat, centerHeight),
        new Cartesian3(),
      ),
    );
  }

  try {
    const tileset = await Cesium3DTileset.fromUrl(url, options);

    if (additionalStyleUrl) {
      const style = await fetch(additionalStyleUrl).then((response) =>
        response.json(),
      );
      tileset.style = new Cesium3DTileStyle(style);
    } else {
      tileset.style = new Cesium3DTileStyle({});
    }

    viewer.scene.primitives.add(tileset);
    viewer.flyTo(tileset);
  } catch (error) {
    console.error("[web-map-cesium] Failed to load tileset:", error);
  }
}
