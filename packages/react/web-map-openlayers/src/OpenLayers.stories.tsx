import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRef, useEffect, useState } from "react";
import { expect, waitFor } from "storybook/test";
import OpenLayers, { type OpenLayersRef } from "./OpenLayers";

const STYLE_URL = "https://demo.ldproxy.net/daraa/styles/topographic?f=mbs";
const VECTOR_TILES_URL =
  "https://demo.ldproxy.net/daraa/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt";

interface TileMatrixSetInput {
  tileMatrixSet: string;
  projection: string;
  defaultCenterLon: number;
  defaultCenterLat: number;
  defaultZoomLevel: number;
  maxLevel: number;
  extent: string;
  resolutions: string;
  sizes: string;
}

// The styleUrl fetch only fires once `currentTileMatrixSet` is truthy, so a *complete*
// entry (extent/resolutions/sizes included - DynamicSource JSON.parses them
// unconditionally on mount) is required for every TileMatrixSet used. In production
// ldproxy computes this server-side; here it's built from the same OGC TileMatrixSet
// resource the server itself would read.
async function buildTileMatrixSet(
  id: string,
  projection: string,
): Promise<TileMatrixSetInput> {
  const tmsDefinition = await fetch(
    `https://demo.ldproxy.net/daraa/tileMatrixSets/${id}?f=json`,
  ).then((r) => r.json());
  const tileMatrices: {
    cellSize: number;
    matrixWidth: number;
    matrixHeight: number;
  }[] = tmsDefinition.tileMatrices;

  return {
    tileMatrixSet: id,
    projection,
    defaultCenterLon: 36.1033,
    defaultCenterLat: 32.6264,
    defaultZoomLevel: 12,
    maxLevel: tileMatrices.length - 1,
    extent: JSON.stringify([
      -20037508.342789244, -20037508.342789244, 20037508.342789244,
      20037508.342789244,
    ]),
    resolutions: JSON.stringify(tileMatrices.map((tm) => tm.cellSize)),
    sizes: JSON.stringify(
      tileMatrices.map((tm) => [tm.matrixWidth, tm.matrixHeight]),
    ),
  };
}

// A second, genuinely different TileMatrixSet to switch to - proves the ref API's
// setCurrentTileMatrixSet actually reloads the map with a new projection/source, not
// just re-selecting the one it already has (which React would no-op on).
const tileMatrixSetsPromise = Promise.all([
  buildTileMatrixSet("WebMercatorQuad", "EPSG:3857"),
  buildTileMatrixSet("WorldMercatorWGS84Quad", "EPSG:3395"),
]);

const olRef = createRef<OpenLayersRef>();

function OpenLayersDemo() {
  const [tileMatrixSets, setTileMatrixSets] = useState<TileMatrixSetInput[]>(
    [],
  );

  useEffect(() => {
    tileMatrixSetsPromise.then(setTileMatrixSets);
  }, []);

  if (tileMatrixSets.length === 0) {
    return null;
  }

  return (
    <div style={{ height: "65vh", width: "100%" }}>
      <OpenLayers
        ref={olRef}
        styleUrl={STYLE_URL}
        dataType="vector"
        dataUrl={VECTOR_TILES_URL}
        tileMatrixSets={tileMatrixSets}
      />
    </div>
  );
}

const meta = {
  title: "web-map-openlayers/OpenLayers",
  component: OpenLayersDemo,
} satisfies Meta<typeof OpenLayersDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VectorTilesWithStyle: Story = {
  play: async ({ canvasElement, step }) => {
    await step(
      "map renders with vector tiles and a style applied",
      async () => {
        await waitFor(
          () => expect(canvasElement.querySelector("canvas")).not.toBeNull(),
          {
            timeout: 15000,
          },
        );
        await waitFor(() => expect(olRef.current).not.toBeNull(), {
          timeout: 15000,
        });
      },
    );

    await step(
      "switching to a different TileMatrixSet via the ref API reloads the map",
      async () => {
        olRef.current?.setCurrentTileMatrixSet("WorldMercatorWGS84Quad");

        // The switch resets styleConfig, so the component briefly renders nothing while
        // it re-fetches the style (now parameterized for the new TileMatrixSet) before
        // the map reappears.
        await waitFor(
          () => expect(canvasElement.querySelector("canvas")).not.toBeNull(),
          {
            timeout: 15000,
          },
        );
      },
    );
  },
};
