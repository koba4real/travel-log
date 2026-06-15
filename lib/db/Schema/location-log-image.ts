import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { locationLog } from "./location-log";

export const locationLogImage = sqliteTable("locationLogImage", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull(),
  locationLogId: int().notNull().references(() => locationLog.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const locationLogImageRelations = relations(locationLogImage, ({ one }) => ({
  locationLog: one(locationLog, {
    fields: [locationLogImage.locationLogId],
    references: [locationLog.id],
  }),
}));

export type InsertLocationLogImage = typeof locationLogImage.$inferInsert;
export type SelectLocationLogImage = typeof locationLogImage.$inferSelect;
