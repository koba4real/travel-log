<template>
  <div class="add-location-page">
    <h1 class="add-location-page__title">
      Add a new location
    </h1>
    <p class="add-location-page__subtitle">
      A location is a place you have traveled or will travel to. It can be a city,
      country, state or point of interest. You can add specific times you visited
      this location after adding it.
    </p>
    <AddLocationForm />
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
</style>
