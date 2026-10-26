import type { Meta, StoryObj } from "@storybook/react-vite";
import MapLibre from "@xtramaps/web-map-maplibre-react";
import "@xtramaps/web-map-maplibre-react/dist/index.css";
// LayerControl is built on reactstrap and expects the host app to bring Bootstrap CSS
// (as ogcapi-html does) - without it <Collapse> never actually hides anything.
import "bootstrap/dist/css/bootstrap.min.css";
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

/** Finds the checkbox/radio input associated with a visible label's text. */
async function findInputByText(
  canvas: ReturnType<typeof within>,
  text: string,
): Promise<HTMLInputElement> {
  const label = await canvas.findByText(text, {}, { timeout: 15000 });
  const input = label.closest("label")?.querySelector("input");
  await expect(input).not.toBeNull();
  return input as HTMLInputElement;
}

export const NestedGroups: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "layer control panel renders the configured entries",
      async () => {
        await canvas.findByText("Basemap (radio)", {}, { timeout: 15000 });
        await canvas.findByText("militarysrf", {}, { timeout: 15000 });
      },
    );

    await step(
      "toggling a layer checkbox unchecks it and hides it on the map",
      async () => {
        const checkbox = await findInputByText(canvas, "militarysrf");
        await expect(checkbox).toBeChecked();

        await userEvent.click(checkbox);
        await expect(checkbox).not.toBeChecked();

        await waitFor(() => expect(capturedMap).not.toBeNull());
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("militarysrf", "visibility"),
          ).toBe("none"),
        );
      },
    );

    await step(
      "switching a radio-group entry is mutually exclusive on the map",
      async () => {
        const utilityRadio = await findInputByText(
          canvas,
          "utilityinfrastructurepnt",
        );
        const agricultureRadio = await findInputByText(
          canvas,
          "agriculturesrf",
        );

        // The first entry of a radio-group is selected by default.
        await expect(utilityRadio).toBeChecked();
        await expect(agricultureRadio).not.toBeChecked();
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("agriculturesrf", "visibility"),
          ).toBe("none"),
        );

        await userEvent.click(agricultureRadio);

        await expect(agricultureRadio).toBeChecked();
        await expect(utilityRadio).not.toBeChecked();
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("agriculturesrf", "visibility"),
          ).not.toBe("none"),
        );
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty(
              "utilityinfrastructurepnt",
              "visibility",
            ),
          ).toBe("none"),
        );
      },
    );

    await step(
      "unchecking a sourceLayer merge-group hides every real layer it auto-collected",
      async () => {
        const transportationCheckbox = await findInputByText(
          canvas,
          "Transportation",
        );
        await expect(transportationCheckbox).toBeChecked();

        await userEvent.click(transportationCheckbox);
        await expect(transportationCheckbox).not.toBeChecked();

        // "Transportation" itself isn't a real style layer - it's a virtual entry that
        // auto-collected every real layer sharing the "TransportationGroundCrv" source-layer.
        // Confirm several of the actual underlying layers were hidden together.
        for (const layerId of [
          "transportationgroundcrv.1",
          "transportationgroundcrv.2",
          "transportationgroundcrv.3",
        ]) {
          await waitFor(() =>
            expect(capturedMap?.getLayoutProperty(layerId, "visibility")).toBe(
              "none",
            ),
          );
        }
      },
    );
  },
};

// The style's own metadata is what production actually uses day to day (LayerControl
// defaults to `preferStyle: true`), yet it was never exercised by an automated test - the
// story above deliberately disables it for deterministic, hand-authored entries. This
// story renders LayerControl "as ogcapi-html would" - no `entries` prop at all.
export const StyleMetadata: Story = {
  render: () => (
    <MapLibre
      styleUrl={STYLE_URL}
      center={[36.1, 32.62]}
      zoom={13}
      custom={(map) => {
        capturedMap = map;
      }}
    >
      <LayerControl opened />
    </MapLibre>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "the style's own ldproxy:layerControl metadata is used",
      async () => {
        // Labels below come from the Daraa style's embedded metadata, not from any prop
        // this story passes in - if the demo style's metadata ever changes shape, this is
        // the test that will need updating, not the LayerControl code.
        await canvas.findByText("Basemap", {}, { timeout: 15000 });
        await canvas.findByText(
          "Agriculture (Surfaces)",
          {},
          { timeout: 15000 },
        );
      },
    );

    await step(
      "toggling a checkbox from the metadata-driven tree hides it on the map",
      async () => {
        const checkbox = await findInputByText(
          canvas,
          "Agriculture (Surfaces)",
        );
        await expect(checkbox).toBeChecked();

        await userEvent.click(checkbox);
        await expect(checkbox).not.toBeChecked();

        await waitFor(() => expect(capturedMap).not.toBeNull());
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("agriculturesrf", "visibility"),
          ).toBe("none"),
        );
      },
    );
  },
};

// Layers hidden via `visibility: "none"` in the style itself - LayerControl must take
// them over as its initial selection instead of forcing every layer visible.
const HIDDEN_IN_STYLE = [
  "militarysrf",
  "hydrographycrv",
  "utilityinfrastructurepnt",
  // only one of the two layers of the "Railway" merge-group
  "transportationgroundcrv.0b",
];

