<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import type { SelectLocation } from "~~/lib/db/Schema/location";
import type { FetchError } from "ofetch";
import type * as z from "zod";

import { locationSchema } from "~~/lib/db/Schema/location";

type Schema = z.input<typeof locationSchema>;

// No `location` => create mode; a `location` => edit mode.
const props = defineProps<{ location?: SelectLocation }>();
const isEdit = computed(() => !!props.location);

// Brescia, Italy — the draft marker's starting spot when creating.
const DEFAULT_DRAFT_POINT = { lat: 45.541553, lng: 10.211802 };

const { $csrfFetch } = useNuxtApp();
const locationsStore = UseLocationsStore();
const mapStore = UseMapStore();
const toast = useToast();
const form = useTemplateRef("form");
const loading = ref(false);

const initialState: Partial<Schema> = {
  name: props.location?.name ?? "",
  description: props.location?.description ?? "",
  lat: props.location?.lat ?? DEFAULT_DRAFT_POINT.lat,
  long: props.location?.long ?? DEFAULT_DRAFT_POINT.lng,
};
const state = reactive<Partial<Schema>>({ ...initialState });

const isDirty = computed(() =>
  state.name !== initialState.name
  || (state.description ?? "") !== initialState.description
  || state.lat !== initialState.lat
  || state.long !== initialState.long);

function resetForm() {
  Object.assign(state, initialState);
  form.value?.clear();
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = initialState.lat!;
    mapStore.addedPoint.lng = initialState.long!;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    const saved = isEdit.value
      ? await $csrfFetch<SelectLocation>(`/api/locations/${props.location!.slug}`, { method: "PATCH", body: event.data })
      : await $csrfFetch<SelectLocation>("/api/locations", { method: "POST", body: event.data });
    await locationsStore.refreshLocations();

    toast.add({
      title: isEdit.value ? "Location updated" : "Location added",
      description: `${event.data.name} has been saved.`,
      color: "success",
    });
    resetForm();
    navigateTo(isEdit.value ? `/dashboard/location/${saved.slug}` : "/dashboard/location");
  }
  catch (e) {
    const error = e as FetchError;
    toast.add({
      title: isEdit.value ? "Could not update location" : "Could not add location",
      description: getFetchErrorMessage(error),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    loading.value = false;
  }
}

const showLeaveModal = ref(false);
let leaveTo = "";

onBeforeRouteLeave((to) => {
  if (!isDirty.value)
    return true;
  leaveTo = to.fullPath;
  showLeaveModal.value = true;
  return false;
});

function resolveLeave(leave: boolean) {
  showLeaveModal.value = false;
  if (leave) {
    resetForm();
    navigateTo(leaveTo);
  }
}

// Drive the draft marker from this form: seed it on mount, clear it on leave.
onMounted(() => {
  mapStore.addedPoint = {
    // Edit reuses the real id so the map can hide its (duplicate) saved marker;
    // create uses a sentinel that won't collide with any saved location.
    id: props.location?.id ?? -1,
    name: props.location?.name || "Draft Location",
    description: "Drag the marker to the location you want to add.",
    lat: initialState.lat!,
    lng: initialState.long!,
  };
});
onUnmounted(() => {
  mapStore.addedPoint = null;
});

// Keep the form's coordinates in step with the draft marker (drag / double-click).
effect(() => {
  if (mapStore.addedPoint) {
    state.lat = mapStore.addedPoint.lat;
    state.long = mapStore.addedPoint.lng;
  }
});

// A location picked from the search box: fill the form and zoom the map into it.
function onSearchSelect(location: { name: string; lat: number; lng: number }) {
  state.name = location.name;
  state.lat = location.lat;
  state.long = location.lng;
  mapStore.goToSearchResult({ id: -1, ...location });
}
</script>

<template>
  <div class="add-location-form-container">
    <UForm
      ref="form"
      :schema="locationSchema"
      :state="state"

      class="add-location-form"
      @submit="onSubmit"
    >
      <UFormField label="Location Name" name="name">
        <UInput
          v-model="state.name"
          icon="tabler:map-pin"
          placeholder="Enter location name"
          class="add-location-form__control"
        />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea
          v-model="state.description"
          placeholder="Describe this location..."
          class="add-location-form__control"
          :rows="3"
        />
      </UFormField>

      <div class="map-hint">
        <Icon name="tabler:hand-finger" class="map-hint__icon" />
        <span>
          You can also set the location by dragging the
          <Icon name="tabler:map-pin-filled" class="map-hint__pin" />
          marker on the map, or double click.
        </span>
      </div>

      <div v-if="state.lat && state.long" class="coord-readout">
        <Icon name="tabler:current-location" class="coord-readout__icon" />
        <span class="coord-readout__label">Marker position</span>
        <span class="coord-readout__value">{{ state.lat.toFixed(4) }}, {{ state.long.toFixed(4) }}</span>
      </div>

      <div class="add-location-form__actions">
        <UButton
          type="submit"
          :icon="isEdit ? 'tabler:device-floppy' : 'tabler:plus'"
          :loading="loading"
        >
          {{ isEdit ? "Save changes" : "Add Location" }}
        </UButton>

        <UButton
          variant="outline"
          :disabled="loading"
          @click="resetForm"
        >
          {{ isEdit ? "Reset" : "Clear" }}
        </UButton>
      </div>
    </UForm>
    <SearchLocation class="add-location-form__search" @select="onSearchSelect" />

    <UModal
      v-model:open="showLeaveModal"
      title="Unsaved changes"
      @close="resolveLeave(false)"
    >
      <template #body>
        <p class="add-location-page__subtitle">
          You have unsaved changes. Leave without saving?
        </p>
      </template>

      <template #footer>
        <div class="add-location-form__actions">
          <UButton variant="outline" @click="resolveLeave(false)">
            Stay
          </UButton>
          <UButton color="error" @click="resolveLeave(true)">
            Leave
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Used by the "unsaved changes" modal body. */
.add-location-page__subtitle {
  margin-top: 0.375rem;
  color: var(--ui-text-muted);
}

.add-location-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  max-width: 42rem;
}

.add-location-form__control {
  width: 100%;
}

.add-location-form__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .add-location-form__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.add-location-form__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* "Drag the marker" hint — a soft, dashed callout. */
.map-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 60%, transparent);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--ui-text-muted);
}

.map-hint__icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  font-size: 1.125rem;
  color: var(--ui-primary);
}

.map-hint__pin {
  vertical-align: -0.15em;
  color: var(--ui-error);
}

/* Live coordinate readout — a compact pill with monospaced values. */
.coord-readout {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: var(--ui-bg-elevated);
  font-size: 0.8125rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.coord-readout__icon {
  font-size: 1rem;
  color: var(--ui-primary);
}

.coord-readout__label {
  color: var(--ui-text-muted);
}

.coord-readout__value {
  font-family: ui-monospace, "SFMono-Regular", "Menlo", monospace;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ui-text-highlighted);
}

.add-location-form__search {
  margin-top: 1.5rem;
}
</style>
