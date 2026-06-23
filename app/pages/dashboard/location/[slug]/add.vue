<script setup lang="ts">
const slug = useRoute().params.slug as string;
const { locations, locationsStatus } = storeToRefs(UseLocationsStore());
const location = computed(() => locations.value?.find(l => l.slug === slug));
const isLoading = computed(() => locationsStatus.value === "pending" || locationsStatus.value === "idle");
</script>

<template>
  <div class="page-shell page-shell--grow">
    <!-- loading -->
    <div v-if="isLoading" class="center-fill center-fill--grow">
      <Icon name="tabler:loader-2" class="spinner" />
    </div>

    <!-- add-log form + map -->
    <div v-else-if="location" class="split-layout">
      <!-- Left: form panel -->
      <section class="form-col">
        <div class="form-panel">
          <p class="eyebrow">
            <UIcon name="tabler:notebook" class="eyebrow-icon" />
            New log
          </p>
          <h1 class="page-title page-title--sm">
            Add a log to {{ location.name }}
          </h1>
          <p class="page-subtitle">
            Document a trip to this location: give it a title, describe what happened
            and set the dates. Drag the marker on the map to pin where it took place.
          </p>
          <LocationLogForm :location="location" />
        </div>
      </section>

      <!-- Right: map (takes the majority of the page) -->
      <aside class="map-col map-col--wide">
        <div class="section-head">
          <h2 class="section-title">
            <UIcon name="tabler:map-2" class="section-icon" />
            On the map
          </h2>
        </div>
        <div class="map-frame map-frame--tall">
          <Map />
        </div>
      </aside>
    </div>

    <!-- not found -->
    <div v-else class="state-panel state-panel--grow">
      <span class="state-panel__icon-wrap">
        <UIcon name="tabler:map-pin-off" class="state-panel__icon" />
      </span>
      <div class="state-panel__copy">
        <p class="state-panel__title">
          Location not found
        </p>
        <p class="state-panel__text">
          The location you're adding a log to doesn't exist or may have been removed.
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
