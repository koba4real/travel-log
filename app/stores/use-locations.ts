import type { MapPoint } from "~~/lib/types";

export const UseLocationsStore = defineStore("UseLocationsStore", () => {
  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    lazy: true,
    server: false, // fetch client-side so the skeleton shows; SSR can't forward the auth cookie anyway
  });

  // "idle" is the pre-fetch state on a client-only lazy fetch — treat it as loading
  // so the UI shows a skeleton instead of an empty state before the request fires.
  const locationsPending = computed(() =>
    locationsStatus.value === "pending" || locationsStatus.value === "idle");

  const route = useRoute();
  const slug = computed(() => route.params.slug as string);

  const {
    data: locationLogs,
    status: locationLogsStatus,
    refresh: refreshLocationLogs,
  } = useFetch(() => `/api/locations/${slug.value}/logs`, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const locationLogsPending = computed(() =>
    locationLogsStatus.value === "pending" || locationLogsStatus.value === "idle");

  watch(slug, (value) => {
    if (value)
      refreshLocationLogs();
  }, { immediate: true });

  // Keep the map store in sync so the map stays decoupled from the
  const mapStore = UseMapStore();

  watchEffect(() => {
    const onLogsPage = route.path === `/dashboard/location/${route.params.slug}`;
    mapStore.mapPoints = onLogsPage
      ? (locationLogs.value ?? []).map((log): MapPoint => ({
          id: log.id,
          name: log.name,
          to: `/dashboard/location/${route.params.slug}/${log.id}`,
          description: log.description ?? undefined,
          lat: log.lat,
          long: log.long,
        }))
      : (locations.value ?? []).map((location): MapPoint => ({
          id: location.id,
          name: location.name,
          slug: location.slug,
          to: `/dashboard/location/${location.slug}`,
          description: location.description ?? undefined,
          lat: location.lat,
          long: location.long,
        }));
  });

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
    locationsPending,
    refreshLocations,
    locationLogs,
    locationLogsStatus,
    locationLogsPending,
    refreshLocationLogs,
  };
});
