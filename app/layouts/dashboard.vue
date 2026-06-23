<script lang="ts" setup>
const authStore = useAuthStore();
await authStore.init();
// Locations load client-side via the store's lazy fetch (see use-locations.ts) so the
// sidebar/list show a skeleton; awaiting them here would re-introduce the empty SSR flash.
</script>

<template>
  <UDashboardGroup :ui="{ base: 'flex-col' }">
    <TheHeader />

    <div class="dashboard-body">
      <DashboardSidebar />

      <UMain class="dashboard-content">
        <slot />
      </UMain>
    </div>
  </UDashboardGroup>
</template>

<style scoped>
.dashboard-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}
</style>
