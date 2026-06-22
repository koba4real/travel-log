<script setup lang="ts">
import type { SelectLocation } from "~~/lib/db/Schema/location";
import type { FetchError } from "ofetch";

const slug = useRoute().params.slug as string;
const mapStore = UseMapStore();

const locationsStore = UseLocationsStore();
const { locations, locationsStatus } = storeToRefs(locationsStore);
const location = computed(() => locations.value?.find(l => l.slug === slug));
const isLoading = computed(() => locationsStatus.value === "pending" || locationsStatus.value === "idle");
const { $csrfFetch } = useNuxtApp();
const toast = useToast();
watchEffect(() => {
  mapStore.selectedMapPoint = mapStore.mapPoints.find(p => p.slug === slug) || null;
});

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
  <div class="location-logs-page">
    <!-- loading -->
    <div v-if="isLoading" class="location-logs__loading">
      <Icon name="tabler:loader-2" class="location-logs__spinner" />
    </div>

    <!-- details + logs -->
    <div v-else-if="location" class="location-logs">
      <header class="location-logs__header">
        <div class="location-logs__heading">
          <p class="location-logs__eyebrow">
            <UIcon name="tabler:route" class="location-logs__eyebrow-icon" />
            Travel log
          </p>
          <div class="location-logs__title-row">
            <h1 class="location-logs__title">
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
          class="location-logs__add"
        />
      </header>

      <div class="location-logs__layout">
        <section class="location-logs__list">
          <div class="location-logs__section-head">
            <h2 class="location-logs__section-title">
              Logs
            </h2>
          </div>

          <div class="location-logs__scroll">
            <!-- Logs are a later story, so the location has none to show yet. -->
            <div class="location-logs__empty">
              <span class="location-logs__empty-icon-wrap">
                <UIcon name="tabler:notebook" class="location-logs__empty-icon" />
              </span>
              <div class="location-logs__empty-copy">
                <p class="location-logs__empty-title">
                  No logs yet
                </p>
                <p class="location-logs__empty-text">
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

        <aside class="location-logs__map">
          <div class="location-logs__section-head">
            <h2 class="location-logs__section-title">
              <UIcon name="tabler:map-2" class="location-logs__section-icon" />
              On the map
            </h2>
          </div>
          <div class="location-logs__map-frame">
            <Map />
          </div>
        </aside>
      </div>
    </div>

    <!-- not found -->
    <div v-else class="location-logs__not-found">
      <span class="location-logs__not-found-icon-wrap">
        <UIcon name="tabler:map-pin-off" class="location-logs__not-found-icon" />
      </span>
      <div class="location-logs__not-found-copy">
        <p class="location-logs__not-found-title">
          Location not found
        </p>
        <p class="location-logs__not-found-text">
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
/* Wrapper so the loading / details / not-found states each fill the content area. */
.location-logs-page {
  height: 100%;
}

/* ---------- Loading ---------- */
.location-logs__loading {
  height: 100%;
  display: grid;
  place-items: center;
}

.location-logs__spinner {
  font-size: 2rem;
  color: var(--ui-primary);
  animation: location-logs-spin 0.8s linear infinite;
}

@keyframes location-logs-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fill the dashboard content area; the page itself never scrolls. */
.location-logs {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 90rem;
  margin-inline: auto;
}

/* ---------- Header (pinned) ---------- */
.location-logs__header {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--ui-border);
}

.location-logs__heading {
  min-width: 0;
}

.location-logs__eyebrow {
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

.location-logs__eyebrow-icon {
  font-size: 1rem;
}

.location-logs__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-logs__title {
  margin: 0;
  font-size: clamp(1.625rem, 1.3rem + 1.4vw, 2.125rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
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

.location-logs__add {
  flex-shrink: 0;
}

/* ---------- Split layout (fills remaining height) ---------- */
.location-logs__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .location-logs__layout {
    flex-direction: row;
    align-items: stretch;
  }
}

/* ---------- Section heads (shared) ---------- */
.location-logs__section-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.location-logs__section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.location-logs__section-icon {
  font-size: 1.25rem;
  color: var(--ui-primary);
}

/* ---------- Logs (internal scroll) ---------- */
.location-logs__list {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

@media (min-width: 1024px) {
  .location-logs__list {
    flex: 1.4;
  }
}

.location-logs__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
  padding-bottom: 0.5rem;
}

/* ---------- Empty state (centered in the scroll area) ---------- */
.location-logs__empty {
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

.location-logs__empty-icon-wrap {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.location-logs__empty-icon {
  font-size: 1.75rem;
}

.location-logs__empty-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-logs__empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.location-logs__empty-text {
  margin: 0;
  max-width: 34ch;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
}

/* ---------- Map (fills its column / a fixed panel on mobile) ---------- */
.location-logs__map {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .location-logs__map {
    flex: 1;
  }
}

.location-logs__map-frame {
  height: 38vh;
  padding: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.45);
}

@media (min-width: 1024px) {
  .location-logs__map-frame {
    flex: 1;
    min-height: 0;
    height: auto;
  }
}

/* ---------- Not found ---------- */
.location-logs__not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.location-logs__not-found-icon-wrap {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.location-logs__not-found-icon {
  font-size: 1.75rem;
}

.location-logs__not-found-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-logs__not-found-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.location-logs__not-found-text {
  margin: 0;
  max-width: 34ch;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
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
