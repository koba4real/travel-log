<script setup lang="ts">
import type { SelectLocation } from "~~/lib/db/Schema/location";

defineProps<{
  location: Pick<SelectLocation, "name" | "description">;
}>();
</script>

<template>
  <UCard
    class="location-card"
    :ui="{ header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <div class="location-card__banner">
        <span class="location-card__glow" />
        <UIcon name="tabler:map-pin" class="location-card__pin" />
      </div>
    </template>

    <div class="location-card__content">
      <h2 class="location-card__title">
        {{ location.name }}
      </h2>
      <p class="location-card__description">
        {{ location.description }}
      </p>
    </div>

    <template #footer>
      <div class="location-card__footer">
        <span class="location-card__meta">
          <UIcon name="tabler:world" class="location-card__meta-icon" />
          Destination
        </span>
        <UButton
          label="View"
          icon="tabler:arrow-right"
          trailing
          size="sm"
          color="primary"
          variant="ghost"
          class="location-card__action"
        />
      </div>
    </template>
  </UCard>
</template>

<style scoped>
.location-card {
  overflow: hidden;
  border-radius: 1rem;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  will-change: transform;
}

.location-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px -16px rgb(0 0 0 / 0.35);
  border-color: var(--ui-primary);
}

.location-card:focus-within {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

/* full-bleed gradient banner (header padding removed via :ui) */
.location-card__banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 7rem;
  overflow: hidden;
  background: linear-gradient(135deg, var(--ui-primary) 0%, color-mix(in oklab, var(--ui-primary) 55%, #7c3aed) 100%);
}

.location-card__glow {
  position: absolute;
  inset: -40% 55% 40% -10%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.35), transparent 60%);
  pointer-events: none;
}

.location-card:hover .location-card__pin {
  transform: scale(1.08);
}

.location-card__pin {
  position: relative;
  font-size: 2.25rem;
  color: #fff;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.3));
  transition: transform 0.25s ease;
}

.location-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
}

.location-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ui-text-highlighted);
}

.location-card__description {
  margin: 0;
  font-size: 0.925rem;
  line-height: 1.55;
  color: var(--ui-text-muted);

  /* keep cards uniform height regardless of copy length */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.location-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ui-text-muted);
}

.location-card__meta-icon {
  font-size: 1rem;
  color: var(--ui-primary);
}
</style>
