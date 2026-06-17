import type { InsertLocation } from "~~/lib/db/Schema/location";

import db from "~~/lib/db";
import { location } from "~~/lib/db/Schema/location";

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
