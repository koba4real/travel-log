import type { InsertLocation } from "~~/lib/db/Schema/location";

import db from "~~/lib/db";
import { location } from "~~/lib/db/Schema/location";
import { eq } from "drizzle-orm";
import slugify from "slugify";

export function toSlug(name: string) {
  return slugify(name, { lower: true, strict: true, trim: true });
}

export async function findLocations(userId: number) {
  return db.query.location.findMany({
    where: (loc, { eq }) => eq(loc.userId, userId),
    orderBy: (loc, { desc }) => desc(loc.createdAt),
  });
}

export async function findLocationByName(name: string, userId: number) {
  return db.query.location.findFirst({
    where: (loc, { and, eq }) => and(eq(loc.name, name), eq(loc.userId, userId)),
  });
}

export async function findLocationBySlug(slug: string) {
  return db.query.location.findFirst({
    where: (loc, { eq }) => eq(loc.slug, slug),
  });
}

// slug is globally unique — append a short random suffix until we find a free one.
export async function findUniqueSlug(slug: string) {
  let unique = slug;
  while (await findLocationBySlug(unique)) {
    unique = `${slug}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return unique;
}

export async function insertLocation(data: InsertLocation, slug: string, userId: number) {
  const [createdLocation] = await db.insert(location).values({
    ...data,
    slug,
    userId,
  }).returning();
  return createdLocation;
}

export async function updateLocation(id: number, data: InsertLocation, slug: string) {
  const [updatedLocation] = await db.update(location)
    .set({ ...data, slug })
    .where(eq(location.id, id))
    .returning();
  return updatedLocation;
}

export async function deleteLocation(id: number) {
  const [deletedLocation] = await db.delete(location).where(eq(location.id, id)).returning();
  return deletedLocation;
}
