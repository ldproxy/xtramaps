import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CanvasOverlayInjectedProps } from "@xtramaps/web-map-maplibre-react";
import MapLibre, { CanvasOverlay } from "@xtramaps/web-map-maplibre-react";
import "@xtramaps/web-map-maplibre-react/dist/index.css";
import type { Map as MaplibreMap } from "maplibre-gl";
import { expect, waitFor, within } from "storybook/test";

const STYLE_URL = "https://demo.ldproxy.net/daraa/styles/topographic?f=mbs";

// An inline `data:` URI instead of a live endpoint - this story is a regression test for the
// `defaultStyle` merge logic itself, not for network/remote-data handling, so it shouldn't
// depend on an external server's availability. `fetch()` resolves `data:` URIs natively, so
// this still exercises the exact same `dataUrl` -> fetch -> addData() code path as a real URL.
const INLINE_POLYGON_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: 1,
      properties: { name: "Test polygon" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.6, 49.6],
            [6.62, 49.6],
            [6.62, 49.62],
            [6.6, 49.62],
            [6.6, 49.6],
          ],
        ],
      },
    },
  ],
};
const INLINE_POLYGON_DATA_URL = `data:application/json,${encodeURIComponent(
  JSON.stringify(INLINE_POLYGON_GEOJSON),
)}`;

// Without an explicit `backgroundUrl`, MapLibre falls back to a real OpenStreetMap raster
// tile server for the wireframe background - and `map.isStyleLoaded()` (which the component's
// `runWhenStyleLoaded` guard waits on) only resolves once every source's *currently visible
// tiles* have loaded too, not just once the style spec itself is set. That made this story
// flaky in sandboxed/restricted-network test runs, unrelated to the actual thing under test
// (the `defaultStyle` merge). An empty, sourceless style removes that dependency entirely -
// nothing to fetch, so `isStyleLoaded()` resolves immediately.
const EMPTY_BASEMAP_STYLE_URL = `data:application/json,${encodeURIComponent(
  JSON.stringify({ version: 8, sources: {}, layers: [] }),
)}`;

// Captured via MapLibre's `custom` escape hatch so play functions can assert on the real
// maplibre-gl Map instance - `Configuration` itself renders nothing, so there is no other DOM
// output to query.
let capturedMap: MaplibreMap | null = null;

const meta = {
  title: "web-map-maplibre/MapLibre",
  component: MapLibre,
} satisfies Meta<typeof MapLibre>;

export default meta;

type Story = StoryObj<typeof meta>;

// Regression test for a real bug found during the maplibre-gl 2.x -> 6.x upgrade: Java emits
// unset optional style fields (e.g. `polygonMaxZoom`) as the literal value `undefined`, not as
// an absent key. A naive `{...DEFAULT_STYLE, ...defaultStyle}` spread still copies that
// `undefined` straight over DEFAULT_STYLE's real default, and maplibre-gl then silently
// refuses to add the layer at all (minzoom/maxzoom: undefined). `polygonMaxZoom` below is
// deliberately passed as `undefined` - mirroring the exact Java payload shape - so this keeps
// failing loudly if the merge regresses.
export const GeoJsonDataWithDefaultStyleMerge: Story = {
  render: () => (
    <MapLibre
      dataUrl={INLINE_POLYGON_DATA_URL}
      dataType="geojson"
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      center={[6.6, 49.6]}
      zoom={11}
      defaultStyle={{
        color: "#ff3300",
        fillOpacity: 0.6,
        polygonMinZoom: 5,
        polygonMaxZoom: undefined,
      }}
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ step }) => {
    await step(
      "map instance is captured and the polygons layer gets added",
      async () => {
        await waitFor(() => expect(capturedMap).not.toBeNull(), {
          timeout: 15000,
        });
        await waitFor(
          () => expect(capturedMap?.getLayer("polygons")).toBeDefined(),
          { timeout: 15000 },
        );
      },
    );

    await step("explicit defaultStyle fields are applied", async () => {
      await expect(
        capturedMap?.getPaintProperty("polygons", "fill-color"),
      ).toBe("#ff3300");
      await expect(
        capturedMap?.getPaintProperty("polygons", "fill-opacity"),
      ).toBe(0.6);
      await expect(capturedMap?.getLayer("polygons")?.minzoom).toBe(5);
    });

    await step(
      "an explicit `undefined` field falls back to DEFAULT_STYLE's own default instead of breaking the layer",
      async () => {
        // Before the fix this was `undefined` and the "polygons" layer never got added at all
        // (the first step above would already have failed to find it).
        await expect(capturedMap?.getLayer("polygons")?.maxzoom).toBe(24);
      },
    );
  },
};

