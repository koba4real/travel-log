<script setup lang="ts">
const slug = useRoute().params.slug as string;
// Resolve the location from the list we already fetch into the store
// (same pattern as the detail page) — no dedicated GET endpoint needed.
const { locations, locationsStatus } = storeToRefs(UseLocationsStore());
const location = computed(() => locations.value?.find(l => l.slug === slug));
const isLoading = computed(() => locationsStatus.value === "pending" || locationsStatus.value === "idle");
</script>

<template>
  <div class="edit-location-page">
    <!-- loading -->
    <div v-if="isLoading" class="edit-location__loading">
      <Icon name="tabler:loader-2" class="spinner" />
    </div>

    <!-- edit form + map -->
    <div v-else-if="location" class="edit-location-page__layout">
      <!-- Left: form panel -->
      <section class="edit-location-page__form-col">
        <div class="edit-location-page__panel">
          <p class="edit-location-page__eyebrow">
            <UIcon name="tabler:map-pin-cog" class="edit-location-page__eyebrow-icon" />
            Edit location
          </p>
          <h1 class="edit-location-page__title">
            Edit {{ location.name }}
          </h1>
          <p class="edit-location-page__subtitle">
            Update the name, description or position of this location. Drag the marker on the
            map or search for a place to change its coordinates.
          </p>
          <LocationForm :location="location" />
        </div>
      </section>

      <!-- Right: map (takes the majority of the page) -->
      <aside class="edit-location-page__map">
        <div class="edit-location-page__section-head">
          <h2 class="edit-location-page__section-title">
            <UIcon name="tabler:map-2" class="edit-location-page__section-icon" />
            On the map
          </h2>
        </div>
        <div class="edit-location-page__map-frame">
          <Map />
        </div>
      </aside>
    </div>

    <!-- not found -->
    <div v-else class="edit-location__not-found">
      <span class="edit-location__not-found-icon-wrap">
        <UIcon name="tabler:map-pin-off" class="edit-location__not-found-icon" />
      </span>
      <div class="edit-location__not-found-copy">
        <p class="edit-location__not-found-title">
          Location not found
        </p>
        <p class="edit-location__not-found-text">
          The location you're trying to edit doesn't exist or may have been removed.
        </p>
      </div>
      <UButton
        label="Back to locations"
        icon="tabler:arrow-left"
        to="/dashboard/location"
        color="primary"
      />
    </div>
  </div>
</template>

<style scoped>
/* Fill the dashboard content area; grows + scrolls on small screens. */
.edit-location-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 90rem;
  margin-inline: auto;
}

/* ---------- Loading ---------- */
.edit-location__loading {
  flex: 1;
  display: grid;
  place-items: center;
}

/* ---------- Split layout (fills available height) ---------- */
.edit-location-page__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .edit-location-page__layout {
    flex-direction: row;
    align-items: stretch;
  }
}

/* ---------- Left: form column ---------- */
.edit-location-page__form-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (min-width: 1024px) {
  .edit-location-page__form-col {
    flex: 1;
    max-width: 34rem;
    min-height: 0;
    overflow-y: auto;
    padding-right: 0.25rem;
  }
}

/* The framed card that holds the form. */
.edit-location-page__panel {
  position: relative;
  overflow: hidden;
  padding: clamp(1.25rem, 0.9rem + 1.5vw, 2rem);
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -28px rgb(0 0 0 / 0.45);
}

/* Accent bar along the top of the panel. */
.edit-location-page__panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: linear-gradient(90deg, var(--ui-primary), color-mix(in oklab, var(--ui-primary) 30%, transparent));
}

.edit-location-page__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-primary);
}

.edit-location-page__eyebrow-icon {
  font-size: 1rem;
}

.edit-location-page__title {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ui-text-highlighted);
}

.edit-location-page__subtitle {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

/* ---------- Right: map (majority of the page) ---------- */
.edit-location-page__map {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .edit-location-page__map {
    flex: 2;
  }
}

.edit-location-page__section-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.edit-location-page__section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.edit-location-page__section-icon {
  font-size: 1.25rem;
  color: var(--ui-primary);
}

.edit-location-page__map-frame {
  height: clamp(18rem, 50vh, 34rem);
  padding: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.45);
}

@media (min-width: 1024px) {
  .edit-location-page__map-frame {
    flex: 1;
    min-height: 0;
    height: auto;
  }
}

/* ---------- Not found ---------- */
.edit-location__not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.edit-location__not-found-icon-wrap {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.edit-location__not-found-icon {
  font-size: 1.75rem;
}

.edit-location__not-found-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.edit-location__not-found-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.edit-location__not-found-text {
  margin: 0;
  max-width: 34ch;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
}
</style>
