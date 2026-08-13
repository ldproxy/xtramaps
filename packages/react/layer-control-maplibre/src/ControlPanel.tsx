import type {
  HydratedEntry,
  StyleWithSpriteLoaded,
} from "@xtramaps/layer-control-maplibre";
import { Fragment } from "react";
import { Container, Row } from "reactstrap";
import Group from "./Group";
import Header from "./Header";
import Layer from "./Layer";
import Separator from "./Separator";

export interface ControlPanelProps {
  entries: HydratedEntry[];
  style: (StyleWithSpriteLoaded & { zoom?: number }) | null;
  maxHeight: number;
  isVisible: boolean;
  isControlable: boolean;
  isOpened: (id: string) => boolean;
  isSelected: (id: string, radioGroup?: string) => boolean;
  onSelect: (id: string, radioGroup?: string) => void;
  onOpen: (id: string) => void;
}

function ControlPanel({
  entries,
  style,
  maxHeight,
  isVisible,
  isControlable,
  isOpened,
  isSelected,
  onSelect,
  onOpen,
}: ControlPanelProps) {
  let lastWasSingle = true;

  return (
    <Container
      fluid
      id="layer-control"
      className="maplibregl-ctrl maplibregl-ctrl-group"
      style={{
        display: isVisible ? "block" : "none",
        minWidth: "275px",
        maxHeight: `${maxHeight}px`,
        paddingBottom: "5px",
        overflow: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "darkgrey #f1f1f1",
      }}
    >
      {entries.map((entry, i) => {
        const isSingle = entry.type === "layer" || entry.type === "merge-group";
        const newSection = i === 0 || !lastWasSingle || !isSingle;
        lastWasSingle = isSingle;

        return entry.type === "layer" ? (
          <Fragment key={entry.id}>
            <Separator section={newSection} first={i === 0} />
            <Row
              style={{
                flexWrap: "nowrap",
              }}
            >
              <Layer
                id={entry.id}
                label={entry.label}
                icons={[entry]}
                isControlable={isControlable}
                isSelected={isSelected}
                onSelect={onSelect}
                style={style}
              />
            </Row>
          </Fragment>
        ) : (
          <Fragment key={entry.id}>
            <Separator section={newSection} first={i === 0} />
            {entry.type !== "merge-group" && (
              <Header
                id={entry.id}
                label={entry.label}
                check={entry.type !== "radio-group"}
                isControlable={isControlable}
                isOpened={isOpened}
                isSelected={isSelected}
                onOpen={onOpen}
                onSelect={onSelect}
              />
            )}
            <Group
              parent={entry}
              style={style}
              isControlable={
                isControlable && !(entry.type === "group" && entry.onlyLegend)
              }
              isOpened={isOpened}
              isSelected={isSelected}
              onSelect={onSelect}
              onOpen={onOpen}
            />
          </Fragment>
        );
      })}
    </Container>
  );
}

ControlPanel.displayName = "ControlPanel";

export default ControlPanel;