// Regression test for a second real bug from the same upgrade: `Configuration` used to call
// map.addSource/addLayer (and the popup wiring below) before the map's own style had finished
// loading, throwing "Style is not done loading". Also doubles as a health check for
// maplibre-gl's worker file (maplibre-gl-worker.mjs, loaded via a relative import.meta.url path
// bundlers can't statically discover) - if that file is missing or 404s, vector tiles never
// render and queryRenderedFeatures() stays empty forever.
export const StyleUrlRendersVectorTilesWithPopup: Story = {
  render: () => (
    <MapLibre
      styleUrl={STYLE_URL}
      center={[36.1, 32.62]}
      zoom={13}
      popup="HOVER_ID"
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ step }) => {
    await step(
      "style loads and popup wiring runs without throwing",
      async () => {
        await waitFor(() => expect(capturedMap).not.toBeNull(), {
          timeout: 15000,
        });
        await waitFor(() => expect(capturedMap?.isStyleLoaded()).toBe(true), {
          timeout: 15000,
        });
      },
    );

    await step(
      "vector tiles actually render (i.e. the worker file loaded correctly)",
      async () => {
        await waitFor(
          () =>
            expect(capturedMap?.queryRenderedFeatures().length).toBeGreaterThan(
              0,
            ),
          { timeout: 20000 },
        );
      },
    );
  },
};

// A hovering user is the whole point of `popup="HOVER_ID"` - the previous story only proved
// the wiring doesn't throw, not that a real hover actually surfaces the configured feature
// title. `map.fire()` drives the exact same internal, layer-filtered listener a real mouse
// event would (maplibre-gl queries rendered features at the event's `point` itself), so this
// is a faithful simulation, not a mock of the popup logic.
export const HoverPopupShowsFeatureTitle: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      dataUrl={INLINE_POLYGON_DATA_URL}
      dataType="geojson"
      center={[6.61, 49.61]}
      zoom={11}
      popup="HOVER_ID"
      featureTitles={{ "1": "My Test Feature" }}
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("map and polygon layer are ready", async () => {
      await waitFor(() => expect(capturedMap).not.toBeNull(), {
        timeout: 15000,
      });
      await waitFor(
        () => expect(capturedMap?.getLayer("polygons")).toBeDefined(),
        { timeout: 15000 },
      );
    });

    await step(
      "hovering the polygon shows a popup with the configured feature title",
      async () => {
        const map = capturedMap;
        if (!map) throw new Error("map was not captured");
        const point = map.project([6.61, 49.61]);

        // `getLayer` only proves the style *definition* was added, not that a frame has
        // actually been painted yet - querying/firing too early finds nothing at `point`.
        // Re-firing on every poll (instead of once, up front) makes this robust to that race
        // instead of depending on incidental timing.
        await waitFor(
          () => {
            map.fire("mousemove", { point, lngLat: map.unproject(point) });
            expect(canvas.getByText("My Test Feature")).toBeInTheDocument();
          },
          { timeout: 15000 },
        );
      },
    );
  },
};

