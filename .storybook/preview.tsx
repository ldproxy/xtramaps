import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{ height: "65vh", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
