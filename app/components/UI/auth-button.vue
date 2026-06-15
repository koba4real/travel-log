<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const { color = "neutral" } = defineProps<{
  color?: ButtonProps["color"];
}>();

const authStore = useAuthStore();
</script>

<template>
  <UButton
    :color="color"
    label="Sign in"
    variant="subtle"
    :disabled="authStore.loading"
    trailing-icon="tabler:brand-github"
    :loading="authStore.loading"
    @click="authStore.signIn"
  />
</template>
