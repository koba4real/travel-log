<script setup lang="ts">
import type { FetchError } from "ofetch";

const config = useRuntimeConfig();
const image = ref<File | null>(null);
const preview = computed(() => image.value ? URL.createObjectURL(image.value) : undefined);
const loading = ref(false);
const route = useRoute();
const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const locationStore = UseLocationsStore();
const { CurrentLocationLog, CurrentLocationLogStatus } = storeToRefs(locationStore);

const imgs = computed(() =>
  (CurrentLocationLog.value?.images ?? []).map(img =>
    `${config.public.s3BucketUrl}/${img.key}`));

const lightboxVisible = ref(false);
const lightboxIndex = ref(0);

function showImg(index: number) {
  lightboxIndex.value = index;
  lightboxVisible.value = true;
}
function onIndexChange(_oldIndex: number, newIndex: number) {
  lightboxIndex.value = newIndex;
}

async function getChecksum(blob: Blob) {
  const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function onUpload() {
  if (!image.value)
    return;

  const file = image.value;
  loading.value = true;
  try {
    // Cap width at 1000px (keeping aspect ratio) and re-encode as compressed JPEG.
    const bitmap = await createImageBitmap(file);
    const width = Math.min(bitmap.width, 1000);
    const height = Math.round(bitmap.height * (width / bitmap.width));

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });

    // Ask the server for a presigned POST (404s here if the location/log is invalid).
    const { url, fields, key } = await $csrfFetch<{ url: string; fields: Record<string, string>; key: string }>(
      `/api/locations/${route.params.slug}/${route.params.id}/sign-image`,
      {
        method: "POST",
        body: { checksum: await getChecksum(blob), contentLength: blob.size },
      },
    );

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", blob);

    await $fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "x-amz-checksum-algorithm": "SHA256",
      },
    });

    await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}/image`, {
      method: "POST",
      body: {
        key,
      },
    });

    await locationStore.refreshCurrentLocationLog();
    image.value = null;

    toast.add({
      title: "Image uploaded",
      description: `${file.name} has been added to this log.`,
      color: "success",
      icon: "tabler:circle-check",
    });
  }
  catch (e) {
    // Any step (resize, signing, S3 upload, or DB confirmation) lands here;
    // getFetchErrorMessage surfaces the server's reason, or a generic fallback.
    toast.add({
      title: "Upload failed",
      description: getFetchErrorMessage(e as FetchError),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <UFileUpload
    v-slot="{ open, removeFile }"
    v-model="image"
    accept="image/*"
    :interactive="false"
    class="image-upload"
  >
    <div class="upload-header">
      <div class="upload-heading">
        <h2 class="section-title">
          <UIcon name="tabler:photo" class="section-icon" />
          Photos
        </h2>
        <span class="photo-count">{{ CurrentLocationLog?.images?.length || 0 }}</span>
      </div>

      <UButton
        :label="image ? 'Upload image' : 'Add photo'"
        :icon="image ? 'tabler:cloud-upload' : 'tabler:plus'"
        :color="image ? 'primary' : 'neutral'"
        :variant="image ? 'solid' : 'outline'"
        :loading="loading"
        @click="image ? onUpload() : open()"
      />
    </div>

    <button
      v-if="!image"
      type="button"
      class="dropzone"
      @click="open()"
    >
      <UIcon name="tabler:upload" class="dropzone__icon" />
      <span>Drag &amp; drop an image here, or click to browse</span>
      <span class="dropzone__hint">PNG, JPG, GIF or WebP &mdash; large photos are auto-resized</span>
    </button>

    <figure v-else class="preview">
      <img
        :src="preview"
        :alt="image.name"
        class="preview__img"
      >
      <div v-if="loading" class="preview__overlay">
        <UIcon name="tabler:loader-2" class="spinner" />
      </div>
      <figcaption class="preview__caption">
        <span class="preview__name">{{ image.name }}</span>
        <UButton
          label="Remove"
          icon="tabler:trash"
          color="error"
          variant="ghost"
          size="sm"
          @click="removeFile()"
        />
      </figcaption>
    </figure>
  </UFileUpload>
  <!-- loading: avoids flashing the empty state while a log's photos are fetched -->
  <div v-if="CurrentLocationLogStatus === 'pending'" class="gallery-loading">
    <UIcon name="tabler:loader-2" class="spinner" />
  </div>
  <section v-else-if="CurrentLocationLog?.images?.length" class="gallery">
    <LocationLogImageCard
      v-for="(photo, index) in CurrentLocationLog.images"
      :key="photo.id"
      :image-id="photo.id"
      :image-src="imgs[index]!"
      :image-alt="`Photo ${photo.id} for log ${CurrentLocationLog.id}`"
      @view="showImg(index)"
    />
  </section>
  <!-- empty -->
  <div v-else class="state-panel state-panel--bordered gallery-empty">
    <span class="state-panel__icon-wrap">
      <UIcon name="tabler:photo-off" class="state-panel__icon" />
    </span>
    <div class="state-panel__copy">
      <p class="state-panel__title">
        No images yet
      </p>
      <p class="state-panel__text">
        Start logging your travel experiences by adding your first image.
      </p>
    </div>
  </div>

  <VueEasyLightbox
    :visible="lightboxVisible"
    :imgs="imgs"
    :index="lightboxIndex"
    loop
    @hide="lightboxVisible = false"
    @on-index-change="onIndexChange"
  />
  <!-- The lightbox has no built-in counter; overlay one above its mask (z-index 9998). -->
  <Teleport to="body">
    <div v-if="lightboxVisible" class="lightbox-count">
      {{ lightboxIndex + 1 }} / {{ imgs.length }}
    </div>
  </Teleport>
</template>

<style scoped>
.image-upload {
  gap: 1rem;
}

.upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.upload-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photo-count {
  font-weight: 600;
  color: var(--ui-success, var(--color-green-600));
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  min-height: 12rem;
  border: 1px dashed var(--ui-border);
  border-radius: 0.5rem;
  color: var(--ui-text-muted);
  cursor: pointer;
  transition: background-color 0.15s;
}

.dropzone:hover {
  background: color-mix(in oklab, var(--ui-bg-elevated) 25%, transparent);
}

.dropzone__icon {
  font-size: 1.5rem;
}

.dropzone__hint {
  font-size: 0.75rem;
}

.preview {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  background: var(--ui-bg-elevated);
}

.preview__img {
  width: 100%;
  max-height: 18rem;
  object-fit: contain;
  background: var(--ui-bg-muted);
}

.preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--ui-bg) 60%, transparent);
}

.preview__caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
}

.preview__name {
  min-width: 0;
  overflow: hidden;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.75rem;
}

/* The shared .state-panel fills its parent's height (for full-page
   "not found" views); inline under the uploader it should size to its
   own content instead. */
.gallery-empty {
  height: auto;
  padding: 2rem 1.5rem;
}

.gallery-loading {
  display: flex;
  justify-content: center;
  padding: 2rem 1.5rem;
  font-size: 1.5rem;
  color: var(--ui-text-muted);
}

/* Teleported to body, so position: fixed is viewport-relative; sits above the
   lightbox mask (z-index 9998). */
.lightbox-count {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.55);
  color: white;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
</style>
