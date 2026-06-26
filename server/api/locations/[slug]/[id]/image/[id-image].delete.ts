import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { deleteLocationLogImage } from "~~/lib/db/queries/location-log-image";
import env from "~~/lib/env";
import { findOwnedLocationLog } from "~~/server/utils/find-owned-location-log";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const logId = getRouterParam(event, "id");
  const imageId = getRouterParam(event, "id-image");

  if (!imageId) {
    throw createError({ statusCode: 400, statusMessage: "Missing image ID" });
  }

  const userId = event.context.user!.id;

  // Validate the slug + log exist and belong to the user (shared with the other log endpoints).
  await findOwnedLocationLog(slug, logId, userId);

  const client = createS3Client();

  // The delete is also scoped to userId, so a missing row means it didn't exist or isn't theirs.
  const deleted = await deleteLocationLogImage(Number.parseInt(imageId), userId);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Image not found" });
  }
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: deleted.key,
  });
  await client.send(command);

  return deleted;
});
