<script setup lang="ts">
const { locations, locationsStatus } = storeToRefs(UseLocationsStore());
const mapStore = UseMapStore();
</script>

<template>
  <div class="locations">
    <!-- Page header (pinned) -->
    <header class="locations__header">
      <div class="locations__heading">
        <p class="locations__eyebrow">
          <UIcon name="tabler:route" class="locations__eyebrow-icon" />
          Travel log
        </p>
        <h1 class="locations__title">
          Your Locations
        </h1>
      </div>
      <UButton
        label="Add Location"
        icon="tabler:circle-plus"
        to="/dashboard/location/add-location"
        color="primary"
        size="lg"
        class="locations__add"
      />
    </header>

    <!-- Split: scrollable places + fixed map -->
    <div class="locations__layout">
      <!-- Left: places (list scrolls internally) -->
      <section class="locations__places">
        <div class="locations__section-head">
          <h2 class="locations__section-title">
            Places
          </h2>
          <span v-if="locations?.length" class="locations__count">
            {{ locations.length }}
          </span>
        </div>

        <div class="locations__scroll">
          <!-- loading -->
          <div v-if="locationsStatus === 'pending'" class="locations__grid">
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
          <div v-else class="locations__empty">
            <span class="locations__empty-icon-wrap">
              <UIcon name="tabler:map-pin-off" class="locations__empty-icon" />
            </span>
            <div class="locations__empty-copy">
              <p class="locations__empty-title">
                No locations yet
              </p>
              <p class="locations__empty-text">
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
      <aside class="locations__map">
        <div class="locations__section-head">
          <h2 class="locations__section-title">
            <UIcon name="tabler:map-2" class="locations__section-icon" />
            On the map
          </h2>
        </div>
        <div class="locations__map-frame">
          <Map />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Fill the dashboard content area; the page itself never scrolls. */
.locations {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 90rem;
  margin-inline: auto;
}

/* ---------- Header (pinned) ---------- */
.locations__header {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--ui-border);
}

.locations__heading {
  min-width: 0;
}

.locations__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-primary);
}

.locations__eyebrow-icon {
  font-size: 1rem;
}

.locations__title {
  margin: 0;
  font-size: clamp(1.625rem, 1.3rem + 1.4vw, 2.125rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
}

.locations__add {
  flex-shrink: 0;
}

/* ---------- Split layout (fills remaining height) ---------- */
.locations__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .locations__layout {
    flex-direction: row;
    align-items: stretch;
  }
}

/* ---------- Section heads (shared) ---------- */
.locations__section-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.locations__section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.locations__section-icon {
  font-size: 1.25rem;
  color: var(--ui-primary);
}

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

/* ---------- Places (internal scroll) ---------- */
.locations__places {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

@media (min-width: 1024px) {
  .locations__places {
    flex: 1.4;
  }
}

.locations__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
  padding-bottom: 0.5rem;
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

/* ---------- Empty state (centered in the scroll area) ---------- */
.locations__empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: 1.25rem;
  background: var(--ui-bg-muted);
}

.locations__empty-icon-wrap {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.locations__empty-icon {
  font-size: 1.75rem;
}

.locations__empty-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.locations__empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.locations__empty-text {
  margin: 0;
  max-width: 34ch;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
}

/* ---------- Map (fills its column / a fixed panel on mobile) ---------- */
.locations__map {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .locations__map {
    flex: 1;
  }
}

.locations__map-frame {
  height: 38vh;
  padding: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.45);
}

@media (min-width: 1024px) {
  .locations__map-frame {
    flex: 1;
    min-height: 0;
    height: auto;
  }
}
</style>
