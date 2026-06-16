<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <div class="dashboard-home">
    <h1 class="dashboard-home__title">
      Welcome back{{ authStore.user ? `, ${authStore.user.name}` : "" }}
    </h1>
    <p class="dashboard-home__subtitle">
      Here's an overview of your travel log.
    </p>
  </div>
</template>

<style scoped>
.dashboard-home__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}

.dashboard-home__subtitle {
  margin-top: 0.375rem;
  color: var(--ui-text-muted);
}
</style>
