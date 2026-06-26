import type { InsertLocationLogImage } from "~~/lib/db/Schema/location-log-image";

import db from "~~/lib/db";
import { locationLogImage } from "~~/lib/db/Schema/location-log-image";
import { and, eq } from "drizzle-orm";

export async function insertLocationLogImage(locationLogId: number, insertable: InsertLocationLogImage, userId: number) {
  const [insertedImage] = await db.insert(locationLogImage).values({
    ...insertable,
    locationLogId,
    userId,
  }).returning();
  return insertedImage;
}

export async function deleteLocationLogImage(locationLogImageId: number, userId: number) {
  const [deletedImage] = await db
    .delete(locationLogImage)
    .where(and(eq(locationLogImage.id, locationLogImageId), eq(locationLogImage.userId, userId)))
    .returning();
  return deletedImage;
}
