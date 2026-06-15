import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient();

export const useAuthStore = defineStore("useAuthStore", () => {
  const toast = useToast();
  const loading = ref(false);

  async function signIn() {
    loading.value = true;
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
      loading.value = false;
    }
  }

  return { loading, signIn };
});
