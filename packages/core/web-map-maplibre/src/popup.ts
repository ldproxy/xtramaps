import type {
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  Map as MaplibreMap,
  MapMouseEvent,
} from "maplibre-gl";
import { Popup } from "maplibre-gl";
import type { FeatureTitles } from "./types";

type Geometry = {
  type: string;
  coordinates: unknown;
};

const changeCursor = (map: MaplibreMap, cursor: string) => {
  const canvas = map.getCanvas();
  canvas.style.cursor = cursor;
};

const firstCoordinate = (geometry: Geometry): [number, number] | null => {
  switch (geometry.type) {
    case "Point":
      return geometry.coordinates as [number, number];
    case "LineString":
    case "MultiPoint":
      return (geometry.coordinates as [number, number][])[0];
    case "Polygon":
    case "MultiLineString":
      return (geometry.coordinates as [number, number][][])[0][0];
    case "MultiPolygon":
      return (geometry.coordinates as [number, number][][][])[0][0][0];
    default:
      return null;
  }
};

const showPopup = (
  map: MaplibreMap,
  popup: Popup,
  featureTitles: FeatureTitles,
) => {
  let currentLngLat: [number, number] | null;
  return (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const lngLat = firstCoordinate(feature.geometry as Geometry);
    if (currentLngLat !== lngLat && lngLat) {
      currentLngLat = lngLat;
      changeCursor(map, "pointer");
      const description =
        featureTitles[String(feature.id)] || String(feature.id);

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - lngLat[0]) > 180) {
        lngLat[0] += e.lngLat.lng > lngLat[0] ? 360 : -360;
      }

      if (lngLat && description) {
        popup.setLngLat(lngLat).setHTML(description).addTo(map);
      }
    }
  };
};

const featureHtml = (
  feature: MapGeoJSONFeature,
  idx: number,
  total: number,
): string => {
  const title =
    feature.sourceLayer ||
    (feature.properties?.featureType as string) ||
    "feature";
  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;gap:20px;">
      <h5 style="margin:0;">${title}</h5>
      ${
        total > 1
          ? `
          <div class="popup-navigation">
            <a href="#" id="popup-prev-${idx}" class="popup-nav-btn">&lt;</a>
            <span id="popup-index-${idx}" class="popup-index">${idx + 1}/${total}</span>
            <a href="#" id="popup-next-${idx}" class="popup-nav-btn">&gt;</a>
          </div>
      `
          : ""
      }
    </div>
  `;
  let description = `${header}<hr/><table style="width: 100%;">`;
  Object.keys(feature.properties ?? {})
    .sort()
    .forEach((prop) => {
      let val = feature.properties?.[prop];
      if (typeof val === "string" && /^https?:\/\/[^\s]+$/.test(val)) {
        val = `<a href="${val}" target="_blank">${val}</a>`;
      }
      description += `<tr><td title="${prop}" class="pr-4"><strong>${prop}</strong></td><td title="${feature.properties?.[prop]}">${val}</td></tr>`;
    });
  description += "</table>";
  return `<div class="popup-feature" id="popup-feature-${idx}" style="display:${
    idx === 0 ? "block" : "none"
  }">${description}</div>`;
};

const getDefaultPopupContent = ({
  features,
}: {
  features: MapGeoJSONFeature[];
}): Promise<string> => {
  if (!features || features.length === 0) {
    return Promise.resolve("");
  }

  if (features.length === 1) {
    return Promise.resolve(featureHtml(features[0], 0, 1));
  }

  const allFeaturesHtml = features
    .map((f, i) => featureHtml(f, i, features.length))
    .join("");
  return Promise.resolve(allFeaturesHtml);
};

declare global {
  // eslint-disable-next-line no-var
  var getPopupContent:
    | ((features: MapGeoJSONFeature[], map: MaplibreMap) => Promise<string>)
    | undefined;
}

const showPopupProps =
  (map: MaplibreMap, popup: Popup) => (e: MapMouseEvent) => {
    const allFeatures = map.queryRenderedFeatures(e.point);

    if (!allFeatures || allFeatures.length === 0) {
      return;
    }

    // Deduplicate features based on id and sourceLayer
    const featuresMap = new Map<string, MapGeoJSONFeature>();
    allFeatures.forEach((f, index) => {
      const featureId = f.id !== undefined ? f.id : `idx-${index}`;
      const layerId = f.sourceLayer || f.layer?.id || "";
      const key = `${featureId}-${layerId}`;
      if (!featuresMap.has(key)) {
        featuresMap.set(key, f);
      }
    });
    const features = Array.from(featuresMap.values());

    if (features.length === 0) {
      return;
    }

    // Use the click location instead of the first coordinate of the geometry
    // This is better for polygons and lines where the first coordinate might be far from the click
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    const description = globalThis.getPopupContent
      ? globalThis.getPopupContent(features, map)
      : getDefaultPopupContent({ features });

    if (lngLat && description) {
      description.then((d) => {
        popup.setLngLat(lngLat).setHTML(d).addTo(map);

        if (features.length > 1) {
          let idx = 0;
          const total = features.length;

          const update = (newIdx: number) => {
            if (newIdx < 0 || newIdx >= total) return;
            const oldEl = document.getElementById(`popup-feature-${idx}`);
            if (oldEl) oldEl.style.display = "none";
            idx = newIdx;
            const newEl = document.getElementById(`popup-feature-${idx}`);
            if (newEl) newEl.style.display = "block";
            const indexElement = document.getElementById(`popup-index-${idx}`);
            if (indexElement) {
              indexElement.textContent = `${idx + 1}/${total}`;
            }
            const prevBtn = document.getElementById(`popup-prev-${idx}`);
            const nextBtn = document.getElementById(`popup-next-${idx}`);
            if (prevBtn) {
              prevBtn.onclick = (evt) => {
                evt.preventDefault();
                update(idx - 1);
              };
            }
            if (nextBtn) {
              nextBtn.onclick = (evt) => {
                evt.preventDefault();
                update(idx + 1);
              };
            }
          };

          const initialPrevBtn = document.getElementById(`popup-prev-${idx}`);
          const initialNextBtn = document.getElementById(`popup-next-${idx}`);
          if (initialPrevBtn) {
            initialPrevBtn.onclick = (evt) => {
              evt.preventDefault();
              update(idx - 1);
            };
          }
          if (initialNextBtn) {
            initialNextBtn.onclick = (evt) => {
              evt.preventDefault();
              update(idx + 1);
            };
          }
        }
      });
    }
  };

const hidePopup = (map: MaplibreMap, popup: Popup) => () => {
  changeCursor(map, "");
  popup.remove();
};

export const addPopup = (
  map: MaplibreMap,
  featureTitles: FeatureTitles = {},
  layerIds: string[] = ["points"],
): void => {
  const popup = new Popup({
    closeButton: false,
    closeOnClick: false,
  });

  layerIds.forEach((layerId) => {
    // Make sure to detect feature change for overlapping features and use mousemove instead of mouseenter event
    map.on("mousemove", layerId, showPopup(map, popup, featureTitles));
    map.on("mouseleave", layerId, hidePopup(map, popup));
  });
};

export const addPopupProps = (
  map: MaplibreMap,
  layerIds: string[] = [],
): void => {
  const popup = new Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: "50%",
    className: "popup-props",
    anchor: "top",
  });

  map.on("click", showPopupProps(map, popup));

  layerIds.forEach((layerId) => {
    map.on("mouseenter", layerId, () => changeCursor(map, "pointer"));
    map.on("mouseleave", layerId, () => changeCursor(map, ""));
  });
};
