import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient();

export const useAuthStore = defineStore("useAuthStore", () => {
  const toast = useToast();
  const session = authClient.useSession();
  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending || session.value?.isRefetching);

  async function signIn() {
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
        errorCallbackURL: "/error",
      });
      if (error) {
        throw new Error(error.message ?? "Unable to start sign in.");
      }
    }
    catch (err) {
      toast.add({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        color: "error",
        icon: "tabler:alert-triangle",
      });
    }
  }

  async function signOut() {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw new Error(error.message ?? "Unable to sign out.");
      }
      await navigateTo("/");
    }
    catch (err) {
      toast.add({
        title: "Sign out failed",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        color: "error",
        icon: "tabler:alert-triangle",
      });
    }
  }

  return { loading, signIn, signOut, user };
});
