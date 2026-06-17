import type { User } from "better-auth";

declare module "h3" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface H3EventContext {
    user?: Omit<User, "id"> & { id: number };
  }
}

// Important: this is required to make it a module and enable declaration merging
export {};
