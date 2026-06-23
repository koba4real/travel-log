import type { InsertLocationLog } from "~~/lib/db/Schema/location-log";

import db from "~~/lib/db";
import { locationLog } from "~~/lib/db/Schema/location-log";

export async function findLocationLogs(locationId: number) {
  return db.query.locationLog.findMany({
    where: (log, { eq }) => eq(log.locationId, locationId),
    orderBy: (log, { desc }) => desc(log.startedAt),
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
