import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";
import { generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

import { createReplyMessage } from "@/app/utils/email";

export type DigitalImageParams = { slug: string };

export class DigitalImageWorkflow extends WorkflowEntrypoint<
  Env,
  DigitalImageParams
> {
  async run(event: WorkflowEvent<DigitalImageParams>, step: WorkflowStep) {
    const { slug } = event.payload;

    await step.do("generate-digital", async () => {
      const original = await this.env.SCREENSHOTS.get(slug);
      if (!original) {
        throw new Error(`No screenshot found for slug ${slug}`);
      }

      const screenshot = new Uint8Array(await original.arrayBuffer());

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
    });

    await step.do("notify", async () => {
      const to = this.env.ADMIN_EMAIL_TO;

      const raw = createReplyMessage({
        to,
        subject: `Digital image regenerated: ${slug}`,
        body:
          `The digital screenshot for ${slug} has been regenerated.\n\n` +
          `View it at https://mydevlist.com/screenshots/${slug}/digital`,
      });

      await this.env.EMAIL.send(
        new EmailMessage(this.env.ADMIN_EMAIL_TO, to, raw),
      );
    });
  }
}
