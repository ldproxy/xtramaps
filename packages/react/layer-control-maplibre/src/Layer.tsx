import type {
  HydratedLayer,
  StyleWithSpriteLoaded,
} from "@xtramaps/layer-control-maplibre";
import { LegendSymbolReact } from "@xtramaps/legend-symbols-maplibre-react";
import { Col } from "reactstrap";
import { HeaderCheck } from "./Header";

export interface LayerProps {
  id: string;
  label?: string;
  icons: HydratedLayer[];
  style: (StyleWithSpriteLoaded & { zoom?: number }) | null;
  level?: number;
  isControlable?: boolean;
  radioGroup?: string;
  isSelected: (id: string, radioGroup?: string) => boolean;
  onSelect: (id: string, radioGroup?: string) => void;
}

function Layer({
  id,
  label,
  icons,
  style,
  level = 0,
  isControlable = false,
  radioGroup,
  isSelected,
  onSelect,
}: LayerProps) {
  const hasFill = icons.some(
    (icon) => style?.layers?.[icon.index as number]?.type === "fill",
  );
  const hasRaster = icons.some(
    (icon) => style?.layers?.[icon.index as number]?.type === "raster",
  );
  const cleanIcons = hasFill
    ? icons.filter(
        (icon) => style?.layers?.[icon.index as number]?.type !== "line",
      )
    : icons;

  return (
    <Col xs="12" style={{ display: "flex", alignItems: "center" }}>
      <HeaderCheck
        id={id}
        level={level}
        radioGroup={radioGroup}
        isControlable={isControlable}
        isSelected={isSelected}
        onSelect={onSelect}
      >
        <div
          style={{
            position: "relative",
            width: "16px",
            height: "16px",
            marginRight: "5px",
            border: hasRaster ? undefined : "1px solid #ddd",
            boxSizing: "content-box",
          }}
        >
          {style?.layers &&
            cleanIcons.map(
              (icon) =>
                style.layers[icon.index as number] && (
                  <LegendSymbolReact
                    key={icon.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "16px",
                      height: "16px",
                    }}
                    sprite={style.spriteLoaded}
                    zoom={icon.zoom || style.zoom || 0}
                    layer={style.layers[icon.index as number]}
                    properties={icon.properties}
                  />
                ),
            )}
        </div>
        <span style={{ whiteSpace: "nowrap" }}>{label || id}</span>
      </HeaderCheck>
    </Col>
  );
}

Layer.displayName = "Layer";

export default Layer;
