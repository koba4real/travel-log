import type { InsertLocationLog } from "~~/lib/db/Schema/location-log";

import db from "~~/lib/db";
import { locationLog } from "~~/lib/db/Schema/location-log";
import { eq } from "drizzle-orm";

export async function findLocationLogs(locationId: number) {
  return db.query.locationLog.findMany({
    where: (log, { eq }) => eq(log.locationId, locationId),
    orderBy: (log, { desc }) => desc(log.startedAt),
  });
}
export async function findLocationLogById(id: number) {
  return db.query.locationLog.findFirst({
    where: (log, { eq }) => eq(log.id, id),
  });
}

export async function insertLocationLog(data: InsertLocationLog, locationId: number, userId: number) {
  const [createdLog] = await db.insert(locationLog).values({
    name: data.name,
    description: data.description,
    startedAt: new Date(data.startedAt).getTime(),
    endedAt: new Date(data.endedAt).getTime(),
    lat: data.lat,
    long: data.long,
    locationId,
    userId,
  }).returning();
  return createdLog;
}
export async function updateLocationLog(id: number, data: InsertLocationLog) {
  const [updatedLog] = await db.update(locationLog).set({
    name: data.name,
    description: data.description,
    startedAt: new Date(data.startedAt).getTime(),
    endedAt: new Date(data.endedAt).getTime(),
    lat: data.lat,
    long: data.long,
  }).where(eq(locationLog.id, id)).returning();
  return updatedLog;
}
