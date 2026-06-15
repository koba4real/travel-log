import { authClient } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
//   "passare useFetch" = "Ehi Better Auth, quando devi controllare la sessione, non usare il tuo fetch, usa questo che ti do io, perché il mio sa parlare col server e portarsi dietro il cookie di login."
  const { data: session } = await authClient.useSession(useFetch);

  if (!session.value) {
    return navigateTo("/");
  }
});
