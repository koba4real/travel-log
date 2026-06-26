import { deleteLocationLog } from "~~/lib/db/queries/location-log";
import { findOwnedLocationLog } from "~~/server/utils/find-owned-location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const logId = getRouterParam(event, "id");
  const userId = event.context.user!.id;

  const existing = await findOwnedLocationLog(slug, logId, userId);

  return deleteLocationLog(existing.id);
});
