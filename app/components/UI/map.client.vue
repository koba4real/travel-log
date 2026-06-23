<script lang="ts" setup>
import type { MglEvent } from "@indoorequal/vue-maplibre-gl";
import type { LngLat, LngLatLike } from "maplibre-gl";

const mapStore = UseMapStore();
const colorMode = useColorMode();
const style = computed(() =>
  colorMode.value === "dark"
    ? "/styles/dark.json"
    : "https://tiles.openfreemap.org/styles/liberty",
);
// Brescia, Italy — MapLibre expects [lng, lat]
const center = [10.211802, 45.541553] as LngLatLike;
const zoom = 4;
const visibleMapPoints = computed(() =>
  mapStore.mapPoints.filter(point => point.id !== mapStore.addedPoint?.id),
);

function updateAddedPointCoordinates(coordinates: LngLat) {
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = coordinates.lat;
    mapStore.addedPoint.long = coordinates.lng;
  }
}
function onMapDoubleClick(event: MglEvent<"dblclick">) {
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = event.event.lngLat.lat;
    mapStore.addedPoint.long = event.event.lngLat.lng;
  }
}
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
      @map:dblclick="onMapDoubleClick"
    >
      <MglNavigationControl />
      <mgl-marker
        v-if="mapStore.addedPoint"
        :draggable="true"
        :coordinates="[mapStore.addedPoint?.long ?? 10.211802, mapStore.addedPoint?.lat ?? 45.541553]"
        @update:coordinates="updateAddedPointCoordinates"
      >
        <template #marker>
          <UTooltip>
            <Icon
              name="tabler:map-pin-filled"
              size="40"
              class="marker marker--draft"
            />
          </UTooltip>
        </template>
        <mgl-popup>
          <h3 class="popup__title">
            please drag the marker to the location
          </h3>
        </mgl-popup>
      </mgl-marker>
      <mgl-marker
        v-for="point in visibleMapPoints"
        :key="point.id"
        :coordinates="[point.long, point.lat]"
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
          <nuxt-link
            v-if="point.to"
            :to="point.to"
            class="popup__link"
          >
            View details
            <Icon name="tabler:arrow-right" class="popup__link-icon" />
          </nuxt-link>
        </mgl-popup>
      </mgl-marker>
    </MglMap>

    <!-- Loading overlay while the locations are being fetched -->
    <div v-if="mapStore.isLoading" class="map__loading">
      <Icon name="tabler:loader-2" class="spinner" />
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

/* The draggable "pick a spot" pin — stands out from the saved markers. */
.marker--draft {
  color: var(--ui-error);
  cursor: grab;
  filter: drop-shadow(0 2px 6px color-mix(in oklab, var(--ui-error) 55%, transparent));
}

.marker--draft:active {
  cursor: grabbing;
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

.map__loading-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

/* --- Popup (theme the default maplibre popup for light/dark) --- */
:deep(.maplibregl-popup-content) {
  min-width: 11rem;
  padding: 0.85rem 1rem 0.95rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.875rem;
  background: var(--ui-bg);
  color: var(--ui-text);
  box-shadow: 0 14px 32px -12px rgb(0 0 0 / 0.5);
}

/* Match the little pointer triangle to the popup background, whichever
   side maplibre anchors it to. */
:deep(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
  border-top-color: var(--ui-bg);
}

:deep(.maplibregl-popup-anchor-top .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
  border-bottom-color: var(--ui-bg);
}

:deep(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
  border-right-color: var(--ui-bg);
}

:deep(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
  border-left-color: var(--ui-bg);
}

:deep(.maplibregl-popup-close-button) {
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0.3rem;
  right: 0.3rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--ui-text-muted);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

:deep(.maplibregl-popup-close-button:hover) {
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
}

.popup__title {
  margin: 0;
  padding-right: 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--ui-text-highlighted);
}

.popup__description {
  margin: 0.3rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--ui-text-muted);
}

.popup__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.85rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.55rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
  transition:
    gap 0.15s ease,
    background 0.15s ease;
}

.popup__link:hover {
  gap: 0.45rem;
  background: color-mix(in oklab, var(--ui-primary) 20%, transparent);
}

.popup__link-icon {
  font-size: 0.95rem;
}
</style>
