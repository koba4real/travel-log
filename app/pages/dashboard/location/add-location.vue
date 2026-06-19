<script setup lang="ts">
const mapStore = UseMapStore();
onMounted(() => {
  mapStore.addedPoint = {
    id: 1,
    name: "Draft Location",
    description: "Drag the marker to the location you want to add.",
    lat: 45.541553,
    lng: 10.211802,
  };
});
onBeforeRouteLeave(() => {
  mapStore.addedPoint = null;
});
</script>

<template>
  <div class="add-location-page">
    <div class="add-location-page__layout">
      <!-- Left: form panel -->
      <section class="add-location-page__form-col">
        <div class="add-location-page__panel">
          <p class="add-location-page__eyebrow">
            <UIcon name="tabler:map-pin-plus" class="add-location-page__eyebrow-icon" />
            New location
          </p>
          <h1 class="add-location-page__title">
            Add a new location
          </h1>
          <p class="add-location-page__subtitle">
            A location is a place you have traveled or will travel to. It can be a city,
            country, state or point of interest. You can add specific times you visited
            this location after adding it.
          </p>
          <AddLocationForm />
        </div>
      </section>

      <!-- Right: map (takes the majority of the page) -->
      <aside class="add-location-page__map">
        <div class="add-location-page__section-head">
          <h2 class="add-location-page__section-title">
            <UIcon name="tabler:map-2" class="add-location-page__section-icon" />
            On the map
          </h2>
        </div>
        <div class="add-location-page__map-frame">
          <Map />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Fill the dashboard content area; grows + scrolls on small screens. */
.add-location-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 90rem;
  margin-inline: auto;
}

/* ---------- Split layout (fills available height) ---------- */
.add-location-page__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .add-location-page__layout {
    flex-direction: row;
    align-items: stretch;
  }
}

/* ---------- Left: form column ---------- */
.add-location-page__form-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (min-width: 1024px) {
  .add-location-page__form-col {
    flex: 1;
    max-width: 34rem;
    min-height: 0;
    overflow-y: auto;
    padding-right: 0.25rem;
  }
}

/* The framed card that holds the form. */
.add-location-page__panel {
  position: relative;
  overflow: hidden;
  padding: clamp(1.25rem, 0.9rem + 1.5vw, 2rem);
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -28px rgb(0 0 0 / 0.45);
}

/* Accent bar along the top of the panel. */
.add-location-page__panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: linear-gradient(90deg, var(--ui-primary), color-mix(in oklab, var(--ui-primary) 30%, transparent));
}

.add-location-page__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-primary);
}

.add-location-page__eyebrow-icon {
  font-size: 1rem;
}

.add-location-page__title {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ui-text-highlighted);
}

.add-location-page__subtitle {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

/* ---------- Right: map (majority of the page) ---------- */
.add-location-page__map {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .add-location-page__map {
    flex: 2;
  }
}

.add-location-page__section-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.add-location-page__section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.add-location-page__section-icon {
  font-size: 1.25rem;
  color: var(--ui-primary);
}

.add-location-page__map-frame {
  height: clamp(18rem, 50vh, 34rem);
  padding: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.45);
}

@media (min-width: 1024px) {
  .add-location-page__map-frame {
    flex: 1;
    min-height: 0;
    height: auto;
  }
}
</style>
