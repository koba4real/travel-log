import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { locationLog } from "./location-log";

export const location = sqliteTable("location", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  lat: real().notNull(),
  long: real().notNull(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.name),
]);

export const locationRelations = relations(location, ({ many }) => ({
  locationLogs: many(locationLog),
}));

export type InsertLocation = typeof location.$inferInsert;
export type SelectLocation = typeof location.$inferSelect;
