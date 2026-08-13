import type { Meta, StoryObj } from "@storybook/react-vite";
import MapLibre from "@xtramaps/web-map-maplibre-react";
import "@xtramaps/web-map-maplibre-react/dist/index.css";
import type { Map as MaplibreMap } from "maplibre-gl";
import { expect, userEvent, waitFor, within } from "storybook/test";
import LayerControl from "./LayerControl";

const STYLE_URL = "https://demo.ldproxy.net/daraa/styles/topographic?f=mbs";

// Real layer ids from the Daraa "topographic" style, structured to exercise every entry
// kind LayerControl supports - mirrors the layerGroupControl example from the original
// ogcapi-html MapLibre/stories.jsx. preferStyle is disabled so these entries are used
// deterministically instead of the style's own embedded "ldproxy:layerControl" metadata.
const entries = [
  {
    id: "outer",
    label: "Overview",
    type: "group" as const,
    entries: [
      {
        id: "Railway",
        type: "merge-group" as const,
        entries: [
          { id: "transportationgroundcrv.0a" },
          { id: "transportationgroundcrv.0b" },
        ],
      },
      {
        id: "Hydro",
        label: "Hydrography",
        type: "group" as const,
        entries: ["hydrographycrv", { id: "hydrographysrf" }],
      },
    ],
  },
  {
    id: "Basemap",
    label: "Basemap (radio)",
    type: "radio-group" as const,
    entries: ["utilityinfrastructurepnt", { id: "agriculturesrf" }],
  },
  {
    id: "Transportation",
    type: "merge-group" as const,
    sourceLayer: "TransportationGroundCrv",
  },
  {
    id: "Settlement",
    type: "merge-group" as const,
    sourceLayer: "SettlementSrf",
  },
  "militarysrf",
];

// Captured via MapLibre's `custom` escape hatch so the play function can assert on the
// real maplibre-gl Map instance, not just the LayerControl's own DOM/checkbox state.
let capturedMap: MaplibreMap | null = null;

function LayerControlDemo() {
  return (
    <MapLibre
      styleUrl={STYLE_URL}
      center={[36.1, 32.62]}
      zoom={13}
      custom={(map) => {
        capturedMap = map;
      }}
    >
      <LayerControl entries={entries} preferStyle={false} opened />
    </MapLibre>
  );
}

const meta = {
  title: "layer-control-maplibre/LayerControl",
  component: LayerControlDemo,
} satisfies Meta<typeof LayerControlDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NestedGroups: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    let militaryLabel: HTMLElement;

    await step(
      "layer control panel renders the configured entries",
      async () => {
        await canvas.findByText("Basemap (radio)", {}, { timeout: 15000 });
        militaryLabel = await canvas.findByText(
          "militarysrf",
          {},
          { timeout: 15000 },
        );
      },
    );

    await step("toggling a layer checkbox unchecks it", async () => {
      const checkbox = militaryLabel
        .closest("label")
        ?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      await expect(checkbox).not.toBeNull();
      await expect(checkbox).toBeChecked();

      await userEvent.click(checkbox as HTMLInputElement);
      await expect(checkbox).not.toBeChecked();
    });

    await step(
      "unchecking the checkbox actually hides the layer on the map",
      async () => {
        await waitFor(() => expect(capturedMap).not.toBeNull());
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("militarysrf", "visibility"),
          ).toBe("none"),
        );
      },
    );
  },
};
