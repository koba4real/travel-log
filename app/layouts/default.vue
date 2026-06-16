<script lang="ts" setup>
const authStore = useAuthStore();
await authStore.init();
</script>

<template>
  <div>
    <TheHeader />
    <UMain>
      <slot />
    </UMain>
  </div>
</template>
