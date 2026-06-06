import { Agent, type AgentContext } from "agents";

import { executeBrowserAgent } from "@/app/utils/browser";
import {
  createDataDb,
  migrateDataDb,
  crawledLinks,
  developer,
  socialLinks,
  type DataDb,
} from "@/db/data";
import { controlDb, sites } from "@/db/control";
import { generateImage, generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { desc, eq } from "drizzle-orm";
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
    const { slug } = input;

    // Normalise to the site's origin so a deep link
    let url = input.url;
    try {
      url = new URL(input.url).origin;
    } catch {}

    const bio = await executeBrowserAgent({
      prompt: `Learn about the developer and their portfolio website at ${url}. Visit the site, explore relevant sub pages, and summarise who the developer is and what they work on.`,
      hooks: {
        onTakeScreenshot: async ({ screenshot }) => {
          // Save the original screenshot.
          await this.env.SCREENSHOTS.put(slug, screenshot, {
            httpMetadata: { contentType: "image/png" },
          });

          // Generate a digital version from the original and save it alongside
          // (served at /screenshots/<slug>/digital).
          const { image } = await generateImage({
            model: openai.image("gpt-image-2"),
            prompt: {
              images: [screenshot],
              text: "Can I have a digital pixelated version of this?",
            },
          });

          await this.env.SCREENSHOTS.put(`${slug}/digital`, image.uint8Array, {
            httpMetadata: { contentType: "image/png" },
          });
        },
        onGoToPage: async ({ url, title }) => {
          await this.db
            .insert(crawledLinks)
            .values({ url, title })
            .onConflictDoNothing();
        },
        onExtractSocialLinks: async (links) => {
          if (links.length === 0) return;

          await this.db.insert(socialLinks).values(links).onConflictDoNothing({
            target: socialLinks.url,
          });
        },
      },
    });

    const { output } = await generateText({
      model: openai("gpt-5.5"),
      system:
        "You are a helpful assistant that summarises the developer's portfolio website.",
      output: Output.object({
        schema: z.object({
          name: z.string().describe("The developer's full name."),
          role: z
            .string()
            .describe(
              "The developer's single, short job title — at most 3 words, no slashes or combined roles. E.g. 'Design Engineer', 'Frontend Developer', 'Software Engineer'. " +
                "For a prominent leadership role at a notable company (e.g. founder or C-level such as CEO/CTO), append the company in parentheses, e.g. 'CEO (Shopify)', 'CTO (Vercel)'.",
            ),
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

    const { name, role, summary } = output;

    await this.db
      .insert(developer)
      .values({ website: url, bio, name, role, summary })
      .onConflictDoUpdate({
        target: developer.id,
        set: {
          website: url,
          bio,
          name,
          role,
          summary,
          updatedAt: new Date(),
        },
      });

    await controlDb
      .update(sites)
      .set({
        status: "ready",
        name,
        role,
        updatedAt: new Date(),
      })
      .where(eq(sites.slug, slug));

    return bio;
  }

  async getProfile() {
    const [dev] = await this.db.select().from(developer).limit(1);
    const socials = await this.db.select().from(socialLinks);
    const links = await this.db
      .select()
      .from(crawledLinks)
      .orderBy(desc(crawledLinks.crawledAt));

    return {
      developer: dev ?? null,
      socialLinks: socials,
      crawledLinks: links,
    };
  }
}
