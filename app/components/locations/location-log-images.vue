<script setup lang="ts">
const image = ref<File | null>(null);
</script>

<template>
  <section class="log-images">
    <div class="log-images__head">
      <h2 class="section-title">
        <UIcon name="tabler:photo" class="section-icon" />
        Photos
      </h2>
    </div>
    <UFileUpload
      v-model="image"
      accept="image/*"
      icon="tabler:upload"
      color="primary"
      size="lg"
      layout="grid"
      highlight
      label="Drop your image here"
      description="SVG, PNG, JPG or GIF (max. 2MB)"
      class="log-images__upload"
    >
      <template #actions="{ open }">
        <UButton
          label="Select image"
          icon="tabler:upload"
          color="neutral"
          variant="outline"
          @click="open()"
        />
      </template>
    </UFileUpload>
  </section>
</template>

<style scoped>
.log-images {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-images__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.log-images__upload {
  width: 100%;
  min-height: 12rem;
}
</style>