const initialStateEntries = entries.map((entry) =>
  typeof entry !== "string" && entry.type === "group"
    ? {
        ...entry,
        entries: entry.entries.map((child) =>
          typeof child !== "string" && child.id === "Hydro"
            ? { ...child, opened: false }
            : child,
        ),
      }
    : entry,
);

const loadStyleWithHiddenLayers = async () => {
  const style = await (await fetch(STYLE_URL)).json();
  for (const layer of style.layers) {
    if (HIDDEN_IN_STYLE.includes(layer.id)) {
      layer.layout = { ...layer.layout, visibility: "none" };
    }
  }
  const styleUrl = URL.createObjectURL(
    new Blob([JSON.stringify(style)], { type: "application/json" }),
  );
  return { styleUrl };
};

const renderInitialState: Story["render"] = (_args, { loaded }) => (
  <MapLibre
    styleUrl={loaded.styleUrl as string}
    center={[36.1, 32.62]}
    zoom={13}
    custom={(map) => {
      capturedMap = map;
    }}
  >
    <LayerControl entries={initialStateEntries} preferStyle={false} opened />
  </MapLibre>
);

// Hydro starts collapsed (opened: false); the layers in HIDDEN_IN_STYLE start deselected.
// This story only asserts the initial state - no clicks - so what you see in Storybook
// is exactly the state after loading. Interactions live in InitialStateInteractions.
export const InitialState: Story = {
  loaders: [loadStyleWithHiddenLayers],
  render: renderInitialState,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "layers hidden in the style start unchecked and stay hidden",
      async () => {
        const checkbox = await findInputByText(canvas, "militarysrf");
        await expect(checkbox).not.toBeChecked();
        await waitFor(() => expect(capturedMap).not.toBeNull());
        await expect(
          capturedMap?.getLayoutProperty("militarysrf", "visibility"),
        ).toBe("none");
      },
    );

    await step(
      "a group with a hidden layer starts unchecked, its visible layers checked",
      async () => {
        await expect(
          await findInputByText(canvas, "hydrographycrv"),
        ).not.toBeChecked();
        await expect(
          await findInputByText(canvas, "hydrographysrf"),
        ).toBeChecked();
        await expect(
          await findInputByText(canvas, "Hydrography"),
        ).not.toBeChecked();
        await expect(
          await findInputByText(canvas, "Overview"),
        ).not.toBeChecked();
        await expect(await findInputByText(canvas, "Railway")).toBeChecked();
      },
    );

    await step(
      "a partially hidden merge-group starts checked, its hidden layer stays hidden",
      async () => {
        const railway = await findInputByText(canvas, "Railway");
        await expect(railway).toBeChecked();
        await expect(
          capturedMap?.getLayoutProperty(
            "transportationgroundcrv.0a",
            "visibility",
          ),
        ).not.toBe("none");
        await expect(
          capturedMap?.getLayoutProperty(
            "transportationgroundcrv.0b",
            "visibility",
          ),
        ).toBe("none");
      },
    );

    await step(
      "a radio-group selects its first entry that is not hidden in the style",
      async () => {
        await expect(
          await findInputByText(canvas, "utilityinfrastructurepnt"),
        ).not.toBeChecked();
        await expect(
          await findInputByText(canvas, "agriculturesrf"),
        ).toBeChecked();
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty("agriculturesrf", "visibility"),
          ).not.toBe("none"),
        );
      },
    );

    await step(
      "a group with opened: false starts collapsed, others expanded",
      async () => {
        await waitFor(() =>
          expect(canvas.getByText("hydrographysrf")).not.toBeVisible(),
        );
        await expect(canvas.getByText("Railway")).toBeVisible();
      },
    );
  },
};

export const InitialStateInteractions: Story = {
  loaders: [loadStyleWithHiddenLayers],
  render: renderInitialState,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("militarysrf", {}, { timeout: 15000 });

    await step(
      "a group gets checked once all of its entries are, even with a partially hidden merge-group",
      async () => {
        const toggleHydro = async () => {
          const header = (await canvas.findByText("Hydrography")).closest(
            ".row",
          );
          const button = header?.querySelector("button");
          await expect(button).not.toBeNull();
          await userEvent.click(button as HTMLButtonElement);
        };

        await toggleHydro();
        await userEvent.click(await findInputByText(canvas, "hydrographycrv"));

        await expect(
          await findInputByText(canvas, "Hydrography"),
        ).toBeChecked();
        // "Railway" is checked although one of its layers is still hidden
        await expect(await findInputByText(canvas, "Overview")).toBeChecked();
        await expect(
          capturedMap?.getLayoutProperty(
            "transportationgroundcrv.0b",
            "visibility",
          ),
        ).toBe("none");
      },
    );

    await step(
      "switching a partially hidden merge-group off and on shows all its layers",
      async () => {
        const railway = await findInputByText(canvas, "Railway");
        await userEvent.click(railway);
        await expect(railway).not.toBeChecked();
        await waitFor(() =>
          expect(
            capturedMap?.getLayoutProperty(
              "transportationgroundcrv.0a",
              "visibility",
            ),
          ).toBe("none"),
        );

        await userEvent.click(railway);
        await expect(railway).toBeChecked();
        for (const layerId of [
          "transportationgroundcrv.0a",
          "transportationgroundcrv.0b",
        ]) {
          await waitFor(() =>
            expect(
              capturedMap?.getLayoutProperty(layerId, "visibility"),
            ).not.toBe("none"),
          );
        }
      },
    );
  },
};
