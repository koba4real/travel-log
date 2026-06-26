<script setup lang="ts">
defineProps<{
  imageSrc: string;
  imageAlt: string;
}>();
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
  </UCard>
</template>

<style scoped>
.image-card {
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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
</style>
