import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * A person whose pull-up reps are being tracked.
 * All rep state lives in Postgres so it survives refreshes,
 * closed tabs, and new devices.
 */
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  repsLeft: integer("reps_left").notNull().default(0),
  plus3: integer("plus3").notNull().default(0),
  minus3: integer("minus3").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Simple key/value store for app-level settings
 * (currently: the selected UI theme).
 */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
