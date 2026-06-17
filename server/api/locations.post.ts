import { locationSchema } from "~~/lib/db/Schema/location";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => locationSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: result.error.issues,
    });
  }

  return result.data; // validate-only for now; no DB insert
});
