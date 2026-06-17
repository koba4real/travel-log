<script setup lang="ts">
const locations = ref([
  {
    id: 1,
    name: "New York",
    description: "The city that never sleeps.",
  },
  {
    id: 2,
    name: "Paris",
    description: "The city of love.",
  },
  {
    id: 3,
    name: "Tokyo",
    description: "A bustling metropolis.",
  },
]);
const emptyLocations = ref([]);
</script>

<template>
  <div>
    <h1 class="location-page__title">
      Your Locations
    </h1>
    <p class="location-page__subtitle">
      your location is a place you have traveled or will travel to. It can be a city,
    </p>
    <UContainer>
      <UGrid :cols="3" :gap="4">
        <LocationCard
          v-for="location in locations"
          :key="location.id"
          :location="location"
        />
      </UGrid>

      <UCard v-if="emptyLocations.length === 0" class="flex flex-col items-center justify-center p-8">
        <template #header>
          <Placeholder class="h-8" />
        </template>

        <p class="text-gray-500 text-lg">
          No locations found.
        </p>
        <UButton
          label="Add Location"
          icon="tabler:circle-plus"
          to="/dashboard/location/add-location"
          class="mt-4"
        />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
    </UContainer>
  </div>
</template>

<style scoped>
.location-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}

.location-page__subtitle {
  margin-top: 0.375rem;
  color: var(--ui-text-muted);
}
</style>
