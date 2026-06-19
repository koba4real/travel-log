<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import type * as z from "zod";

import { locationSchema } from "~~/lib/db/Schema/location";

type Schema = z.input<typeof locationSchema>;
const { $csrfFetch } = useNuxtApp();
const locationsStore = UseLocationsStore();
const mapStore = UseMapStore();
const state = reactive<Partial<Schema>>({ name: "", description: "", lat: undefined, long: undefined });
const form = useTemplateRef("form");
const toast = useToast();
const loading = ref(false);

const isDirty = computed(() =>
  state.name !== ""
  || state.description !== "");

function resetForm() {
  Object.assign(state, { name: "", description: "" });
  form.value?.clear();
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    await $csrfFetch("/api/locations", { method: "POST", body: event.data });
    await locationsStore.refreshLocations();

    toast.add({ title: "Location added", description: `${event.data.name} has been saved.`, color: "success" });
    resetForm();
    navigateTo("/dashboard/location");
  }
  catch (e) {
    const error = e as FetchError;
    toast.add({
      title: "Could not add location",
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
          icon="tabler:plus"
          :loading="loading"
        >
          Add Location
        </UButton>

        <UButton
          variant="outline"
          :disabled="loading"
          @click="resetForm"
        >
          Clear
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
