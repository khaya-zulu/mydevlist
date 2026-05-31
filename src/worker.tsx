import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { WorkerEntrypoint, env } from "cloudflare:workers";
import * as PostalMime from "postal-mime";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { EmailMessage } from "cloudflare:email";
import { createErrorMessage } from "./app/utils/email";

import { executeEmailAgent } from "@/app/utils/email";

import { Home } from "@/app/pages/home";
import { Dev } from "@/app/pages/dev";

export type AppContext = {};

const app = defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  route("/screenshots/*", async ({ params }) => {
    const object = await env.SCREENSHOTS.get(params.$0);
    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "image/png",
      },
    });
  }),
  render(Document, [route("/", Home), route("/:devId", Dev)]),
]);

export default class DefaultWorker extends WorkerEntrypoint<Env> {
  async email(message: ForwardableEmailMessage) {
    const parser = new PostalMime.default();
    const rawEmail = new Response((message as any).raw);

    const email = await parser.parse(await rawEmail.arrayBuffer());

    if (!email.html) {
      const errorMessage = createErrorMessage({
        message,
        body: "No HTML content found in email",
      });

      message.reply(
        new EmailMessage("no-reply@mydevlist.com", message.from, errorMessage),
      );

      return;
    }

    const response = await executeEmailAgent({ message, html: email.html });

    message.reply(
      new EmailMessage("no-reply@mydevlist.com", message.from, response),
    );
  }

  override async fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }
}

export { DevAgent } from "@/agents/dev";
export { OnboardingWorkflow } from "@/workflows/onboarding";
