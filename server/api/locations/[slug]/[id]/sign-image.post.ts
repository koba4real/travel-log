import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { findLocationBySlug } from "~~/lib/db/queries/location";
import { findLocationLogById } from "~~/lib/db/queries/location-log";
import env from "~~/lib/env";
import { createS3Client } from "~~/server/utils/create-s3-client";
import { z } from "zod";

const MAX_FILE_SIZE = 1024 * 1024 * 0.5; // 500KB
const imageSchema = z.object({
  contentLength: z.number().min(1).max(MAX_FILE_SIZE, "File size must be less than 500KB"),
  checksum: z.string(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, imageSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
  }
  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;
  const userId = event.context.user!.id;

  // Confirm the log exists and the user owns it before signing an upload.
  const location = await findLocationBySlug(slug);
  if (!location || location.userId !== userId) {
    throw createError({ statusCode: 404, statusMessage: "Location not found" });
  }

  const log = await findLocationLogById(Number.parseInt(id));
  if (!log || log.userId !== userId || log.locationId !== location.id) {
    throw createError({ statusCode: 404, statusMessage: "Location log not found" });
  }

  const client = createS3Client();

  const key = `${userId}/${id}/${crypto.randomUUID()}.jpg`;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.S3_BUCKET,
    Key: key,
    Expires: 120,
    Fields: {
      "x-amz-checksum-sha256": result.data.checksum,
    },
    Conditions: [
      ["content-length-range", result.data.contentLength, result.data.contentLength],
      ["eq", "$x-amz-meta-user-id", userId.toString()],
      ["eq", "$x-amz-meta-location-log-id", id],
    ],
  });

  fields["x-amz-meta-user-id"] = userId.toString();
  fields["x-amz-meta-location-log-id"] = id;

  return { url, fields, key };
});
