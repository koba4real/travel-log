import { findLocationBySlug } from "~~/lib/db/queries/location";
import { deleteLocationLog, findLocationLogById } from "~~/lib/db/queries/location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const logId = getRouterParam(event, "id");

  if (!slug || !logId) {
    throw createError({ statusCode: 400, statusMessage: "Missing location slug or log ID" });
  }

  const userId = event.context.user!.id;

  const location = await findLocationBySlug(slug);
  if (!location || location.userId !== userId) {
    throw createError({ statusCode: 404, statusMessage: "Location not found" });
  }

  const existing = await findLocationLogById(Number.parseInt(logId));
  if (!existing || existing.userId !== userId || existing.locationId !== location.id) {
    throw createError({ statusCode: 404, statusMessage: "Location log not found" });
  }

  return deleteLocationLog(existing.id);
});
