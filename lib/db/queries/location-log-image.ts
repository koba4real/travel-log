import type { InsertLocationLogImage } from "~~/lib/db/Schema/location-log-image";

import db from "~~/lib/db";
import { locationLogImage } from "~~/lib/db/Schema/location-log-image";

export async function insertLocationLogImage(locationLogId: number, insertable: InsertLocationLogImage, userId: number) {
  const [insertedImage] = await db.insert(locationLogImage).values({
    ...insertable,
    locationLogId,
    userId,
  }).returning();
  return insertedImage;
}
