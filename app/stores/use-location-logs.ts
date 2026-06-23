export const UseLocationLogsStore = defineStore("UseLocationLogsStore", () => {
  const route = useRoute();
  const slug = computed(() => route.params.slug as string);

  // Reactive URL: refetches automatically when the viewed location changes.
  const {
    data: locationLogs,
    status: locationLogsStatus,
    refresh: refreshLocationLogs,
  } = useFetch(() => `/api/locations/${slug.value}/logs`, {
    lazy: true,
    immediate: !!slug.value,
  });

  return {
    locationLogs,
    locationLogsStatus,
    refreshLocationLogs,
  };
});
