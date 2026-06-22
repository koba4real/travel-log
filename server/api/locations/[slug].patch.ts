import { findLocationByName, findLocationBySlug, findUniqueSlug, toSlug, updateLocation } from "~~/lib/db/queries/location";
import { locationSchema } from "~~/lib/db/Schema/location";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing location slug" });
  }

  const result = await readValidatedBody(event, locationSchema.safeParse);
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
  }

  const userId = event.context.user!.id;

  const existing = await findLocationBySlug(slug);
  if (!existing || existing.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found",
    });
  }

  const duplicate = await findLocationByName(result.data.name, userId);
  if (duplicate && duplicate.id !== existing.id) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with this name already exists",
    });
  }

  let newSlug = existing.slug;
  if (result.data.name !== existing.name) {
    const candidate = toSlug(result.data.name);
    newSlug = candidate === existing.slug ? existing.slug : await findUniqueSlug(candidate);
  }

  return updateLocation(existing.id, result.data, newSlug);
});
