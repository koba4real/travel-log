<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{ collapsed: boolean }>();

const route = useRoute();
const locationsStore = UseLocationsStore();
const { locations } = storeToRefs(locationsStore);

const slug = computed(() => route.params.slug as string);
const logId = computed(() => Number(route.params.id));
const locationName = computed(() => locations.value?.find(l => l.slug === slug.value)?.name);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: `Back to ${locationName.value ?? "location"}`,
    icon: "tabler:arrow-left",
    to: `/dashboard/location/${slug.value}`,
  },
  {
    label: "View log",
    icon: "tabler:eye",
    to: `/dashboard/location/${slug.value}/${logId.value}`,
  },
  {
    label: "Edit log",
    icon: "tabler:pencil",
    to: `/dashboard/location/${slug.value}/${logId.value}/edit`,
  },
]);
</script>

<template>
  <UNavigationMenu
    :collapsed="collapsed"
    :items="navItems"
    orientation="vertical"
    :tooltip="true"
  />
</template>

<style scoped>
.sidebar-log__modal-text {
  margin: 0;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

.sidebar-log__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
