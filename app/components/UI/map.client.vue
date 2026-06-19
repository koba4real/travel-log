<script lang="ts" setup>
import type { LngLatLike } from "maplibre-gl";

const colorMode = useColorMode();
const style = computed(() =>
  colorMode.value === "dark"
    ? "/styles/dark.json"
    : "https://tiles.openfreemap.org/styles/liberty",
);
// Brescia, Italy — MapLibre expects [lng, lat]
const center = [10.211802, 45.541553] as LngLatLike;
const zoom = 4;

const mapStore = UseMapStore();
onMounted(() => {
  mapStore.init();
});
</script>

<template>
  <div class="map">
    <MglMap
      :map-style="style"
      :center="center"
      :zoom="zoom"
    >
      <MglNavigationControl />
      <mgl-marker
        v-for="point in mapStore.mapPoints"
        :key="point.id"
        :coordinates="[point.lng, point.lat]"
      >
        <template #marker>
          <UTooltip :text="point.name" :open="mapStore.selectedMapPoint?.id === point.id ? true : undefined">
            <Icon
              name="tabler:map-pin-filled"
              size="30"
              class="marker"
              :class="mapStore.selectedMapPoint?.id === point.id ? 'text-primary-500' : 'text-secondary-500'"
              @mouseenter="mapStore.selectedMapPointWithoutFlyTo(point) "
              @mouseleave="mapStore.selectedMapPointWithoutFlyTo(null)"
            />
          </UTooltip>
        </template>
        <mgl-popup>
          <h3 class="popup__title">
            {{ point.name }}
          </h3>
          <p v-if="point.description" class="popup__description">
            {{ point.description }}
          </p>
        </mgl-popup>
      </mgl-marker>
    </MglMap>

    <!-- Loading overlay while the locations are being fetched -->
    <div v-if="mapStore.isLoading" class="map__loading">
      <Icon name="tabler:loader-2" class="map__spinner" />
      <p class="map__loading-text">
        Loading your locations…
      </p>
    </div>
  </div>
</template>

<style scoped>
.map {
  position: relative;
  height: 100%;
  min-height: 280px;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
}

.marker {
  cursor: pointer;
}

.map__loading {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg) 70%, transparent);
  backdrop-filter: blur(2px);
}

.map__spinner {
  font-size: 2rem;
  color: var(--ui-primary);
  animation: map-spin 0.8s linear infinite;
}

.map__loading-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

@keyframes map-spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Popup (theme the default maplibre popup for light/dark) --- */
:deep(.maplibregl-popup-content) {
  border-radius: 0.75rem;
  background: var(--ui-bg);
  color: var(--ui-text);
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.3);
}

:deep(.maplibregl-popup-close-button) {
  padding: 0 0.4rem;
  font-size: 1.1rem;
  color: var(--ui-text-muted);
}

.popup__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-text);
}

.popup__description {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
}
</style>
