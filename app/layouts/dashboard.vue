<script lang="ts" setup>
const authStore = useAuthStore();
await authStore.init();
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
