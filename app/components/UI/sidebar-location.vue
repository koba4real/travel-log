<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{ collapsed: boolean }>();

const route = useRoute();
const { locations, locationLogs, locationLogsPending } = storeToRefs(UseLocationsStore());

const slug = computed(() => route.params.slug as string);
const locationName = computed(() => locations.value?.find(l => l.slug === slug.value)?.name);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Locations",
    icon: "tabler:arrow-left",
    to: "/dashboard/location",
  },
  {
    label: locationName.value ?? "Location",
    icon: "tabler:map-pin-filled",
    to: `/dashboard/location/${slug.value}`,
  },
  {
    label: "Edit location",
    icon: "tabler:pencil",
    to: `/dashboard/location/${slug.value}/edit`,
  },
  {
    label: "Add log",
    icon: "tabler:circle-plus",
    to: `/dashboard/location/${slug.value}/add`,
  },
]);

const logItems = computed(() =>
  (locationLogs.value ?? []).map(log => ({
    id: log.id,
    name: log.name,
    to: `/dashboard/location/${slug.value}/${log.id}`,
  })));
</script>

<template>
  <UNavigationMenu
    :collapsed="collapsed"
    :items="navItems"
    orientation="vertical"
    :tooltip="true"
  />

  <SidebarPointList
    :items="logItems"
    :pending="locationLogsPending"
    icon="tabler:notebook"
    empty-label="No logs yet"
    :collapsed="collapsed"
  />
</template>
