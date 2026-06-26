import type { SelectLocationLogWithImages } from "~~/lib/db/Schema/location-log";
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
  const {
    data: CurrentLocationLog,
    status: CurrentLocationLogStatus,
    refresh: refreshCurrentLocationLog,
  } = useFetch<SelectLocationLogWithImages>(() => `/api/locations/${slug.value}/${route.params.id}`, {
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

  // Refetch the viewed log (with its images) whenever the slug/id changes. The
  // detail page component is reused when moving between logs, so a lifecycle hook
  // misses param-only changes — watching here catches every move. Clear first so
  // the previously viewed log's photos never linger during the fetch.
  watch(
    [slug, () => route.params.id],
    ([s, id]) => {
      CurrentLocationLog.value = undefined;
      if (s && id)
        refreshCurrentLocationLog();
    },
    { immediate: true },
  );

  const mapStore = UseMapStore();

  watchEffect(() => {
    const base = `/dashboard/location/${route.params.slug}`;
    const logId = route.params.id ? Number(route.params.id) : null;
    // Logs list page, or a single log's detail page.
    const onLogsContext = route.path === base || route.path === `${base}/${logId}` || route.path === `${base}/${logId}/edit`;

    if (onLogsContext) {
      const logs = (locationLogs.value ?? []).map((log): MapPoint => ({
        id: log.id,
        name: log.name,
        to: `${base}/${log.id}`,
        description: log.description ?? undefined,
        lat: log.lat,
        long: log.long,
      }));
      // On a single log's page, pin only that log so the map highlights it.
      mapStore.mapPoints = logId ? logs.filter(p => p.id === logId) : logs;
    }
    else {
      mapStore.mapPoints = (locations.value ?? []).map((location): MapPoint => ({
        id: location.id,
        name: location.name,
        slug: location.slug,
        to: `/dashboard/location/${location.slug}`,
        description: location.description ?? undefined,
        lat: location.lat,
        long: location.long,
      }));
    }
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
    CurrentLocationLog,
    CurrentLocationLogStatus,
    refreshCurrentLocationLog,
  };
});
