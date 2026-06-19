import type { NominatimResult } from "~~/lib/types";

export default defineAuthenticatedEventHandler(async (event) => {
  const query = getQuery(event);

  if (!query.q) {
    throw createError({
      statusCode: 400,
      statusMessage: "Search query is required",
    });
  }

  const config = useRuntimeConfig(event);

  try {
    const results = await $fetch<NominatimResult[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        query: {
          q: query.q,
          format: "jsonv2",
          limit: 5,
        },
        headers: {
          // Nominatim's usage policy REQUIRES an identifying User-Agent.
          // Configured via runtimeConfig (override with NUXT_NOMINATIM_USER_AGENT).
          "User-Agent": config.nominatimUserAgent,
        },
      },
    );

    return results;
  }
  catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Location search is unavailable right now. Please try again.",
    });
  }
});
