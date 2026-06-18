<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import type * as z from "zod";

import { locationSchema } from "~~/lib/db/Schema/location";

type Schema = z.input<typeof locationSchema>;
const { $csrfFetch } = useNuxtApp();
const locationsStore = UseLocationsStore();
const state = reactive<Partial<Schema>>({ name: "", description: "", lat: undefined, long: undefined });
const form = useTemplateRef("form");
const toast = useToast();
const loading = ref(false);

const isDirty = computed(() =>
  state.name !== ""
  || state.lat !== undefined
  || state.long !== undefined
  || state.description !== "",
);

function resetForm() {
  Object.assign(state, { name: "", description: "", lat: undefined, long: undefined });
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

      <div class="add-location-form__grid">
        <UFormField label="Latitude" name="lat">
          <UInput
            v-model.number="state.lat"
            type="number"
            step="any"
            placeholder="-90 to 90"
            class="add-location-form__control"
          />
        </UFormField>

        <UFormField label="Longitude" name="long">
          <UInput
            v-model.number="state.long"
            type="number"
            step="any"
            placeholder="-180 to 180"
            class="add-location-form__control"
          />
        </UFormField>
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
.add-location-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}

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
</style>
