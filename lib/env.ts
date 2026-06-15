/* eslint-disable node/no-process-env */
import { z } from "zod";

import tryParseEnv from "./try-parse-env";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  TURSO_DATABASE_URL: z.string().nonempty("TURSO_DATABASE_URL is required"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
}).superRefine((input, ctx) => {
  if (input.NODE_ENV === "production" && !input.TURSO_AUTH_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["TURSO_AUTH_TOKEN"],
      message: "TURSO_AUTH_TOKEN is required when NODE_ENV is 'production'",
    });
  }
});

export type Env = z.infer<typeof EnvSchema>;

tryParseEnv(EnvSchema);

export default EnvSchema.parse(process.env);
