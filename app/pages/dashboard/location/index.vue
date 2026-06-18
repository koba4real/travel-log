<script setup lang="ts">
const { locations, locationsStatus } = storeToRefs(UseLocationsStore());
</script>

<template>
  <div class="location-page">
    <UContainer>
      <header class="location-page__header">
        <div class="location-page__heading">
          <h1 class="location-page__title">
            Your Locations
          </h1>
          <p class="location-page__subtitle">
            your location is a place you have traveled or will travel to. It can be a city,
          </p>
        </div>
        <UButton
          label="Add Location"
          icon="tabler:circle-plus"
          to="/dashboard/location/add-location"
          color="primary"
          class="location-page__add"
        />
      </header>

      <div v-if="locationsStatus === 'pending' && !locations?.length" class="location-grid">
        <USkeleton
          v-for="n in 6"
          :key="n"
          class="location-grid__skeleton"
        />
      </div>

      <div v-else-if="locations?.length" class="location-grid">
        <LocationCard
          v-for="location in locations"
          :key="location.id"
          :location="location"
        />
      </div>

      <UCard v-else class="location-empty">
        <div class="location-empty__body">
          <span class="location-empty__icon-wrap">
            <UIcon name="tabler:map-pin-off" class="location-empty__icon" />
          </span>
          <div class="location-empty__copy">
            <p class="location-empty__title">
              No locations yet
            </p>
            <p class="location-empty__text">
              Start building your travel log by adding your first destination.
            </p>
          </div>
          <UButton
            label="Add Location"
            icon="tabler:circle-plus"
            to="/dashboard/location/add-location"
            color="primary"
            class="location-empty__action"
          />
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<style scoped>
.location-page {
  padding-block: 1.5rem;
}

.location-page__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.location-page__heading {
  min-width: 0;
}

.location-page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ui-text-highlighted);
}

.location-page__subtitle {
  margin-top: 0.5rem;
  max-width: 48ch;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

.location-page__add {
  flex-shrink: 0;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.location-grid__skeleton {
  height: 17rem;
  border-radius: 1rem;
}

.location-empty {
  margin-top: 1.5rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: 1rem;
  background: var(--ui-bg-muted);
}

.location-empty__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-block: 3rem;
  text-align: center;
}

.location-empty__icon-wrap {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.location-empty__icon {
  font-size: 1.75rem;
}

.location-empty__copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-empty__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.location-empty__text {
  margin: 0;
  max-width: 38ch;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
}

.location-empty__action {
  margin-top: 0.5rem;
}
</style>
