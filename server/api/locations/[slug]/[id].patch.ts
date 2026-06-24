import { findLocationBySlug } from "~~/lib/db/queries/location";
import { findLocationLogById, updateLocationLog } from "~~/lib/db/queries/location-log";
import { locationLogSchema } from "~~/lib/db/Schema/location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing location slug" });
  }

  const logId = getRouterParam(event, "id");
  if (!logId) {
    throw createError({ statusCode: 400, statusMessage: "Missing location log ID" });
  }

  const result = await readValidatedBody(event, locationLogSchema.safeParse);
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
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

  return updateLocationLog(existing.id, result.data);
});
