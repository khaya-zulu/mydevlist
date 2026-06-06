import { tool, ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";

import { createMimeMessage } from "mimetext";
import z from "zod";
import { env } from "cloudflare:workers";

import { controlDb, sites } from "@/db/control";
import { eq } from "drizzle-orm";

export const createReplyMessage = (input: {
  message?: ForwardableEmailMessage;
  to: string;
  subject: string;
  body: string;
}) => {
  const { message, to, subject, body } = input;

  const msg = createMimeMessage();
  if (message) {
    msg.setHeader("In-Reply-To", message.headers.get("Message-ID") ?? "");
  }
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
          const [newSite] = await controlDb
            .insert(sites)
            .values({ slug, url: pageUrl })
            .returning({ id: sites.id, slug: sites.slug, url: sites.url });

          await env.ONBOARDING_WORKFLOW.create({
            params: { url: pageUrl, slug },
          });

          return `Started onboarding developer ${newSite.slug} from ${newSite.url}`;
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
    prompt: `You are the onboarding assistant for MyDevList, a developer directory.
    You receive emails from the operator and reply to every one of them.

    The email may describe a developer to onboard, or simply contain a developer's website URL on its own — treat a bare developer URL as a request to onboard that developer.

    What to do:
    - If the email is about onboarding a developer or contains a developer's website URL, use the onboardDeveloper tool to onboard them, then reply confirming what you started.
    - If the email is about anything else (a question, a greeting, small talk, etc.), do NOT onboard anything. Still reply helpfully and conversationally. For example, if someone asks whether anyone is around, let them know you're here and explain that they can onboard a developer by emailing you their website URL.
    - Never invent details that are not present in the email or derivable from the developer's website. If a required detail is missing, say what is missing instead of guessing.

    Always write your reply as a friendly, human-readable email in plain prose — never JSON or raw data. Sign off as the MyDevList assistant.

    Here is the email:
    ${html}`,
  });

  const originalSubject = message.headers.get("subject");
  const subject = originalSubject
    ? `Re: ${originalSubject}`
    : "Re: your message to MyDevList";

  return createReplyMessage({
    message: message,
    to: message.from,
    subject,
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
