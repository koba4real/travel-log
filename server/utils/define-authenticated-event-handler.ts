import type { EventHandler, EventHandlerRequest, EventHandlerResponse } from "h3";

import { auth } from "~~/lib/auth";

export function defineAuthenticatedEventHandler<T extends EventHandlerRequest, D>(
  handler: EventHandler<T, EventHandlerResponse<D>>,
): EventHandler<T, EventHandlerResponse<D>> {
  return defineEventHandler<T, EventHandlerResponse<D>>(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    event.context.user = session.user; // available to future protected handlers
    return handler(event);
  });
}
