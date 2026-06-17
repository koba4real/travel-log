<script setup lang="ts">
defineProps<{
  location: {
    id: number;
    name: string;
    description: string;
  };
}>();
</script>

<template>
  <UCard class="location-card">
    <template #header>
      <Placeholder class="h-8" />
    </template>

    <div class="location-card__content">
      <h2 class="location-card__title">
        {{ location.name }}
      </h2>
      <p class="location-card__description">
        {{ location.description }}
      </p>
    </div>

    <template #footer>
      <Placeholder class="h-8" />
    </template>
  </UCard>
</template>

<style scoped>
.location-card__content {
  padding: 1rem;
}
</style>
