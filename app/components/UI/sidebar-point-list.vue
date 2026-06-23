<script setup lang="ts">
// A map-linked nav list shared by the sidebar's locations and logs views:
// loading skeletons, one button per point (hover highlights its map marker), empty state.
type SidebarPoint = { id: number; name: string; to: string };

defineProps<{
  items: SidebarPoint[];
  pending: boolean;
  icon: string;
  emptyLabel: string;
  collapsed: boolean;
}>();

const mapStore = UseMapStore();
</script>

<template>
  <div class="sidebar__list">
    <template v-if="pending">
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="sidebar__skeleton"
      />
    </template>
    <template v-else-if="items.length">
      <UTooltip
        v-for="item in items"
        :key="item.id"
        :text="item.name"
        :disabled="!collapsed"
      >
        <UButton
          :label="collapsed ? undefined : item.name"
          :icon="icon"
          :color="mapStore.selectedMapPoint?.id === item.id ? 'primary' : 'neutral'"
          variant="ghost"
          block
          :square="collapsed"
          :class="{ sidebar__item: !collapsed }"
          @click="navigateTo(item.to)"
          @mouseenter="mapStore.selectedMapPoint = mapStore.mapPoints.find((p) => p.id === item.id) ?? null"
          @mouseleave="mapStore.selectedMapPoint = null"
        />
      </UTooltip>
    </template>
    <p v-else-if="!collapsed" class="sidebar__empty">
      {{ emptyLabel }}
    </p>
  </div>
</template>

<style scoped>
.sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

/* Left-align the label/icon to match the nav menu items above
   (block buttons default to justify-center). */
.sidebar__item {
  justify-content: flex-start;
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
