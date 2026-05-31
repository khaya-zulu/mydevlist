"use server";

import { controlDb, sites } from "@/db/control";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { serverQuery } from "rwsdk/worker";

export const PAGE_SIZE = 6;

export type Dev = {
  slug: string;
  url: string;
  name: string | null;
  role: string | null;
};

// requestedAt is not unique, so we page on (requestedAt, slug) with the unique
// slug as a tiebreaker. requestedAt travels as epoch ms so it stays JSON-safe.
export type DevCursor = { requestedAt: number; slug: string };

export type DevPage = { devs: Dev[]; nextCursor: DevCursor | null };

export const getDevList = serverQuery(
  async (cursor: DevCursor | null): Promise<DevPage> => {
    const rows = await controlDb
      .select({
        slug: sites.slug,
        url: sites.url,
        name: sites.name,
        role: sites.role,
        requestedAt: sites.requestedAt,
      })
      .from(sites)
      .where(
        and(
          inArray(sites.status, ["ready", "visible"]),
          cursor
            ? or(
                lt(sites.requestedAt, new Date(cursor.requestedAt)),
                and(
                  eq(sites.requestedAt, new Date(cursor.requestedAt)),
                  lt(sites.slug, cursor.slug),
                ),
              )
            : undefined,
        ),
      )
      .orderBy(desc(sites.requestedAt), desc(sites.slug))
      // Fetch one extra row to detect whether another page exists.
      .limit(PAGE_SIZE + 1);

    const hasMore = rows.length > PAGE_SIZE;
    const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    const last = page.at(-1);

    const nextCursor =
      hasMore && last
        ? { requestedAt: last.requestedAt.getTime(), slug: last.slug }
        : null;

    const devs = page.map(({ slug, url, name, role }) => ({
      slug,
      url,
      name,
      role,
    }));

    return { devs, nextCursor };
  },
);
