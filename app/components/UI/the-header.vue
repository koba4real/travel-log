<template>
  <UHeader to="/">
    <template #title>
      <span class="brand">
        <UIcon name="tabler:map-pins" class="brand__icon" />
        Travel Log
      </span>
    </template>

    <template #right>
      <UColorModeButton />

      <AuthButton />
    </template>
  </UHeader>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.brand__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--ui-primary);
}
</style>
