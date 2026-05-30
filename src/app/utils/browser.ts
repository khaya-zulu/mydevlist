import { tool, ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";

import { launch, type Page } from "@cloudflare/playwright";
import z from "zod";
import { env } from "cloudflare:workers";

const createBrowserTools = (page: Page) => ({
  goToPage: tool({
    description:
      "Navigate the browser to a URL. Use this to visit a developer's website or one of its sub pages.",
    inputSchema: z.object({
      url: z.url().describe("The absolute URL to navigate to"),
    }),
    execute: async ({ url }) => {
      console.log("GOING TO PAGE", url);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return `Navigated to ${page.url()} — "${await page.title()}"`;
    },
  }),

  readPage: tool({
    description:
      "Read the current page's visible text content. Use this to learn about the developer from the page you are on.",
    inputSchema: z.object({}),
    execute: async () => {
      console.log("READING PAGE");
      const text = await page.evaluate(() => document.body.innerText);
      // Keep the payload reasonable for the model.
      return text.slice(0, 20_000);
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

      return JSON.stringify(links.slice(0, 100));
    },
  }),

  // takeScreenshot: tool({
  //   description:
  //     "Take a screenshot of the current page, returned as a base64-encoded PNG.",
  //   inputSchema: z.object({
  //     fullPage: z
  //       .boolean()
  //       .optional()
  //       .describe("Capture the full scrollable page instead of the viewport"),
  //   }),
  //   execute: async ({ fullPage }) => {
  //     const buffer = await page.screenshot({ fullPage: fullPage ?? false });
  //     return buffer.toString("base64");
  //   },
  // }),
});

export const executeBrowserAgent = async (input: { prompt: string }) => {
  const { prompt } = input;

  const browser = await launch(env.BROWSER);

  try {
    const page = await browser.newPage();

    const browserAgent = new ToolLoopAgent({
      model: openai("gpt-5.5"),
      tools: createBrowserTools(page),
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
