<script setup lang="ts">
import type { ButtonProps, DropdownMenuItem } from "@nuxt/ui";

const { color = "neutral" } = defineProps<{
  color?: ButtonProps["color"];
}>();

const authStore = useAuthStore();

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: "Log out",
    icon: "tabler:logout",
    onSelect: () => authStore.signOut(),
  },
]);
</script>

<template>
  <UDropdownMenu v-if="authStore.user" :items="items">
    <UButton
      variant="ghost"
      color="neutral"
      class="auth-user"
    >
      <UAvatar
        :src="authStore.user.image ?? undefined"
        :alt="authStore.user.name"
        size="sm"
      />
      <span class="auth-user__name">{{ authStore.user.name }}</span>
    </UButton>
  </UDropdownMenu>

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
