<script setup lang="ts">
import type { SelectLocationLog } from "~~/lib/db/Schema/location-log";
import type { FetchError } from "ofetch";

const slug = useRoute().params.slug as string;
const logId = Number(useRoute().params.id);
const locationsStore = UseLocationsStore();
const { locationLogs, locationLogsStatus } = storeToRefs(UseLocationsStore());
const isLoading = computed(() => locationLogsStatus.value === "pending" || locationLogsStatus.value === "idle");
const locationLog = computed(() => locationLogs.value?.find(log => log.id === logId));
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const { $csrfFetch } = useNuxtApp();
const toast = useToast();
async function deleteLocationLog() {
  isDeleting.value = true;
  try {
    const deletedLog = await $csrfFetch<SelectLocationLog>(`/api/locations/${slug}/${logId}`, { method: "DELETE" });
    await locationsStore.refreshLocationLogs();

    toast.add({
      title: "Log deleted",
      description: `${deletedLog.name} has been deleted.`,
      color: "success",
    });

    showDeleteModal.value = false;
    navigateTo(`/dashboard/location/${slug}`);
  }
  catch (e) {
    const error = e as FetchError;
    toast.add({
      title: "Could not delete log",
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
    <!-- detail + map -->
    <div v-if="locationLog" class="page-shell">
      <header class="page-header">
        <div class="page-heading">
          <div class="location-logs__title-row">
            <h1 class="page-title">
              {{ locationLog.name }}
            </h1>
            <UDropdownMenu
              :items="[
                {
                  label: 'Edit',
                  icon: 'tabler:pencil',
                  to: `/dashboard/location/${slug}/${logId}/edit`,
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
          <p v-if="locationLog.description" class="location-logs__description">
            {{ locationLog.description }}
          </p>
        </div>
      </header>

      <div class="split-layout">
        <section class="content-col">
          <LocationLogCard :log="locationLog" :interactive="false" />
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

    <UModal
      v-model:open="showDeleteModal"
      title="Delete location"
    >
      <template #body>
        <p class="location-logs__modal-text">
          Are you sure you want to delete
          <strong>{{ locationLog?.name }}</strong>? This will also remove its logs and
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
            @click="deleteLocationLog"
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
.location-logs__description {
  margin: 0.5rem 0 0;
  max-width: 60ch;
  font-size: 0.95rem;
  line-height: 1.55;
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