// `popup="CLICK_PROPERTIES"` is a genuinely separate code path from HOVER_ID above - a
// map-wide (not layer-filtered) click listener that does its own `queryRenderedFeatures` and
// renders a properties table (`showPopupProps`/`featureHtml`) instead of a plain title.
export const ClickPopupShowsFeaturePropertiesTable: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      dataUrl={INLINE_POLYGON_DATA_URL}
      dataType="geojson"
      center={[6.61, 49.61]}
      zoom={11}
      popup="CLICK_PROPERTIES"
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("map and polygon layer are ready", async () => {
      await waitFor(() => expect(capturedMap).not.toBeNull(), {
        timeout: 15000,
      });
      await waitFor(
        () => expect(capturedMap?.getLayer("polygons")).toBeDefined(),
        { timeout: 15000 },
      );
    });

    await step(
      "clicking the polygon shows a popup with its properties table",
      async () => {
        const map = capturedMap;
        if (!map) throw new Error("map was not captured");
        const point = map.project([6.61, 49.61]);

        // Wait for an actual painted frame at `point` first, then fire exactly once - unlike
        // the hover story's synchronous handler (which de-dupes on lngLat), showPopupProps
        // resolves its content via a `.then()` chain with no such guard, so re-firing on every
        // poll (as the hover story does) stacks up overlapping popup renders instead of settling.
        await waitFor(
          () =>
            expect(
              map.queryRenderedFeatures(point, { layers: ["polygons"] }).length,
            ).toBeGreaterThan(0),
          { timeout: 15000 },
        );

        map.fire("click", { point, lngLat: map.unproject(point) });

        await waitFor(
          () => expect(canvas.getByText("Test polygon")).toBeInTheDocument(),
          { timeout: 10000 },
        );
      },
    );
  },
};

// Vector/raster `dataType`s take a completely different branch in `addData()` than the
// GeoJSON default-style path above (a plain tile-URL source instead of a fetch + geoJsonLayers
// merge) - never exercised by any story so far. The tile URL itself is fake/unreachable on
// purpose: `map.addSource`/`addLayer` register synchronously and don't need tiles to actually
// load for that.
export const VectorDataTypeAddsLayersPerDataLayer: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      center={[6.61, 49.61]}
      zoom={11}
      dataUrl="https://example.invalid/tiles/{z}/{x}/{y}.pbf"
      dataType="vector"
      dataLayers={{ myLayer: ["polygons"] }}
      defaultStyle={{ color: "#00ff00", fillOpacity: 0.4 }}
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ step }) => {
    await step(
      "the vector source and one layer per dataLayers entry get added",
      async () => {
        await waitFor(() => expect(capturedMap).not.toBeNull(), {
          timeout: 15000,
        });
        await waitFor(
          () => expect(capturedMap?.getSource("data")).toBeDefined(),
          {
            timeout: 15000,
          },
        );
        await waitFor(
          () => expect(capturedMap?.getLayer("myLayer_polygons")).toBeDefined(),
          { timeout: 15000 },
        );
        await waitFor(
          () =>
            expect(
              capturedMap?.getLayer("myLayer_polygons-outline"),
            ).toBeDefined(),
          { timeout: 15000 },
        );
      },
    );

    await step("defaultStyle applies to vector layers too", async () => {
      await expect(
        capturedMap?.getPaintProperty("myLayer_polygons", "fill-color"),
      ).toBe("#00ff00");
    });
  },
};

export const RasterDataTypeAddsRasterLayer: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      center={[6.61, 49.61]}
      zoom={11}
      dataUrl="https://example.invalid/tiles/{z}/{x}/{y}.png"
      dataType="raster"
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ step }) => {
    await step("the raster source and its single layer get added", async () => {
      await waitFor(() => expect(capturedMap).not.toBeNull(), {
        timeout: 15000,
      });
      await waitFor(
        () => expect(capturedMap?.getSource("data")).toBeDefined(),
        {
          timeout: 15000,
        },
      );
      await waitFor(() => expect(capturedMap?.getLayer("data")).toBeDefined(), {
        timeout: 15000,
      });
      await expect(capturedMap?.getLayer("data")?.type).toBe("raster");
    });
  },
};

