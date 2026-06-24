<script setup lang="ts">
import type { SelectLocationLog } from "~~/lib/db/Schema/location-log";

// interactive=false => embedded summary (no link affordances, no title/description);
// the host page's header already shows the name + description.
const props = withDefaults(defineProps<{
  log: Pick<SelectLocationLog, "name" | "description" | "startedAt" | "endedAt">;
  interactive?: boolean;
}>(), { interactive: true });

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const rangeFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const start = computed(() => new Date(props.log.startedAt));
const end = computed(() => new Date(props.log.endedAt));

// Calendar tile reads the trip's start date.
const tile = computed(() => ({
  month: monthFmt.format(start.value).toUpperCase(),
  day: start.value.getDate(),
  year: start.value.getFullYear(),
}));

const rangeLabel = computed(() => `${rangeFmt.format(start.value)} – ${rangeFmt.format(end.value)}`);

const durationLabel = computed(() => {
  const days = Math.max(1, Math.round((end.value.getTime() - start.value.getTime()) / 86_400_000));
  return `${days} ${days === 1 ? "day" : "days"}`;
});
</script>

<template>
  <UCard
    class="log-card"
    :class="{ 'log-card--interactive': interactive }"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <div class="log-card__inner">
      <!-- Calendar-style date tile (trip start) -->
      <div class="log-card__date" aria-hidden="true">
        <span class="log-card__date-month">{{ tile.month }}</span>
        <span class="log-card__date-day">{{ tile.day }}</span>
        <span class="log-card__date-year">{{ tile.year }}</span>
      </div>

      <div class="log-card__body">
        <template v-if="interactive">
          <div class="log-card__head">
            <h3 class="log-card__title">
              {{ log.name }}
            </h3>
            <UIcon name="tabler:arrow-up-right" class="log-card__arrow" />
          </div>

          <p v-if="log.description" class="log-card__description">
            {{ log.description }}
          </p>
        </template>

        <div class="log-card__meta">
          <span class="log-card__range">
            <UIcon name="tabler:calendar-event" class="log-card__range-icon" />
            {{ rangeLabel }}
          </span>
          <span class="log-card__duration">
            <UIcon name="tabler:clock-hour-4" class="log-card__duration-icon" />
            {{ durationLabel }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.log-card {
  overflow: hidden;
  border-radius: 1rem;
}

.log-card--interactive {
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  will-change: transform;
}

.log-card--interactive:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px -16px rgb(0 0 0 / 0.35);
  border-color: var(--ui-primary);
}

.log-card--interactive:focus-within {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.log-card__inner {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  padding: 1rem;
}

/* ---------- Calendar tile ---------- */
.log-card__date {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 4.25rem;
  overflow: hidden;
  text-align: center;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-muted);
}

.log-card__date-month {
  width: 100%;
  padding: 0.3rem 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fff;
  background: linear-gradient(135deg, var(--ui-primary) 0%, color-mix(in oklab, var(--ui-primary) 55%, #7c3aed) 100%);
}

.log-card__date-day {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 0.2rem 0;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  color: var(--ui-text-highlighted);
}

.log-card__date-year {
  padding-bottom: 0.35rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}

/* ---------- Content ---------- */
.log-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.log-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.log-card__title {
  margin: 0;
  overflow: hidden;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--ui-text-highlighted);
}

.log-card__arrow {
  flex-shrink: 0;
  font-size: 1.1rem;
  color: var(--ui-text-muted);
  opacity: 0;
  transform: translate(-4px, 4px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.log-card--interactive:hover .log-card__arrow {
  opacity: 1;
  transform: translate(0, 0);
  color: var(--ui-primary);
}

.log-card__description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--ui-text-muted);

  /* keep cards uniform regardless of copy length */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.log-card__meta {
  margin-top: auto;
  padding-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.85rem;
}

.log-card__range {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ui-text-muted);
}

.log-card__range-icon {
  font-size: 0.95rem;
  color: var(--ui-primary);
}

.log-card__duration {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ui-primary);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}

.log-card__duration-icon {
  font-size: 0.9rem;
}
</style>
