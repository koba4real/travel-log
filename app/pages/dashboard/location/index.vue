<script setup lang="ts">
const { locations, locationsPending } = storeToRefs(UseLocationsStore());
const mapStore = UseMapStore();
</script>

<template>
  <div class="page-shell">
    <!-- Page header (pinned) -->
    <header class="page-header">
      <div class="page-heading">
        <p class="eyebrow">
          <UIcon name="tabler:route" class="eyebrow-icon" />
          Travel log
        </p>
        <h1 class="page-title">
          Your Locations
        </h1>
      </div>
      <UButton
        label="Add Location"
        icon="tabler:circle-plus"
        to="/dashboard/location/add-location"
        color="primary"
        size="lg"
        class="header-action"
      />
    </header>

    <!-- Split: scrollable places + fixed map -->
    <div class="split-layout">
      <!-- Left: places (list scrolls internally) -->
      <section class="content-col">
        <div class="section-head">
          <h2 class="section-title">
            Places
          </h2>
          <span v-if="locations?.length" class="locations__count">
            {{ locations.length }}
          </span>
        </div>

        <div class="content-scroll">
          <!-- loading -->
          <div v-if="locationsPending" class="locations__grid">
            <USkeleton
              v-for="n in 6"
              :key="n"
              class="locations__skeleton"
            />
          </div>

          <!-- list -->
          <div v-else-if="locations?.length" class="locations__grid">
            <LocationCard
              v-for="location in locations"
              :key="location.id"
              :location="location"
              @click="navigateTo(`/dashboard/location/${location.slug}`)"
              @mouseenter="mapStore.selectedMapPoint = mapStore.mapPoints.find((p) => p.id === location.id) ?? null"
              @mouseleave="mapStore.selectedMapPoint = null"
            />
          </div>

          <!-- empty -->
          <div v-else class="state-panel state-panel--bordered">
            <span class="state-panel__icon-wrap">
              <UIcon name="tabler:map-pin-off" class="state-panel__icon" />
            </span>
            <div class="state-panel__copy">
              <p class="state-panel__title">
                No locations yet
              </p>
              <p class="state-panel__text">
                Start building your travel log by adding your first destination.
              </p>
            </div>
            <UButton
              label="Add Location"
              icon="tabler:circle-plus"
              to="/dashboard/location/add-location"
              color="primary"
            />
          </div>
        </div>
      </section>

      <!-- Right: map (fills height) -->
      <aside class="map-col">
        <div class="section-head">
          <h2 class="section-title">
            <UIcon name="tabler:map-2" class="section-icon" />
            On the map
          </h2>
        </div>
        <div class="map-frame">
          <Map />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.locations__count {
  display: inline-grid;
  place-items: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding-inline: 0.4rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 14%, transparent);
}

.locations__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.25rem;
}

.locations__skeleton {
  height: 15rem;
  border-radius: 1rem;
}
</style>
