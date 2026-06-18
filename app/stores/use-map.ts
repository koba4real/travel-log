import type { MapInstance } from "@indoorequal/vue-maplibre-gl";
import type { MapPoint } from "~~/lib/types";

export const UseMapStore = defineStore("UseMapStore", () => {
  const map = ref<MapInstance>();
  const mapPoints = ref<MapPoint[]>([]);
  const isLoading = ref(false);

  // maplibre-gl is a browser-only CommonJS module (Vite's SSR transform throws
  // "Named export 'LngLat' not found"), and @indoorequal/vue-maplibre-gl
  // re-imports it. So both are loaded lazily here instead of at module top
  // level, and init() is only ever called from the client (see Map.client.vue),
  // mirroring how the auth store defers its client-only work.
  async function init() {
    if (map.value)
      return; // already wired up on a previous mount

    const [{ useMap }, { LngLatBounds }] = await Promise.all([
      import("@indoorequal/vue-maplibre-gl"),
      import("maplibre-gl"),
    ]);

    // useMap() reads from a module-level registry, so it works outside of a
    // component setup — no inject/setup context required.
    map.value = useMap();

    watchEffect(() => {
      const firstPoint = mapPoints.value[0];
      if (!firstPoint)
        return;

      const bounds = mapPoints.value.reduce(
        (acc, point) => acc.extend([point.lng, point.lat]),
        new LngLatBounds(),
      );

      map.value?.map?.fitBounds(bounds, {
        padding: 60,
        maxZoom: 10,
      });
    });
  }

  return {
    map,
    mapPoints,
    isLoading,
    init,
  };
});
