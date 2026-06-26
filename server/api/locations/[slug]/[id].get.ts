import { findOwnedLocationLog } from "~~/server/utils/find-owned-location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const id = getRouterParam(event, "id");
  const userId = event.context.user!.id;

  return findOwnedLocationLog(slug, id, userId);
});
