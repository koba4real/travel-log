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
          <UTooltip :text="point.label">
            <Icon
              name="tabler:map-pin-filled"
              size="30"
              class="text-secondary-500"
            />
          </UTooltip>
        </template>
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
</style>
