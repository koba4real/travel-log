<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const authStore = useAuthStore();
const route = useRoute();
const { locationsStatus } = storeToRefs(UseLocationsStore());
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
const locationsPending = computed(() => locationsStatus.value === "pending");
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
        :tooltip="true"
      />

      <!-- Middle section: user's locations -->
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
