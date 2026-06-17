import db from "~~/lib/db";
import { location, locationSchema } from "~~/lib/db/Schema/location";

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `location-${Date.now()}`;
}

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => locationSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
  }

  try {
    const [createdLocation] = await db.insert(location).values({
      ...result.data,
      slug: slugify(result.data.name),
      userId: event.context.user!.id,
    }).returning();
    return createdLocation;
  }
  catch (e) {
    const error = e as Error;
    if (error.message?.includes("UNIQUE constraint failed")) {
      throw createError({
        statusCode: 409,
        statusMessage: "A location with this name already exists",
      });
    }
    throw error;
  }
});
