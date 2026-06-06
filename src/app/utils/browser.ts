import { tool, ToolLoopAgent, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";

import { launch, type Page } from "@cloudflare/playwright";
import z from "zod";
import { env } from "cloudflare:workers";
import { platform } from "node:os";

export type BrowserLink = { text: string; href: string };

export type BrowserHooks = {
  onGoToPage?: (event: { url: string; title: string }) => void | Promise<void>;
  onReadPage?: (event: { url: string; text: string }) => void | Promise<void>;
  onGetLinks?: (event: {
    url: string;
    links: BrowserLink[];
  }) => void | Promise<void>;
  onExtractSocialLinks?: (
    links: { platform: string; url: string }[],
  ) => void | Promise<void>;
  onTakeScreenshot?: (event: {
    url: string;
    screenshot: Buffer<ArrayBufferLike>;
  }) => void | Promise<void>;
};

const createBrowserTools = (page: Page, hooks: BrowserHooks = {}) => {
  let isFirstPageRead = true;

  return {
    extractSocialLinks: tool({
      description:
        "Extract social profile links (GitHub, X, LinkedIn, etc.) from the current page. Use this on the homepage, about, or contact pages.",
      inputSchema: z.object({
        links: z
          .array(
            z.object({
              platform: z
                .string()
                .describe(
                  "The platform of the social profile, e.g: 'Github', 'X', 'LinkedIn'",
                ),
              url: z.url().describe("The URL of the social profile"),
            }),
          )
          .min(1)
          .describe("All social profile links found on the current page"),
      }),
      execute: async ({ links }) => {
        console.log("EXTRACTING SOCIAL LINKS", links.length);
        await hooks.onExtractSocialLinks?.(links);

        const platforms = links.map((l) => l.platform).join(", ");
        return `Recorded ${links.length} profile(s): ${platforms}`;
      },
    }),
    goToPage: tool({
      description:
        "Navigate the browser to a URL. Use this to visit a developer's website or one of its sub pages.",
      inputSchema: z.object({
        url: z.url().describe("The absolute URL to navigate to"),
      }),
      execute: async ({ url }) => {
        console.log("GOING TO PAGE", url);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        const title = await page.title();

        await hooks.onGoToPage?.({ url: page.url(), title });

        return `Navigated to ${page.url()} — "${title}"`;
      },
    }),

    readPage: tool({
      description:
        "Read the current page's visible text content. Use this to learn about the developer from the page you are on.",
      inputSchema: z.object({}),
      execute: async () => {
        console.log("READING PAGE");
        const text = await page.evaluate(() => document.body.innerText);
        const trimmed = text.slice(0, 20_000);

        if (isFirstPageRead) {
          const screenshot = await page.screenshot();
          await hooks.onTakeScreenshot?.({ url: page.url(), screenshot });

          isFirstPageRead = false;
        }

        await hooks.onReadPage?.({ url: page.url(), text: trimmed });
        return trimmed;
      },
    }),

    getLinks: tool({
      description:
        "List the links on the current page. Use this to discover sub pages of the site worth visiting (e.g. about, projects, blog).",
      inputSchema: z.object({}),
      execute: async () => {
        console.log("GETTING LINKS");
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll("a[href]"))
            .map((a) => ({
              text: (a.textContent ?? "").trim().slice(0, 120),
              href: (a as HTMLAnchorElement).href,
            }))
            .filter((l) => l.href.startsWith("http")),
        );

        const limited = links.slice(0, 100);
        await hooks.onGetLinks?.({ url: page.url(), links: limited });
        return JSON.stringify(limited);
      },
    }),
  };
};

export const executeBrowserAgent = async (input: {
  prompt: string;
  hooks?: BrowserHooks;
}) => {
  const { prompt, hooks } = input;

  const browser = await launch(env.BROWSER);

  try {
    const page = await browser.newPage();

    const browserAgent = new ToolLoopAgent({
      model: openai("gpt-5.5"),
      tools: createBrowserTools(page, hooks),
      stopWhen: stepCountIs(40),
    });

    const result = await browserAgent.generate({
      prompt: `You are a browser agent that researches a developer's portfolio website.
      Use the provided tools to visit the site, read its pages, discover and visit relevant sub pages (e.g. about, projects, blog), and take screenshots when useful.
      When you find social profile links (GitHub, X, LinkedIn, etc.), call extractSocialLinks with all of them from that page in one call.
      Only navigate within the site you were asked about. Do not follow unrelated external links.

      You have a limited budget of tool calls. Be efficient: visit a handful of the most relevant pages rather than exhausting every link. Aim to finish exploring within roughly 30 tool calls so you always have room to write your answer.

      Here is the request:
      ${prompt}

      When you have gathered enough, STOP calling tools and reply with a written summary as your final message. Your final response must be the prose answer to the request — never end on a tool call.

      Format your final answer as Markdown. Where it adds value, link to relevant pages and resources using inline Markdown links (e.g. [their project](https://example.com)) — link to the developer's projects, blog posts, social profiles, and notable work rather than pasting raw URLs.`,
    });

    console.log(
      "BROWSER AGENT RESULT",
      "steps:",
      result.steps.length,
      "finishReason:",
      result.finishReason,
      "textLength:",
      result.text.length,
    );

    return result.text;
  } finally {
    await browser.close();
  }
};
