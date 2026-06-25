import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import * as z from "zod";

import type { SelectLocationLogImage } from "./location-log-image";

import { user } from "./auth";
import { location } from "./location";
import { locationLogImage } from "./location-log-image";

export const locationLog = sqliteTable("locationLog", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  startedAt: int().notNull(),
  endedAt: int().notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  locationId: int().notNull().references(() => location.id, { onDelete: "cascade" }),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const locationLogRelations = relations(locationLog, ({ one, many }) => ({
  location: one(location, {
    fields: [locationLog.locationId],
    references: [location.id],
  }),
  images: many(locationLogImage),
}));

export const locationLogSchema = z.object({
  name: z
    .string({ message: "Please enter a title" })
    .min(2, "Must be at least 2 characters")
    .max(100, "Must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Must be at most 1000 characters")
    .optional(),
  startedAt: z.iso.date("Please select a start date"),
  endedAt: z.iso.date("Please select an end date"),
  lat: z
    .number({ message: "Please enter a latitude" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  long: z
    .number({ message: "Please enter a longitude" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
})
  // ISO date strings compare correctly lexicographically.
  .refine(data => data.endedAt > data.startedAt, {
    path: ["endedAt"],
    message: "End date must be after the start date",
  });

export type InsertLocationLog = z.infer<typeof locationLogSchema>;
export type SelectLocationLog = typeof locationLog.$inferSelect;
export type SelectLocationLogWithImages = SelectLocationLog & {
  images: SelectLocationLogImage[];
};
