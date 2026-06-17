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

  function notifyError(title: string, error: unknown) {
    toast.add({
      title,
      description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      color: "error",
      icon: "tabler:alert-triangle",
    });
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
      notifyError("Sign in failed", err);
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
      notifyError("Sign out failed", err);
    }
  }

  return { init, loading, signIn, signOut, user };
});
