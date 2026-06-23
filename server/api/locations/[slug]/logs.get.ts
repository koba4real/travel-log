import { findLocationBySlug } from "~~/lib/db/queries/location";
import { findLocationLogs } from "~~/lib/db/queries/location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing location slug" });
  }

  const userId = event.context.user!.id;

  const location = await findLocationBySlug(slug);
  if (!location || location.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found",
    });
  }

  return findLocationLogs(location.id);
});
