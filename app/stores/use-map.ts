import type { MapInstance } from "@indoorequal/vue-maplibre-gl";
import type { MapPoint } from "~~/lib/types";
import type { LngLatBounds } from "maplibre-gl";

export const UseMapStore = defineStore("UseMapStore", () => {
  const map = ref<MapInstance>();
  const mapPoints = ref<MapPoint[]>([]);
  const selectedMapPoint = ref<MapPoint | null>(null);
  const isLoading = ref(false);
  let bounds: LngLatBounds | null = null;
  const shouldFlyTo = ref(true);

  function selectedMapPointWithoutFlyTo(point: MapPoint | null) {
    shouldFlyTo.value = false;
    selectedMapPoint.value = point;
  }

  async function init() {
    if (map.value)
      return;

    const [{ useMap }, { LngLatBounds }] = await Promise.all([
      import("@indoorequal/vue-maplibre-gl"),
      import("maplibre-gl"),
    ]);

    map.value = useMap();

    watchEffect(() => {
      const firstPoint = mapPoints.value[0];
      if (!firstPoint)
        return;

      bounds = mapPoints.value.reduce(
        (acc, point) => acc.extend([point.lng, point.lat]),
        new LngLatBounds(),
      );

      map.value?.map?.fitBounds(bounds, {
        padding: 60,
        maxZoom: 10,
      });
    });

    effect(() => {
      if (selectedMapPoint.value) {
        if (shouldFlyTo.value) {
          map.value?.map?.flyTo({
            center: [selectedMapPoint.value.lng, selectedMapPoint.value.lat],
            zoom: 6,
          });
        }
        shouldFlyTo.value = true;
      }
      else if (bounds) {
        map.value?.map?.fitBounds(bounds, {
          padding: 60,
          maxZoom: 10,
        });
      }
    });
  }

  return {
    map,
    mapPoints,
    selectedMapPoint,
    isLoading,
    selectedMapPointWithoutFlyTo,
    init,
  };
});
