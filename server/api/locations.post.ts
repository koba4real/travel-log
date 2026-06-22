import { findLocationByName, findUniqueSlug, insertLocation, toSlug } from "~~/lib/db/queries/location";
import { locationSchema } from "~~/lib/db/Schema/location";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, locationSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
  }
  const userId = event.context.user!.id;

  const duplicate = await findLocationByName(result.data.name, userId);
  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with this name already exists",
    });
  }

  const slug = await findUniqueSlug(toSlug(result.data.name));
  return insertLocation(result.data, slug, userId);
});
