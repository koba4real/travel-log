<script setup lang="ts">
import type { SelectLocation } from "~~/lib/db/Schema/location";
import type { FetchError } from "ofetch";

const slug = useRoute().params.slug as string;
const mapStore = UseMapStore();

const locationsStore = UseLocationsStore();
const { locations, locationsStatus, locationLogs, locationLogsStatus } = storeToRefs(locationsStore);
const location = computed(() => locations.value?.find(l => l.slug === slug));
const isLoading = computed(() => locationsStatus.value === "pending" || locationsStatus.value === "idle");

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const showDeleteModal = ref(false);
const isDeleting = ref(false);

async function deleteLocation() {
  try {
    isDeleting.value = true;
    const deletedLocation = await $csrfFetch<SelectLocation>(`/api/locations/${slug}`, { method: "DELETE" });
    await locationsStore.refreshLocations();

    toast.add({
      title: "Location deleted",
      description: `${deletedLocation.name} has been deleted.`,
      color: "success",
    });

    showDeleteModal.value = false;
    navigateTo("/dashboard/location");
  }
  catch (e) {
    const error = e as FetchError;
    toast.add({
      title: "Could not delete location",
      description: getFetchErrorMessage(error),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="page-fill">
    <!-- loading -->
    <div v-if="isLoading" class="center-fill">
      <Icon name="tabler:loader-2" class="spinner" />
    </div>

    <!-- details + logs -->
    <div v-else-if="location" class="page-shell">
      <header class="page-header">
        <div class="page-heading">
          <p class="eyebrow">
            <UIcon name="tabler:route" class="eyebrow-icon" />
            Travel log
          </p>
          <div class="location-logs__title-row">
            <h1 class="page-title">
              {{ location.name }}
            </h1>
            <UDropdownMenu
              :items="[
                {
                  label: 'Edit',
                  icon: 'tabler:pencil',
                  to: `/dashboard/location/${slug}/edit`,
                },
                {
                  label: 'Delete',
                  icon: 'tabler:trash',
                  color: 'error',
                  onSelect: () => {
                    showDeleteModal = true;
                  },
                },
              ]"
              :content="{ align: 'start', side: 'bottom' }"
              :ui="{ content: 'location-logs__menu' }"
            >
              <UButton
                icon="tabler:dots-vertical"
                color="neutral"
                variant="ghost"
                size="md"
                class="location-logs__menu-btn"
                aria-label="Location options"
              />
            </UDropdownMenu>
          </div>
          <p v-if="location.description" class="location-logs__description">
            {{ location.description }}
          </p>
        </div>
        <UButton
          label="Add Log"
          icon="tabler:circle-plus"
          :to="`/dashboard/location/${slug}/add`"
          color="primary"
          size="lg"
          class="header-action"
        />
      </header>

      <div class="split-layout">
        <section class="content-col">
          <div class="section-head">
            <h2 class="section-title">
              Logs
            </h2>
          </div>

          <div class="content-scroll">
            <!-- loading -->
            <div v-if="locationLogsStatus === 'pending'" class="location-logs__items">
              <USkeleton
                v-for="n in 4"
                :key="n"
                class="location-logs__skeleton"
              />
            </div>

            <!-- list -->
            <div v-else-if="locationLogs?.length" class="location-logs__items">
              <LocationLogCard
                v-for="log in locationLogs"
                :key="log.id"
                :log="log"
                @click="navigateTo(`/dashboard/location/${slug}/${log.id}`)"
                @mouseenter="mapStore.selectedMapPoint = mapStore.mapPoints.find((p) => p.id === log.id) ?? null"
                @mouseleave="mapStore.selectedMapPoint = null"
              />
            </div>

            <!-- empty -->
            <div v-else class="state-panel state-panel--bordered">
              <span class="state-panel__icon-wrap">
                <UIcon name="tabler:notebook" class="state-panel__icon" />
              </span>
              <div class="state-panel__copy">
                <p class="state-panel__title">
                  No logs yet
                </p>
                <p class="state-panel__text">
                  Start documenting this location by adding your first log.
                </p>
              </div>
              <UButton
                label="Click here to add a log"
                icon="tabler:circle-plus"
                :to="`/dashboard/location/${slug}/add`"
                color="primary"
              />
            </div>
          </div>
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
          Location not found
        </p>
        <p class="state-panel__text">
          The location you're looking for doesn't exist or may have been removed.
        </p>
      </div>
      <UButton
        label="Back to locations"
        icon="tabler:arrow-left"
        to="/dashboard/location"
        color="primary"
      />
    </div>

    <UModal
      v-model:open="showDeleteModal"
      title="Delete location"
    >
      <template #body>
        <p class="location-logs__modal-text">
          Are you sure you want to delete
          <strong>{{ location?.name }}</strong>? This will also remove its logs and
          can't be undone.
        </p>
      </template>

      <template #footer>
        <div class="location-logs__modal-actions">
          <UButton
            variant="outline"
            :disabled="isDeleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            icon="tabler:trash"
            :loading="isDeleting"
            @click="deleteLocation"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.location-logs__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Kebab trigger: subtle, lifts on hover. */
.location-logs__menu-btn {
  border-radius: 999px;
  color: var(--ui-text-muted);
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.location-logs__menu-btn:hover {
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
  transform: scale(1.08);
}

.location-logs__description {
  margin: 0.5rem 0 0;
  max-width: 60ch;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

.location-logs__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-logs__skeleton {
  height: 8rem;
  border-radius: 1rem;
}

/* ---------- Delete confirmation modal ---------- */
.location-logs__modal-text {
  margin: 0;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

.location-logs__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
