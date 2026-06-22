<script lang="ts" setup generic="T extends LngLatItem & { name: string }">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { LngLatItem } from "~~/lib/types";
import type { FetchError } from "ofetch";
import type { ZodType } from "zod";

const props = defineProps<{
  schema: ZodType<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void>; // saves, then navigates away
  submitLabel: string;
  submitIcon: string;
  marker: { id: number; name: string; description: string };
  errorTitle: string; // toast title on failure
}>();

const mapStore = UseMapStore();
const toast = useToast();
const form = useTemplateRef("form");
const loading = ref(false);

let submitted = false;
const state = reactive<T>({ ...props.initialValues });

async function handleSubmit(event: FormSubmitEvent<T>) {
  loading.value = true;
  submitted = true;
  try {
    await props.onSubmit(event.data);
  }
  catch (e) {
    submitted = false;
    toast.add({
      title: props.errorTitle,
      description: getFetchErrorMessage(e as FetchError),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(state, props.initialValues);
  form.value?.clear();
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = props.initialValues.lat;
    mapStore.addedPoint.long = props.initialValues.long;
  }
}

const showLeaveModal = ref(false);
let leaveTo = "";

onBeforeRouteLeave((to) => {
  if (submitted || !form.value?.dirty)
    return true;
  leaveTo = to.fullPath;
  showLeaveModal.value = true;
  return false;
});

function confirmLeave() {
  submitted = true;
  showLeaveModal.value = false;
  navigateTo(leaveTo);
}
function cancelLeave() {
  showLeaveModal.value = false;
}

// Drive the draft marker from this form: seed it on mount, clear it on leave.
onMounted(() => {
  mapStore.addedPoint = {
    ...props.marker,
    lat: props.initialValues.lat,
    long: props.initialValues.long,
  };
});
onUnmounted(() => {
  mapStore.addedPoint = null;
});

// Keep the form's coordinates in step with the draft marker (drag / double-click).
effect(() => {
  if (mapStore.addedPoint) {
    state.lat = mapStore.addedPoint.lat;
    state.long = mapStore.addedPoint.long;
  }
});

// A place picked from the search box repositions the marker and seeds the name.
function onSearchSelect(result: { name: string; lat: number; long: number }) {
  state.name = result.name;
  state.lat = result.lat;
  state.long = result.long;
  mapStore.goToSearchResult({ id: -1, ...result });
}
</script>

<template>
  <div class="point-form-container">
    <UForm
      ref="form"
      :schema="schema"
      :state="state"
      class="point-form"
      @submit="handleSubmit"
    >
      <slot :state="state" :loading="loading" />

      <div class="map-hint">
        <Icon name="tabler:hand-finger" class="map-hint__icon" />
        <span>
          Set the position by dragging the
          <Icon name="tabler:map-pin-filled" class="map-hint__pin" />
          marker on the map, or double click.
        </span>
      </div>

      <div v-if="state.lat && state.long" class="coord-readout">
        <Icon name="tabler:current-location" class="coord-readout__icon" />
        <span class="coord-readout__label">Marker position</span>
        <span class="coord-readout__value">{{ state.lat.toFixed(4) }}, {{ state.long.toFixed(4) }}</span>
      </div>

      <div class="point-form__actions">
        <UButton
          type="submit"
          :icon="submitIcon"
          :loading="loading"
        >
          {{ submitLabel }}
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

    <SearchLocation class="point-form__search" @select="onSearchSelect" />

    <UModal
      v-model:open="showLeaveModal"
      title="Unsaved changes"
      @close="cancelLeave"
    >
      <template #body>
        <p class="point-form__modal-text">
          You have unsaved changes. Leave without saving?
        </p>
      </template>

      <template #footer>
        <div class="point-form__actions">
          <UButton variant="outline" @click="cancelLeave">
            Stay
          </UButton>
          <UButton color="error" @click="confirmLeave">
            Leave
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.point-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  max-width: 42rem;
}

/* Inputs/textareas placed in the default slot stretch to the column. */
.point-form :deep(.point-form__control) {
  width: 100%;
}

.point-form__actions {
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

.point-form__search {
  margin-top: 1.5rem;
}

.point-form__modal-text {
  margin-top: 0.375rem;
  color: var(--ui-text-muted);
}
</style>
