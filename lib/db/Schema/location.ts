import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import * as z from "zod";

import { user } from "./auth";
import { locationLog } from "./location-log";

export const location = sqliteTable("location", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  lat: real().notNull(),
  long: real().notNull(),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.name, t.userId),
]);

export const locationRelations = relations(location, ({ many }) => ({
  locationLogs: many(locationLog),
}));

export type SelectLocation = typeof location.$inferSelect;

export const locationSchema = z.object({
  name: z
    .string({ message: "Please enter the location name" })
    .min(2, "Must be at least 2 characters")
    .max(100, "Must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Must be at most 1000 characters")
    .optional(),
  lat: z
    .number({ message: "Please enter a latitude" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  long: z
    .number({ message: "Please enter a longitude" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export type InsertLocation = z.infer<typeof locationSchema>;
