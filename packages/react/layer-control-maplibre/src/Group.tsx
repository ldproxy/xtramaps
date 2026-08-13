import type {
  HydratedEntry,
  StyleWithSpriteLoaded,
} from "@xtramaps/layer-control-maplibre";
import { Fragment } from "react";
import { Collapse, Row } from "reactstrap";
import Header from "./Header";
import Layer from "./Layer";
import Separator from "./Separator";

export interface GroupProps {
  parent: HydratedEntry;
  style: (StyleWithSpriteLoaded & { zoom?: number }) | null;
  level?: number;
  isControlable: boolean;
  isOpened: (id: string) => boolean;
  isSelected: (id: string, radioGroup?: string) => boolean;
  onSelect: (id: string, radioGroup?: string) => void;
  onOpen: (id: string) => void;
}

function Group({
  parent,
  style,
  level = 0,
  isControlable,
  isOpened,
  isSelected,
  onSelect,
  onOpen,
}: GroupProps) {
  if (parent.type === "radio-group") {
    return (
      <Collapse isOpen={isOpened(parent.id)}>
        {parent.entries.map((entry, i) => {
          return (
            <Fragment key={entry.id}>
              {i > 0 && <Separator />}
              <Row>
                <Layer
                  id={entry.id}
                  label={entry.label}
                  icons={[entry]}
                  isControlable={isControlable}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  style={style}
                  level={level + 1}
                  radioGroup={parent.id}
                />
              </Row>
            </Fragment>
          );
        })}
      </Collapse>
    );
  }
  if (parent.type === "merge-group") {
    return (
      <Row
        style={{
          flexWrap: "nowrap",
        }}
      >
        <Layer
          id={parent.id}
          label={parent.label}
          icons={parent.entries}
          isControlable={isControlable}
          isSelected={isSelected}
          onSelect={onSelect}
          style={style}
          level={level}
        />
      </Row>
    );
  }
  if (parent.type === "group") {
    return (
      <Collapse isOpen={isOpened(parent.id)}>
        {parent.entries.map((entry, i) => {
          if (entry.type === "layer") {
            return (
              <Fragment key={entry.id}>
                {i > 0 && <Separator />}
                <Row>
                  <Layer
                    id={entry.id}
                    label={entry.label}
                    icons={[entry]}
                    isControlable={isControlable && !entry.onlyLegend}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    style={style}
                    level={level + 1}
                  />
                </Row>
              </Fragment>
            );
          }
          return (
            <Fragment key={entry.id}>
              {i > 0 && <Separator />}
              {entry.type !== "merge-group" && (
                <Header
                  id={entry.id}
                  label={entry.label}
                  level={level + 1}
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
                level={level + 1}
                isControlable={isControlable && !entry.onlyLegend}
                isOpened={isOpened}
                isSelected={isSelected}
                onSelect={onSelect}
                onOpen={onOpen}
              />
            </Fragment>
          );
        })}
      </Collapse>
    );
  }

  return null;
}

Group.displayName = "Group";

export default Group;
