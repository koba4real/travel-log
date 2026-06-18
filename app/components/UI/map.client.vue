<script lang="ts" setup>
const colorMode = useColorMode();
const style = computed(() =>
  colorMode.value === "dark"
    ? "/styles/dark.json"
    : "https://tiles.openfreemap.org/styles/liberty",
);
// Brescia, Italy — MapLibre expects [lng, lat]
const center = [10.211802, 45.541553];
const zoom = 8;
</script>

<template>
  <div class="map">
    <MglMap
      :map-style="style"
      :center="center"
      :zoom="zoom"
    >
      <MglNavigationControl />
    </MglMap>
  </div>
</template>

<style scoped>
.map {
  height: 100%;
  min-height: 280px;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
}
</style>
