<script setup lang="ts">
const route = useRoute();
const logId = Number(route.params.id);
const slug = route.params.slug as string;
const locationsStore = UseLocationsStore();
const { locationLogs, locationLogsStatus } = storeToRefs(locationsStore);
const isLoading = computed(() => locationLogsStatus.value === "pending" || locationLogsStatus.value === "idle");
const locationLog = computed(() => locationLogs.value?.find(log => log.id === logId));
</script>

<template>
  <div class="page-fill">
    <!-- loading -->
    <div v-if="isLoading" class="center-fill">
      <Icon name="tabler:loader-2" class="spinner" />
    </div>
    <!-- detail + map -->
    <div v-if="locationLog" class="page-shell">
      <header class="page-header">
        <div class="page-heading">
          <p class="eyebrow">
            <UIcon name="tabler:route" class="eyebrow-icon" />
            Travel log
          </p>
          <h1 class="page-title">
            {{ locationLog.name }}
          </h1>
        </div>
        <UButton
          label="Back"
          icon="tabler:arrow-left"
          :to="`/dashboard/location/${slug}`"
          color="neutral"
          variant="ghost"
          class="header-action"
        />
      </header>

      <div class="split-layout">
        <section class="content-col">
          <LocationLogCard :log="locationLog" />
        </section>

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

    <!-- not found -->
    <div v-else class="state-panel">
      <span class="state-panel__icon-wrap">
        <UIcon name="tabler:map-pin-off" class="state-panel__icon" />
      </span>
      <div class="state-panel__copy">
        <p class="state-panel__title">
          Log not found
        </p>
        <p class="state-panel__text">
          The log you're looking for doesn't exist or may have been removed.
        </p>
      </div>
      <UButton
        label="Back to location"
        icon="tabler:arrow-left"
        :to="`/dashboard/location/${slug}`"
        color="primary"
      />
    </div>
  </div>
</template>
