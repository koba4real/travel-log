<script setup lang="ts">
const slug = useRoute().params.slug as string;
const logId = Number(useRoute().params.id);
const { locations, locationLogs, locationsPending, locationLogsPending } = storeToRefs(UseLocationsStore());
const isLoading = computed(() => locationsPending.value || locationLogsPending.value);
const location = computed(() => locations.value?.find(l => l.slug === slug));
const locationLog = computed(() => locationLogs.value?.find(log => log.id === logId));
</script>

<template>
  <div class="page-shell page-shell--grow">
    <!-- loading -->
    <div v-if="isLoading" class="center-fill center-fill--grow">
      <Icon name="tabler:loader-2" class="spinner" />
    </div>

    <!-- edit form + map -->
    <div v-else-if="locationLog" class="split-layout">
      <!-- Left: form panel -->
      <section class="form-col">
        <div class="form-panel">
          <p class="eyebrow">
            <UIcon name="tabler:map-pin-cog" class="eyebrow-icon" />
            Edit location log
          </p>
          <h1 class="page-title page-title--sm">
            Edit {{ locationLog.name }}
          </h1>
          <p class="page-subtitle">
            Update the name, description or position of this location log. Drag the marker on the
            map or search for a place to change its coordinates.
          </p>
          <LocationLogForm
            v-if="location"
            :location="location"
            :log="locationLog"
          />
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
          Location Log not found
        </p>
        <p class="state-panel__text">
          The location log you're trying to edit doesn't exist or may have been removed.
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
