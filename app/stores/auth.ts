import { createAuthClient } from "better-auth/vue";

const authClient = createAuthClient();

export const useAuthStore = defineStore("useAuthStore", () => {
  const toast = useToast();
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(null);

  async function init() {
    const data = await authClient.useSession(useFetch);
    session.value = data;
  }

  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);

  function csrfHeaders() {
    const { csrf, headerName } = useCsrf();
    return csrf ? { [headerName]: csrf } : {};
  }

  async function signIn() {
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
        errorCallbackURL: "/error",
        fetchOptions: { headers: csrfHeaders() },
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
      const { error } = await authClient.signOut({
        fetchOptions: { headers: csrfHeaders() },
      });
      if (error) {
        throw new Error(error.message ?? "Unable to sign out.");
      }
      // Clear local state so the header updates immediately — navigating to the
      // public "/" route won't trigger an SSR refresh to re-read the session.
      session.value = null;
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

  return { init, loading, signIn, signOut, user };
});
