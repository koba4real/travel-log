<script setup lang="ts">
const route = useRoute();
const isLocationView = computed(() => typeof route.params.slug === "string");
const isLogView = computed(() => typeof route.params.id === "string");
</script>

<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
  >
    <template #default="{ collapsed }">
      <UDashboardSidebarCollapse />

      <SidebarLocationLog v-if="isLogView" :collapsed="collapsed" />
      <SidebarLocation v-else-if="isLocationView" :collapsed="collapsed" />
      <SidebarDefault v-else :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
