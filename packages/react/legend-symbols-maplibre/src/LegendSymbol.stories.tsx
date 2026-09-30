import type { Meta, StoryObj } from "@storybook/react-vite";
import { createLegend } from "@xtramaps/legend-symbols-maplibre-react";
import { useEffect, useState } from "react";
import { expect, within } from "storybook/test";

const STYLE_URL = "https://demo.ldproxy.net/daraa/styles/topographic?f=mbs";
const ZOOM = 14;

interface StyleLayer {
  id: string;
  type: string;
  layout?: { visibility?: string };
}

function LegendDemo() {
  const [layers, setLayers] = useState<StyleLayer[] | null>(null);
  const [Legend, setLegend] = useState<Awaited<
    ReturnType<typeof createLegend>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(STYLE_URL)
      .then((response) => response.json())
      .then((style) => {
        setLayers(style.layers);
        return createLegend(style, ZOOM);
      })
      .then((legend) => {
        setLegend(() => legend);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p style={{ color: "#c33" }}>Error: {error}</p>;
  }

  if (!layers || !Legend) {
    return (
      <p style={{ color: "#999", fontStyle: "italic" }} data-testid="loading">
        Loading style...
      </p>
    );
  }

  const visibleLayers = layers.filter(
    (l) => l.layout?.visibility !== "none" && l.type !== "background",
  );

  return (
    <div>
      <h1>Daraa Topographic Legend</h1>
      <div
        data-testid="legend"
        style={{
          background: "white",
          borderRadius: 8,
          padding: "1rem",
          maxWidth: 360,
        }}
      >
        {visibleLayers.map((layer) => (
          <div
            key={layer.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.35rem 0",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 20,
                height: 20,
                border: "1px solid #ddd",
              }}
            >
              <Legend
                layer={layer.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "20px",
                  height: "20px",
                }}
              />
            </div>
            <span>{layer.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "legend-symbols-maplibre/LegendSymbol",
  component: LegendDemo,
} satisfies Meta<typeof LegendDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DaraaTopographic: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "legend renders with icons for every visible layer",
      async () => {
        const legend = await canvas.findByTestId(
          "legend",
          {},
          { timeout: 10000 },
        );
        await expect(legend).toBeInTheDocument();

        const icons = legend.querySelectorAll("svg, img, canvas");
        await expect(icons.length).toBeGreaterThan(0);
      },
    );
  },
};
