import tailwindcss from "@tailwindcss/vite";

// Validate environment variables on startup; throws if any are missing.
import "./lib/env";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    // Nominatim (OpenStreetMap) is keyless but its usage policy requires an
    // identifying User-Agent. Override per environment via NUXT_NOMINATIM_USER_AGENT.
    nominatimUserAgent: "nuxt-travel-log/1.0 (https://github.com/koba/travel-log)",
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/icon",
    "@pinia/nuxt",
    "nuxt-csurf",
    "nuxt-maplibre",
  ],
  colorMode: {
    preference: "system", // auto-detect the OS theme until the user overrides
    fallback: "light", // used during SSR / when the OS preference is unknown
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        "maplibre-gl",
      ],
    },
    server: {
      watch: {
        ignored: ["./docker-data/*"],
      },
    },
  },
  components: {
    dirs: [
      {
        path: "~/components",
        pathPrefix: false,
        global: true,
      },
    ],
  },
  routeRules: {
    "/dashboard/**": { appLayout: "dashboard" },
  },
});
