import { findLocationBySlug } from "~~/lib/db/queries/location";
import { findLocationLogById } from "~~/lib/db/queries/location-log";
import { z } from "zod";

// Resolves a route's slug + log id to a log the current user owns, throwing the
// validation errors every log-scoped endpoint needs. This was the body of
// GET [slug]/[id]; shared so the checks live in one place. The ownership checks
// are what make it safe to reuse on the write/delete endpoints.
export async function findOwnedLocationLog(slug: string | undefined, logId: string | undefined, userId: number) {
  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: "Location not found." });
  }

  const location = await findLocationBySlug(slug);
  if (!location || location.userId !== userId) {
    throw createError({ statusCode: 404, statusMessage: "Location not found." });
  }

  if (!z.coerce.number().safeParse(logId).success) {
    throw createError({ statusCode: 422, statusMessage: "Invalid id." });
  }

  const locationLog = await findLocationLogById(Number(logId));
  if (!locationLog || locationLog.userId !== userId || locationLog.locationId !== location.id) {
    throw createError({ statusCode: 404, statusMessage: "Location log not found." });
  }

  return locationLog;
}
