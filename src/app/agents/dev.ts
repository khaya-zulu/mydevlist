import { Agent, type AgentContext } from "agents";

import { executeBrowserAgent } from "@/app/utils/browser";
import {
  createDataDb,
  migrateDataDb,
  crawledLinks,
  developer,
  type DataDb,
} from "@/db/data";
import { controlDb, sites } from "@/db/control";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { eq } from "drizzle-orm";
import z from "zod";

export class DevAgent extends Agent {
  db: DataDb;

  constructor(ctx: AgentContext, env: Env) {
    super(ctx, env);

    this.db = createDataDb(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      await migrateDataDb(this.db);
    });
  }

  async onboard(input: { url: string; slug: string }) {
    const { url, slug } = input;

    let isScreenshotSaved = false;

    const bio = await executeBrowserAgent({
      prompt: `Learn about the developer and their portfolio website at ${url}. Visit the site, explore relevant sub pages, and summarise who the developer is and what they work on.`,
      hooks: {
        // Save only the first screenshot, keyed by the developer's slug.
        onTakeScreenshot: async ({ screenshot }) => {
          if (isScreenshotSaved) return;
          isScreenshotSaved = true;

          await this.env.SCREENSHOTS.put(slug, screenshot, {
            httpMetadata: { contentType: "image/png" },
          });
        },
        onGoToPage: async ({ url, title }) => {
          await this.db
            .insert(crawledLinks)
            .values({ url, title })
            .onConflictDoNothing();
        },
      },
    });

    const { output } = await generateText({
      model: openai("gpt-5.5"),
      system: `You are a helpful assistant that summarises the developer's portfolio website.`,
      output: Output.object({
        schema: z.object({
          name: z.string().describe("The developer's full name."),
          summary: z
            .string()
            .describe(
              "A concise summary of who the developer is and what they work on.",
            ),
        }),
      }),
      messages: [
        {
          role: "user",
          content: `Here is the bio gathered from the developer's portfolio website:\n\n${bio}`,
        },
      ],
    });

    const { name, summary } = output;

    await this.db
      .insert(developer)
      .values({ website: url, bio, name, summary })
      .onConflictDoUpdate({
        target: developer.id,
        set: {
          website: url,
          bio,
          name,
          summary,
          updatedAt: new Date(),
        },
      });

    await controlDb
      .update(sites)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(sites.slug, slug));

    return bio;
  }
}
