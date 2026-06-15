<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

// Landing-page call-to-action: prompts guests to sign in, and points
// already-authenticated visitors to their dashboard instead.
const authStore = useAuthStore();
</script>

<template>
  <UButton
    v-if="authStore.user"
    label="Go to dashboard"
    to="/dashboard"
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
