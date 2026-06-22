import { deleteLocation, findLocationBySlug } from "~~/lib/db/queries/location";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing location slug" });
  }

  const userId = event.context.user!.id;

  const existing = await findLocationBySlug(slug);
  if (!existing || existing.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found",
    });
  }
  return deleteLocation(existing.id);
});
