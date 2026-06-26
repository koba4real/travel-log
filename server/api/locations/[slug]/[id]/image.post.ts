import { GetObjectCommand } from "@aws-sdk/client-s3";
import { insertLocationLogImage } from "~~/lib/db/queries/location-log-image";
import { insertLocationLogImageSchema } from "~~/lib/db/Schema/location-log-image";
import env from "~~/lib/env";
import { createS3Client } from "~~/server/utils/create-s3-client";
import { findOwnedLocationLog } from "~~/server/utils/find-owned-location-log";

type objectMetadata = {
  "user-id": string;
  "location-log-id": string;

};

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, insertLocationLogImageSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;
  const userId = event.context.user!.id;

  // Confirm the log exists and the user owns it before signing an upload.
  await findOwnedLocationLog(slug, id, userId);

  const client = createS3Client();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: result.data.key,
  });
  const response = await client.send(command);
  const metadata = response.Metadata as objectMetadata | undefined;
  if (!metadata || metadata["user-id"] !== userId.toString() || metadata["location-log-id"] !== id) {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized access to the image" });
  }
  const insertedImage = await insertLocationLogImage(Number.parseInt(id), result.data, userId);
  return insertedImage;
});
