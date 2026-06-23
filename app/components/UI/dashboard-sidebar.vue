<script setup lang="ts">
const route = useRoute();
const isLocationView = computed(() => typeof route.params.slug === "string");
</script>

<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
  >
    <template #default="{ collapsed }">
      <UDashboardSidebarCollapse />

      <SidebarLocation v-if="isLocationView" :collapsed="collapsed" />
      <SidebarDefault v-else :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
