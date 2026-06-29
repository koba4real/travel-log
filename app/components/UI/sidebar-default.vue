<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{ collapsed: boolean }>();

const route = useRoute();
const authStore = useAuthStore();
const mapStore = UseMapStore();
const { locationsPending } = storeToRefs(UseLocationsStore());

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Locations",
    icon: "tabler:map-pin",
    to: "/dashboard/location",
    active: route.path === "/dashboard/location",
  },
  {
    label: "Add Location",
    icon: "tabler:circle-plus",
    to: "/dashboard/location/add-location",
    active: route.path === "/dashboard/location/add-location",
  },
]);

const accountItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Logout",
    icon: "tabler:logout",
    onSelect: () => authStore.signOut(),
  },
]);

const locationItems = computed(() =>
  mapStore.mapPoints.map(point => ({
    id: point.id,
    name: point.name,
    to: `/dashboard/location/${point.slug}`,
  })));
</script>

<template>
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
    :items="navItems"
    orientation="vertical"
    :tooltip="true"
  />

  <SidebarPointList
    :items="locationItems"
    :pending="locationsPending"
    icon="tabler:map-pin-filled"
    empty-label="No locations yet"
    :collapsed="collapsed"
  />

  <UNavigationMenu
    :collapsed="collapsed"
    :items="accountItems"
    orientation="vertical"
    class="sidebar__nav--bottom"
    :tooltip="true"
  />
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
