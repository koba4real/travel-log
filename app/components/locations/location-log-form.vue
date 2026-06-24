<script lang="ts" setup>
import type { SelectLocation } from "~~/lib/db/Schema/location";
import type { InsertLocationLog, SelectLocationLog } from "~~/lib/db/Schema/location-log";

import { locationLogSchema } from "~~/lib/db/Schema/location-log";

const props = defineProps<{ location: SelectLocation; log?: SelectLocationLog }>();
const isEdit = computed(() => !!props.log);
const locationsStore = UseLocationsStore();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();

// epoch ms -> "YYYY-MM-DD" for the native date input
function toDateInput(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

const initialValues: InsertLocationLog = {
  name: props.log?.name ?? "",
  description: props.log?.description ?? "",
  startedAt: props.log?.startedAt ? toDateInput(props.log.startedAt) : "",
  endedAt: props.log?.endedAt ? toDateInput(props.log.endedAt) : "",
  lat: props.log?.lat ?? props.location.lat,
  long: props.log?.long ?? props.location.long,
};

const marker = computed(() => ({
  id: props.log?.id ?? -1, // sentinel — won't collide with any saved marker
  name: props.log?.name || "Draft Log",
  description: "Drag the marker to where this log happened.",
}));

async function onSubmit(values: InsertLocationLog) {
  const saved = isEdit.value
    ? await $csrfFetch<SelectLocationLog>(`/api/locations/${props.location.slug}/${props.log!.id}`, {
        method: "PATCH",
        body: values,
      })
    : await $csrfFetch<SelectLocationLog>(`/api/locations/${props.location.slug}/logs`, {
        method: "POST",
        body: values,
      });
  toast.add({
    title: isEdit.value ? "Log updated" : "Log added",
    description: `${saved.name} has been saved.`,
    color: "success",
  });
  await locationsStore.refreshLocationLogs();
  await navigateTo(isEdit.value
    ? `/dashboard/location/${props.location.slug}/${saved.id}`
    : `/dashboard/location/${props.location.slug}`);
}
</script>

<template>
  <LocationBaseForm
    :schema="locationLogSchema"
    :initial-values="initialValues"
    :on-submit="onSubmit"
    :submit-label="isEdit ? 'Save changes' : 'Add Log'"
    :submit-icon="isEdit ? 'tabler:device-floppy' : 'tabler:plus'"
    :marker="marker"
    :error-title="isEdit ? 'Could not update log' : 'Could not add log'"
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
