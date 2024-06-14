import type { APIRoute } from "astro";
import { Click, db, count, eq } from "astro:db";

export const GET: APIRoute = async ({ params }) => {
  const { pageId } = params;
  if (!pageId) return new Response(null, { status: 400 });

  await db.insert(Click).values({ pageId: +pageId });

  // todo: figure out cookieless tracking (similar to vercel/analytics)
  // track unique clicks.
  const [{ c }] = await db
    .select({ c: count() })
    .from(Click)
    .where(eq(Click.pageId, pageId));

  return new Response(JSON.stringify({ count: c }));
};