// `drawBounds` takes a third, separate route into the exact same default-style geojson layers
// (`polygonFromBounds(bounds)` fed through the identical `addData` call as the plain GeoJSON
// story above) - and it flips `fitBounds` off in `MapLibre.tsx` (`fitBounds={!drawBounds &&
// Boolean(bounds)}`), which is easy to get backwards in a refactor. Asserting the zoom stays
// put (rather than jumping toward fitBoundsOptions' maxZoom) catches exactly that regression.
export const DrawBoundsRendersStaticBboxOutline: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      center={[6.61, 49.61]}
      zoom={11}
      drawBounds
      bounds={[
        [6.6, 49.6],
        [6.62, 49.62],
      ]}
      custom={(map) => {
        capturedMap = map;
      }}
    />
  ),
  play: async ({ step }) => {
    await step(
      "the bounds are rendered as polygon outline layers, not left as raw data",
      async () => {
        await waitFor(() => expect(capturedMap).not.toBeNull(), {
          timeout: 15000,
        });
        await waitFor(
          () => expect(capturedMap?.getLayer("polygons")).toBeDefined(),
          { timeout: 15000 },
        );
        await waitFor(
          () => expect(capturedMap?.getLayer("polygons-outline")).toBeDefined(),
          { timeout: 15000 },
        );
      },
    );

    await step(
      "addData does not trigger a second, redundant fitBounds while drawing bounds",
      async () => {
        // Passing `bounds` always makes @vis.gl/react-maplibre fit the camera once at mount
        // (via `initialViewState.bounds`, animate: false - settles immediately). What
        // `fitBounds={!drawBounds && Boolean(bounds)}` actually guards against is `addData`
        // calling `map.fitBounds()` a *second* time with different options (padding: 50,
        // duration: 500) - which would keep the camera animating for another ~500ms. Confirm
        // the map has gone idle and then stays put, instead of drifting further.
        const map = capturedMap;
        if (!map) throw new Error("map was not captured");
        await waitFor(() => expect(map.isMoving()).toBe(false), {
          timeout: 5000,
        });
        const zoomAfterInitialFit = map.getZoom();

        await new Promise((resolve) => {
          setTimeout(resolve, 700);
        });
        await expect(map.getZoom()).toBe(zoomAfterInitialFit);
      },
    );
  },
};

function CanvasOverlayProbe({
  map,
  maplibre,
}: Partial<CanvasOverlayInjectedProps>) {
  return (
    <div data-testid="overlay-probe">
      {map && maplibre ? "ready" : "not-ready"}
    </div>
  );
}

// `CanvasOverlay`/`CanvasPlugin` is the portal ldproxy's own bbox-drawing UI (Resizer/handles,
// which lives outside this repo) mounts into - it never got any coverage of its own here. This
// checks the two things that would silently break every consumer of it: the child actually
// gets portaled into the map's canvas container (not just rendered anywhere), and it really
// receives a live `map`/`maplibre` instance, not stale/undefined props.
export const CanvasOverlayPortalsChildIntoMapCanvas: Story = {
  render: () => (
    <MapLibre
      backgroundUrl={EMPTY_BASEMAP_STYLE_URL}
      center={[6.61, 49.61]}
      zoom={11}
    >
      <CanvasOverlay>
        <CanvasOverlayProbe />
      </CanvasOverlay>
    </MapLibre>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "the overlay child is portaled into the map's canvas container with live map/maplibre props",
      async () => {
        const probe = await canvas.findByTestId(
          "overlay-probe",
          {},
          {
            timeout: 15000,
          },
        );
        await expect(probe).toHaveTextContent("ready");
        await expect(probe.closest(".canvas-container")).not.toBeNull();
      },
    );
  },
};
