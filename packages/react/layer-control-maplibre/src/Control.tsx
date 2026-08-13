import type { LayerControlEntry } from "@xtramaps/layer-control-maplibre";
import { initialCfg, parse } from "@xtramaps/layer-control-maplibre";
import type { Map as MaplibreMap } from "maplibre-gl";
import { useCallback, useEffect, useState } from "react";
import ControlButton from "./ControlButton";
import ControlPanel from "./ControlPanel";

export interface ControlProps {
  entries?: LayerControlEntry[];
  maxHeight: number;
  map: MaplibreMap;
  opened?: boolean;
  onlyLegend?: boolean;
  preferStyle?: boolean;
}

function Control({
  entries = [],
  maxHeight,
  map,
  opened = false,
  onlyLegend = false,
  preferStyle = true,
}: ControlProps) {
  const [isVisible, setIsVisible] = useState(opened);
  const [isControlable, setIsControlable] = useState(!onlyLegend);
  const [cfg, setCfg] = useState(initialCfg);
  const [selectedRadioGroups, setSelectedRadioGroups] = useState(
    initialCfg.radioIds,
  );
  const [selected, setSelected] = useState(initialCfg.allIds);
  const [open, setOpen] = useState(initialCfg.groupIds);

  const onOpen = (id: string) => {
    if (open.includes(id)) {
      setOpen(open.filter((id2) => id2 !== id));
    } else {
      setOpen([...open, id]);
    }
  };

  const isOpened = (name: string) => {
    return open.includes(name);
  };

  const onSelect = (id: string, radioGroup?: string) => {
    if (radioGroup) {
      if (selectedRadioGroups[radioGroup] !== id) {
        setSelectedRadioGroups({ ...selectedRadioGroups, [radioGroup]: id });
      }
      return;
    }
    if (selected.includes(id)) {
      setSelected(selected.filter((id2) => !cfg.deps[id].includes(id2)));
    } else {
      const newSelected = [...selected, id];

      cfg.depsChild[id].forEach((child) => {
        if (!newSelected.includes(child)) {
          newSelected.push(child);
        }
      });

      cfg.depsParent[id].forEach((parent) => {
        if (
          !newSelected.includes(parent) &&
          cfg.depsChild[parent].every((child) => newSelected.includes(child))
        ) {
          newSelected.push(parent);
        }
      });

      setSelected(newSelected);
    }
  };

  const isSelected = useCallback(
    (id: string, radioGroup?: string) =>
      radioGroup
        ? selectedRadioGroups[radioGroup] === id
        : selected.includes(id),
    [selected, selectedRadioGroups],
  );

  const toggleLayerControlVisible = () => {
    setIsVisible(!isVisible);
  };

  // initialize state from configuration when style is loaded
  useEffect(() => {
    map.on("style.load", () => {
      // map.getStyle() is typed against maplibre-gl's own (newer) nested copy of
      // @maplibre/maplibre-gl-style-spec; structurally identical to the one this
      // package depends on, so this cast is safe.
      parse(
        map.getStyle() as unknown as Parameters<typeof parse>[0],
        entries,
        preferStyle,
      ).then((config) => {
        setCfg(config);
        if (config.opened === true) setIsVisible(true);
        if (config.onlyLegend === true) setIsControlable(false);
        setSelectedRadioGroups(config.radioIds);
        setSelected(config.allIds);
        setOpen(config.groupIds);
      });
    });
  }, [entries, map, preferStyle]);

  // apply selection state to map
  useEffect(() => {
    cfg.layerIds.forEach((id) => {
      if (map.getLayer(id)) {
        const visible = map.getLayoutProperty(id, "visibility") !== "none";
        if (visible && !isSelected(id)) {
          map.setLayoutProperty(id, "visibility", "none");
        } else if (!visible && isSelected(id)) {
          map.setLayoutProperty(id, "visibility", "visible");
        }
      }
    });
    Object.keys(cfg.radioGroups).forEach((group) => {
      cfg.radioGroups[group].forEach((id) => {
        if (map.getLayer(id)) {
          const visible = map.getLayoutProperty(id, "visibility") !== "none";
          if (visible && !isSelected(id, group)) {
            map.setLayoutProperty(id, "visibility", "none");
          } else if (!visible && isSelected(id, group)) {
            map.setLayoutProperty(id, "visibility", "visible");
          }
        }
      });
    });
  }, [map, cfg, isSelected]);

  return (
    <>
      <ControlButton isEnabled={isVisible} toggle={toggleLayerControlVisible} />
      {cfg?.style && (
        <ControlPanel
          entries={cfg.entries}
          style={cfg.style}
          maxHeight={maxHeight}
          isVisible={isVisible}
          isControlable={isControlable}
          isOpened={isOpened}
          isSelected={isSelected}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      )}
    </>
  );
}

Control.displayName = "Control";

export default Control;
