<script setup lang="ts">
import type { FetchError } from "ofetch";

const { imageId } = defineProps<{
  imageSrc: string;
  imageAlt: string;
  imageId: number;
}>();
const locationStore = UseLocationsStore();
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const route = useRoute();

async function deleteImage() {
  isDeleting.value = true;
  try {
    await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}/image/${imageId}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Image deleted",
      color: "success",
      icon: "tabler:circle-check",
      description: "The image has been removed from this log.",
    });

    await locationStore.refreshCurrentLocationLog();
  }
  catch (e) {
    const error = e as FetchError;
    toast.add({
      title: "Could not delete location log image",
      description: getFetchErrorMessage(error),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
}
</script>

<template>
  <UCard
    class="image-card"
    :ui="{ body: 'p-0' }"
  >
    <img
      :src="imageSrc"
      :alt="imageAlt"
      class="image-card__img"
    >
    <UButton
      icon="tabler:trash"
      size="md"
      color="error"
      variant="solid"
      class="image-card__delete"
      @click="showDeleteModal = true"
    >
      delete
    </UButton>
  </UCard>
  <UModal
    v-model:open="showDeleteModal"
    title="Delete location log image"
  >
    <template #body>
      <p class="location-logs__modal-text">
        Are you sure you want to delete this image? It will be removed and can't be undone.
      </p>
      <img
        :src="imageSrc"
        :alt="imageAlt"
        class="location-logs__modal-preview"
      >
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
          @click="deleteImage"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.image-card {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.image-card__delete {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-card__delete,
.image-card:focus-within .image-card__delete {
  opacity: 1;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.12);
}

.image-card__img {
  display: block;
  width: 100%;
  /* Square tile, but the whole image is shown inside it — no cropping. */
  aspect-ratio: 1;
  object-fit: contain;
  background: var(--ui-bg-muted);
}

.location-logs__modal-text {
  /* Long URLs were stretching/overflowing the modal. */
  word-break: break-word;
}

.location-logs__modal-preview {
  display: block;
  width: 100%;
  max-height: 16rem;
  margin-top: 0.75rem;
  border-radius: var(--ui-radius);
  object-fit: contain;
  background: var(--ui-bg-muted);
}

.location-logs__modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
