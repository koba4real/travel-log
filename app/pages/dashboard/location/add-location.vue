<script setup lang="ts">
</script>

<template>
  <div class="page-shell page-shell--grow">
    <div class="split-layout">
      <!-- Left: form panel -->
      <section class="form-col">
        <div class="form-panel">
          <p class="eyebrow">
            <UIcon name="tabler:map-pin-plus" class="eyebrow-icon" />
            New location
          </p>
          <h1 class="page-title page-title--sm">
            Add a new location
          </h1>
          <p class="page-subtitle">
            A location is a place you have traveled or will travel to. It can be a city,
            country, state or point of interest. You can add specific times you visited
            this location after adding it.
          </p>
          <LocationForm />
        </div>
      </section>

      <!-- Right: map (takes the majority of the page) -->
      <aside class="map-col map-col--wide">
        <div class="section-head">
          <h2 class="section-title">
            <UIcon name="tabler:map-2" class="section-icon" />
            On the map
          </h2>
        </div>
        <div class="map-frame map-frame--tall">
          <Map />
        </div>
      </aside>
    </div>
  </div>
</template>
