export const UseLocationsStore = defineStore("UseLocationsStore", () => {
  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    lazy: true,
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
  };
});
