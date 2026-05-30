import { tool, ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";

import { launch, type Page } from "@cloudflare/playwright";
import z from "zod";
import { env } from "cloudflare:workers";

export type BrowserLink = { text: string; href: string };

export type BrowserHooks = {
  onGoToPage?: (event: { url: string; title: string }) => void | Promise<void>;
  onReadPage?: (event: { url: string; text: string }) => void | Promise<void>;
  onGetLinks?: (event: {
    url: string;
    links: BrowserLink[];
  }) => void | Promise<void>;
  onTakeScreenshot?: (event: {
    url: string;
    screenshot: Buffer<ArrayBufferLike>;
  }) => void | Promise<void>;
};

const createBrowserTools = (page: Page, hooks: BrowserHooks = {}) => ({
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

      const screenshot = await page.screenshot();
      await hooks.onTakeScreenshot?.({ url: page.url(), screenshot });

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
});

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
    });

    const result = await browserAgent.generate({
      prompt: `You are a browser agent that researches a developer's portfolio website.
      Use the provided tools to visit the site, read its pages, discover and visit relevant sub pages (e.g. about, projects, blog), and take screenshots when useful.
      Only navigate within the site you were asked about. Do not follow unrelated external links.

      Here is the request:
      ${prompt}

      Gather what you learn and return it as the answer to the request.`,
    });

    return result.text;
  } finally {
    await browser.close();
  }
};
