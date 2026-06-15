<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

import { useAuthStore } from "~/stores/auth";

const { color = "neutral" } = defineProps<{
  color?: ButtonProps["color"];
}>();

const authStore = useAuthStore();
</script>

<template>
  <div v-if="authStore.user" class="auth-user">
    <UAvatar
      :src="authStore.user.image ?? undefined"
      :alt="authStore.user.name"
      size="sm"
    />
    <span class="auth-user__name">{{ authStore.user.name }}</span>
  </div>
  <UButton
    v-else
    :color="color"
    label="Sign in"
    variant="subtle"
    :disabled="authStore.loading"
    trailing-icon="tabler:brand-github"
    :loading="authStore.loading"
    @click="authStore.signIn"
  />
</template>

<style scoped>
.auth-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-user__name {
  font-weight: 500;
}
</style>
