import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Single-use sign-in links. Only a SHA-256 hash of the token is stored.
export const loginTokens = pgTable(
  "login_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    email: text("email").notNull(),
    ip: text("ip").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("login_tokens_email_idx").on(t.email, t.createdAt)],
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The details a user collects along the way (names, tax numbers). One row per user.
export const businessProfiles = pgTable("business_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, string>>().notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One row per ticked checklist item, e.g. itemId "pst:2".
export const progress = pgTable(
  "progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    doneAt: timestamp("done_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

// Append-only log of checklist ticks and unticks, for usage stats. userId is
// null for visitors who aren't signed in (no other identifier is stored).
export const checklistEvents = pgTable(
  "checklist_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    // Region slug ("bc", "on"), derived from itemId when the event is recorded.
    region: text("region").notNull(),
    done: boolean("done").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("checklist_events_created_idx").on(t.createdAt),
    index("checklist_events_item_idx").on(t.itemId),
    index("checklist_events_region_idx").on(t.region, t.createdAt),
  ],
);
