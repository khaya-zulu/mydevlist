import { tool, ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";

import { createMimeMessage } from "mimetext";
import z from "zod";
import { env } from "cloudflare:workers";

import { controlDb, sites } from "@/db/control";
import { eq } from "drizzle-orm";

export const createReplyMessage = (input: {
  message: ForwardableEmailMessage;
  to: string;
  subject: string;
  body: string;
}) => {
  const { message, to, subject, body } = input;

  const msg = createMimeMessage();
  msg.setHeader("In-Reply-To", message.headers.get("Message-ID") ?? "");
  msg.setSender("no-reply@mydevlist.com");
  msg.setTo(to);
  msg.setSubject(subject);

  msg.addMessage({ contentType: "text/plain", data: body });

  return msg.toString();
};

const emailAgent = new ToolLoopAgent({
  model: openai("gpt-5.5"),
  tools: {
    onboardDeveloper: tool({
      description: "Onboard a developer from an email",
      inputSchema: z.object({
        pageUrl: z.url().describe("The URL of the developer's website"),
        slug: z.string().describe("The slug of the developer"),
      }),
      execute: async ({ pageUrl, slug }) => {
        console.log("ONBOARDING DEVELOPER", pageUrl);

        const [existingSite] = await controlDb
          .select()
          .from(sites)
          .where(eq(sites.slug, slug));

        if (existingSite) {
          return "Site already exists";
        } else {
          await controlDb.insert(sites).values({ slug, url: pageUrl });

          const stub = await env.DevAgent.getByName(slug);
          await stub.onboard({ url: pageUrl, slug });

          return "Started onboarding developer";
        }
      },
    }),
  },
});

export const executeEmailAgent = async (input: {
  message: ForwardableEmailMessage;
  html: string;
}) => {
  const { message, html } = input;

  const result = await emailAgent.generate({
    prompt: `You are an onboarding assistant for a developer directory.
    Your only job is to read an incoming email from the operator and onboard a developer's website from it.
    The email may either describe a developer to onboard, or simply contain a developer's website URL on its own — treat a bare developer URL as a request to onboard that developer.
    Extract the details needed to onboard them (e.g. the website URL, and any name or profile information available).

    Here is the email:
    ${html}

    Rules:
    - Only act when the email is about onboarding a developer or contains a developer website URL.
    - If the email is about anything else, do not onboard anything. Briefly state that the request is out of scope and take no further action.
    - Never invent details that are not present in the email or derivable from the developer's website. If a required detail is missing, note what is missing instead of guessing.

    Return the details needed to onboard the developer in a JSON object.`,
  });

  return createReplyMessage({
    message: message,
    to: message.from,
    subject: "Completed onboarding",
    body: result.text,
  });
};

export const createErrorMessage = (input: {
  message: ForwardableEmailMessage;
  body: string;
}) => {
  const { message } = input;

  return createReplyMessage({
    message,
    to: message.from,
    subject: "Error processing email",
    body: input.body,
  });
};
