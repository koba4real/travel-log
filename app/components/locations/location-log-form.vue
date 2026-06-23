<script lang="ts" setup>
import type { SelectLocation } from "~~/lib/db/Schema/location";
import type { InsertLocationLog, SelectLocationLog } from "~~/lib/db/Schema/location-log";

import { locationLogSchema } from "~~/lib/db/Schema/location-log";

// A log is always created for an existing location, so the parent is required.
const props = defineProps<{ location: SelectLocation }>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();

// A new log starts pinned on its parent location; the user can drag the marker
// (or search) to the exact spot the log happened.
const initialValues: InsertLocationLog = {
  name: "",
  description: "",
  startedAt: "",
  endedAt: "",
  lat: props.location.lat,
  long: props.location.long,
};

const marker = {
  id: -1, // sentinel — won't collide with any saved location marker
  name: "Draft Log",
  description: "Drag the marker to where this log happened.",
};

const locationsStore = UseLocationsStore();

async function onSubmit(values: InsertLocationLog) {
  const saved = await $csrfFetch<SelectLocationLog>(`/api/locations/${props.location.slug}/logs`, {
    method: "POST",
    body: values,
  });
  toast.add({
    title: "Log added",
    description: `${saved.name} has been saved.`,
    color: "success",
  });
  await locationsStore.refreshLocationLogs();
  await navigateTo(`/dashboard/location/${props.location.slug}`);
}
</script>

<template>
  <LocationBaseForm
    :schema="locationLogSchema"
    :initial-values="initialValues"
    :on-submit="onSubmit"
    submit-label="Add Log"
    submit-icon="tabler:plus"
    :marker="marker"
    error-title="Could not add log"
  >
    <template #default="{ state, loading }">
      <UFormField label="Title" name="name">
        <UInput
          v-model="state.name"
          icon="tabler:notebook"
          placeholder="Give this log a title"
          :disabled="loading"
          class="point-form__control"
        />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea
          v-model="state.description"
          placeholder="Describe what happened here..."
          :rows="3"
          :disabled="loading"
          class="point-form__control"
        />
      </UFormField>

      <div class="log-form__grid">
        <UFormField label="Start date" name="startedAt">
          <UInput
            v-model="state.startedAt"
            type="date"
            icon="tabler:calendar-event"
            :disabled="loading"
            class="point-form__control"
          />
        </UFormField>

        <UFormField label="End date" name="endedAt">
          <UInput
            v-model="state.endedAt"
            type="date"
            icon="tabler:calendar-check"
            :disabled="loading"
            class="point-form__control"
          />
        </UFormField>
      </div>
    </template>
  </LocationBaseForm>
</template>

<style scoped>
.log-form__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .log-form__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
