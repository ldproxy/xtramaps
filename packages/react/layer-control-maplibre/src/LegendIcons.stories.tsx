import type { Meta, StoryObj } from "@storybook/react-vite";
import MapLibre from "@xtramaps/web-map-maplibre-react";
import "@xtramaps/web-map-maplibre-react/dist/index.css";
import { expect, within } from "storybook/test";
import LayerControl from "./LayerControl";

const STYLE_URL = "https://demo.ldproxy.net/daraa/styles/topographic?f=mbs";

// A common pattern for boundaries: a visible outline plus a fully transparent fill that only
// serves as a click target for the polygon's interior. Each merge-group gets its own outline
// layer, since a style layer shared between entries would be toggled by both.
const extraLayers = [
  {
    id: "militarysrf_outline_a",
    type: "line",
    source: "daraa",
    "source-layer": "MilitarySrf",
    paint: { "line-color": "#DD3344", "line-width": 3 },
  },
  {
    id: "militarysrf_outline_b",
    type: "line",
    source: "daraa",
    "source-layer": "MilitarySrf",
    paint: { "line-color": "#DD3344", "line-width": 3 },
  },
  {
    id: "militarysrf_invisible",
    type: "fill",
    source: "daraa",
    "source-layer": "MilitarySrf",
    paint: { "fill-color": "#ffffff", "fill-opacity": 0 },
  },
];

const entries = [
  {
    id: "Outline with invisible fill",
    type: "merge-group" as const,
    entries: ["militarysrf_outline_a", "militarysrf_invisible"],
  },
  {
    id: "Outline with visible fill",
    type: "merge-group" as const,
    entries: ["militarysrf_outline_b", "militarysrf"],
  },
];

const meta = {
  title: "layer-control-maplibre/LegendIcons",
  loaders: [
    async () => {
      const style = await (await fetch(STYLE_URL)).json();
      style.layers.push(...extraLayers);
      const styleUrl = URL.createObjectURL(
        new Blob([JSON.stringify(style)], { type: "application/json" }),
      );
      return { styleUrl };
    },
  ],
  render: (_args, { loaded }) => (
    <MapLibre
      styleUrl={loaded.styleUrl as string}
      center={[36.1, 32.62]}
      zoom={13}
    >
      <LayerControl entries={entries} preferStyle={false} opened />
    </MapLibre>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The legend icon is rendered inside the entry's <label>; line icons are SVGs, fills <div>s. */
async function findIcon(
  canvas: ReturnType<typeof within>,
  text: string,
): Promise<HTMLLabelElement> {
  const label = (await canvas.findByText(text, {}, { timeout: 15000 })).closest(
    "label",
  );
  await expect(label).not.toBeNull();
  return label as HTMLLabelElement;
}

export const InvisibleFill: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "a merge-group with an invisible fill shows its line in the legend icon",
      async () => {
        const label = await findIcon(canvas, "Outline with invisible fill");
        await expect(label.querySelector("svg path")).not.toBeNull();
      },
    );

    await step(
      "a merge-group with a visible fill still shows only the fill",
      async () => {
        const label = await findIcon(canvas, "Outline with visible fill");
        await expect(label.querySelector("svg path")).toBeNull();
      },
    );
  },
};
