<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <UButton
    v-if="authStore.user"
    label="Go to dashboard"
    to="/dashboard/location"
    color="primary"
    trailing-icon="tabler:arrow-right"
  />
  <UButton
    v-else
    label="Sign in with GitHub"
    color="primary"
    icon="tabler:brand-github"
    :disabled="authStore.loading"
    :loading="authStore.loading"
    @click="authStore.signIn"
  />
</template>
