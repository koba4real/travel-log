import db from "~~/lib/db";
import { location, locationSchema } from "~~/lib/db/Schema/location";
import slugify from "slugify";

function toSlug(name: string) {
  return slugify(name, { lower: true, strict: true, trim: true });
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
  const userId = event.context.user!.id;
  const duplicate = await db.query.location.findFirst({
    where: (loc, { and, eq }) => and(eq(loc.name, result.data.name), eq(loc.userId, userId)),
  });
  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with this name already exists",
    });
  }

  // slug is globally unique — add a short random suffix on collision.
  const originalSlug = toSlug(result.data.name);
  let slug = originalSlug;
  const existing = await db.query.location.findFirst({
    where: (loc, { eq }) => eq(loc.slug, slug),
  });
  if (existing) {
    slug = `${originalSlug}-${Math.random().toString(36).slice(2, 8)}`;
  }

  const [createdLocation] = await db.insert(location).values({
    ...result.data,
    slug,
    userId,
  }).returning();
  return createdLocation;
});
