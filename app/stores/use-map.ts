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
  const addedPoint = ref<MapPoint | null>(null);

  function selectedMapPointWithoutFlyTo(point: MapPoint | null) {
    shouldFlyTo.value = false;
    selectedMapPoint.value = point;
  }

  // Move the draft marker to a searched location and zoom the map into it.
  function goToSearchResult(point: MapPoint, zoom = 14) {
    addedPoint.value = point;
    map.value?.map?.flyTo({
      center: [point.lng, point.lat],
      zoom,
    });
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
      if (addedPoint.value)
        return;
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

    watch(addedPoint, (newPoint, oldPoint) => {
      if (newPoint && !oldPoint) {
        map.value?.map?.flyTo({
          center: [newPoint.lng, newPoint.lat],
          zoom: 6,
        });
      }
    }, { immediate: true });
  }

  return {
    map,
    mapPoints,
    selectedMapPoint,
    addedPoint,
    isLoading,
    selectedMapPointWithoutFlyTo,
    goToSearchResult,
    init,
  };
});
