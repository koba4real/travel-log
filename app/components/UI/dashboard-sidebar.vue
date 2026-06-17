<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const authStore = useAuthStore();
const route = useRoute();

const items = computed<NavigationMenuItem[][]>(() => [
  [{
    label: "Home",
    icon: "tabler:home",
    to: "/dashboard",
    active: route.path === "/dashboard",
  }, {
    label: "Locations",
    icon: "tabler:map-pin",
    to: "/dashboard/location",
    active: route.path === "/dashboard/location",
  }, {
    label: "Add Location",
    icon: "tabler:circle-plus",
    to: "/dashboard/location/add-location",
    active: route.path === "/dashboard/location/add-location",
  }],
  [{
    label: "Settings",
    icon: "tabler:settings",
  }, {
    label: "Logout",
    icon: "tabler:logout",
    onSelect: () => authStore.signOut(),
  }],
]);
</script>

<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
  >
    <template #default="{ collapsed }">
      <UDashboardSidebarCollapse />
      <UButton
        :label="collapsed ? undefined : 'Search...'"
        icon="tabler:search"
        color="neutral"
        variant="outline"
        block
        :square="collapsed"
      >
        <template v-if="!collapsed" #trailing>
          <div class="sidebar__kbd">
            <UKbd value="meta" variant="subtle" />
            <UKbd value="K" variant="subtle" />
          </div>
        </template>
      </UButton>

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="sidebar__nav--bottom"
      />
    </template>
  </UDashboardSidebar>
</template>

<style scoped>
.sidebar__kbd {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin-inline-start: auto;
}

.sidebar__nav--bottom {
  margin-top: auto;
}
</style>
