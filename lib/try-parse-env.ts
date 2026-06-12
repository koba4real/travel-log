/* eslint-disable node/no-process-env */
import type { z } from "zod";

import { ZodError } from "zod";

export default function tryParseEnv<T extends z.ZodType>(
  schema: T,
  buildEnv: Record<string, string | undefined> = process.env,
) {
  try {
    schema.parse(buildEnv);
  }
  catch (error) {
    if (error instanceof ZodError) {
      let message = "Missing required values in .env:\n";
      error.issues.forEach((issue) => {
        message += `${issue.path[0]}\n`;
      });
      const e = new Error(message);
      e.stack = "";
      throw e;
    }
    else {
      console.error(error);
    }
  }
}
