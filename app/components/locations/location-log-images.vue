<script setup lang="ts">
const image = ref<File | null>(null);
const preview = computed(() => image.value ? URL.createObjectURL(image.value) : undefined);

async function onUpload() {
  if (!image.value || !preview.value)
    return;

  // Create an in-memory image object from the preview URL.
  const previewImage = new Image();

  // Once the image is loaded, resize and compress it.
  previewImage.addEventListener("load", async () => {
    // Limit the maximum width to 1000px while preserving aspect ratio.
    const width = Math.min(previewImage.width, 1000);

    // Create a resized bitmap version of the image.
    const resized = await createImageBitmap(previewImage, {
      resizeWidth: width,
    });

    // Draw the resized image onto an offscreen canvas.
    const canvas = new OffscreenCanvas(
      resized.width,
      resized.height,
    );

    canvas
      .getContext("bitmaprenderer")
      ?.transferFromImageBitmap(resized);

    // Convert the canvas into a compressed JPEG blob.
    // This blob can then be uploaded to a server.
    // const blob =
    await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.9,
    });

    // TODO: Upload blob to backend
  });

  // Trigger image loading from the preview URL.
  previewImage.src = preview.value;
}
</script>

<template>
  <UFileUpload
    v-slot="{ open, removeFile }"
    v-model="image"
    accept="image/*"
    :interactive="false"
    class="gap-4"
  >
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">
        <UIcon name="tabler:photo" class="section-icon" />
        Photos
      </h2>

      <UButton
        :label="image ? 'Upload image' : 'Add photo'"
        :icon="image ? 'tabler:cloud-upload' : 'tabler:plus'"
        :color="image ? 'primary' : 'neutral'"
        :variant="image ? 'solid' : 'outline'"
        @click="image ? onUpload() : open()"
      />
    </div>

    <button
      v-if="!image"
      type="button"
      class="flex min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-default text-muted transition-colors hover:bg-elevated/25"
      @click="open()"
    >
      <UIcon name="tabler:upload" class="size-6" />
      <span>Drag &amp; drop an image here, or click to browse</span>
      <span class="text-xs">PNG, JPG, GIF or WebP &mdash; large photos are auto-resized</span>
    </button>

    <figure v-else class="flex flex-col overflow-hidden rounded-lg border border-default bg-elevated">
      <img
        :src="preview"
        :alt="image.name"
        class="max-h-72 w-full object-contain bg-muted"
      >
      <figcaption class="flex items-center justify-between gap-3 px-3 py-2.5">
        <span class="truncate font-medium">{{ image.name }}</span>
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
</template>
