<script lang="ts" setup>
import type { InsertLocation, SelectLocation } from "~~/lib/db/Schema/location";

import { locationSchema } from "~~/lib/db/Schema/location";

// No `location` => create mode; a `location` => edit mode.
const props = defineProps<{ location?: SelectLocation }>();
const isEdit = computed(() => !!props.location);

// Brescia, Italy — the draft marker's starting spot when creating.
const DEFAULT_DRAFT_POINT = { lat: 45.541553, long: 10.211802 };

const { $csrfFetch } = useNuxtApp();
const locationsStore = UseLocationsStore();
const toast = useToast();

const initialValues: InsertLocation = {
  name: props.location?.name ?? "",
  description: props.location?.description ?? "",
  lat: props.location?.lat ?? DEFAULT_DRAFT_POINT.lat,
  long: props.location?.long ?? DEFAULT_DRAFT_POINT.long,
};

const marker = computed(() => ({
  id: props.location?.id ?? -1,
  name: props.location?.name || "Draft Location",
  description: "Drag the marker to the location you want to add.",
}));

async function onSubmit(values: InsertLocation) {
  const saved = isEdit.value
    ? await $csrfFetch<SelectLocation>(`/api/locations/${props.location!.slug}`, { method: "PATCH", body: values })
    : await $csrfFetch<SelectLocation>("/api/locations", { method: "POST", body: values });
  await locationsStore.refreshLocations();
  toast.add({
    title: isEdit.value ? "Location updated" : "Location added",
    description: `${values.name} has been saved.`,
    color: "success",
  });
  await navigateTo(isEdit.value ? `/dashboard/location/${saved.slug}` : "/dashboard/location");
}
</script>

<template>
  <LocationBaseForm
    :schema="locationSchema"
    :initial-values="initialValues"
    :on-submit="onSubmit"
    :submit-label="isEdit ? 'Save changes' : 'Add Location'"
    :submit-icon="isEdit ? 'tabler:device-floppy' : 'tabler:plus'"
    :marker="marker"
    :error-title="isEdit ? 'Could not update location' : 'Could not add location'"
  >
    <template #default="{ state, loading }">
      <UFormField label="Location Name" name="name">
        <UInput
          v-model="state.name"
          icon="tabler:map-pin"
          placeholder="Enter location name"
          :disabled="loading"
          class="point-form__control"
        />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea
          v-model="state.description"
          placeholder="Describe this location..."
          :rows="3"
          :disabled="loading"
          class="point-form__control"
        />
      </UFormField>
    </template>
  </LocationBaseForm>
</template>
