import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const developer = sqliteTable("developer", {
  id: text("id").primaryKey().default("developer"),
  name: text("name"),
  headline: text("headline"),
  bio: text("bio"),
  website: text("website"),
  summary: text("summary"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const socialLinks = sqliteTable("social_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
});

export const crawledLinks = sqliteTable("crawled_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  title: text("title"),
  summary: text("summary"),
  crawledAt: integer("crawled_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Developer = typeof developer.$inferSelect;
export type NewDeveloper = typeof developer.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
export type CrawledLink = typeof crawledLinks.$inferSelect;
export type NewCrawledLink = typeof crawledLinks.$inferInsert;
