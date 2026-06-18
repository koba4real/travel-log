import type { MapPoint } from "~~/lib/types";

export const UseMapStore = defineStore("UseMapStore", () => {
  const mapPoints = ref<MapPoint[]>([]);
  const isLoading = ref(false);

  return {
    mapPoints,
    isLoading,
  };
});
