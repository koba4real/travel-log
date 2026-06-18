import type { MapPoint } from "~~/lib/types";

export const UseLocationsStore = defineStore("UseLocationsStore", () => {
  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    lazy: true,
  });

  // Keep the map store in sync so the map stays decoupled from the
  // locations fetch: it only ever reads from UseMapStore.
  const mapStore = UseMapStore();

  watch(
    locations,
    (newLocations) => {
      mapStore.mapPoints = (newLocations ?? []).map((location): MapPoint => ({
        id: location.id,
        label: location.name,
        lat: location.lat,
        lng: location.long,
      }));
    },
    { immediate: true },
  );

  watch(
    locationsStatus,
    (status) => {
      mapStore.isLoading = status === "pending";
    },
    { immediate: true },
  );

  return {
    locations,
    locationsStatus,
    refreshLocations,
  };
});
