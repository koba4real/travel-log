import { findLocationBySlug } from "~~/lib/db/queries/location";
import { findLocationLogById } from "~~/lib/db/queries/location-log";
import { z } from "zod";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const location = await findLocationBySlug (slug);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const id = getRouterParam(event, "id") as string;

  if (!z.coerce.number().safeParse(id).success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid id.",
    });
  }

  const locationLog = await findLocationLogById(Number(id));

  if (!locationLog) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location log not found.",
    });
  }

  return locationLog;
});
