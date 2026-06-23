<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const authStore = useAuthStore();
const route = useRoute();
const { locationsPending } = storeToRefs(UseLocationsStore());
const mapStore = UseMapStore();

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

const locationLinks = computed<NavigationMenuItem[]>(() => {
  const { slug } = route.params;
  if (typeof slug !== "string")
    return [];

  const name = mapStore.mapPoints.find(point => point.slug === slug)?.name;
  return [
    {
      label: "Locations",
      icon: "tabler:arrow-left",
      to: "/dashboard/location",
    },
    {
      label: name ?? "Location",
      icon: "tabler:map-pin-filled",
      to: `/dashboard/location/${slug}`,

    },
    {
      label: "Edit location",
      icon: "tabler:pencil",
      to: `/dashboard/location/${slug}/edit`,
    },
    {
      label: "Add log",
      icon: "tabler:circle-plus",
      to: `/dashboard/location/${slug}/add`,
    },
  ];
});
</script>

<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
  >
    <template #default="{ collapsed }">
      <UDashboardSidebarCollapse />

      <!-- On a location detail page, the sidebar is just that location's links. -->
      <UNavigationMenu
        v-if="locationLinks.length"
        :collapsed="collapsed"
        :items="locationLinks"
        orientation="vertical"
        :tooltip="true"
      />

      <!-- Otherwise: search, primary nav, the location list, account controls. -->
      <template v-else>
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
          :tooltip="true"
        />

        <div class="sidebar__locations">
          <template v-if="locationsPending">
            <USkeleton
              v-for="n in 4"
              :key="n"
              class="sidebar__skeleton"
            />
          </template>
          <template v-else-if="mapStore.mapPoints.length">
            <UTooltip
              v-for="point in mapStore.mapPoints"
              :key="point.id"
              :text="point.name"
              :disabled="!collapsed"
            >
              <UButton
                :label="collapsed ? undefined : point.name"
                icon="tabler:map-pin-filled"
                :color="mapStore.selectedMapPoint?.id === point.id ? 'primary' : 'neutral'"
                variant="ghost"
                block
                :square="collapsed"
                :class="{ sidebar__location: !collapsed }"
                @click="navigateTo(`/dashboard/location/${point.slug}`)"
                @mouseenter="mapStore.selectedMapPoint = point"
                @mouseleave="mapStore.selectedMapPoint = null"
              />
            </UTooltip>
          </template>
          <p v-else-if="!collapsed" class="sidebar__empty">
            No locations yet
          </p>
        </div>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[1]"
          orientation="vertical"
          class="sidebar__nav--bottom"
          :tooltip="true"
        />
      </template>
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

.sidebar__locations {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

/* Left-align the label/icon to match the nav menu items above
   (block buttons default to justify-center). */
.sidebar__location {
  justify-content: flex-start;
}

.sidebar__nav--bottom {
  margin-top: auto;
}
.sidebar__skeleton {
  height: 2.5rem;
  margin-block: 0.25rem;
}
.sidebar__empty {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  text-align: center;
  margin-block-start: 0.5rem;
}
</style>
