import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";
import { eq } from "drizzle-orm";

import { createReplyMessage } from "@/app/utils/email";
import { controlDb, sites } from "@/db/control";

export type RemovalParams = { slug: string };

export class RemovalWorkflow extends WorkflowEntrypoint<Env, RemovalParams> {
  async run(event: WorkflowEvent<RemovalParams>, step: WorkflowStep) {
    const { slug } = event.payload;

    // Clear the developer's data plane held in their DevAgent durable object
    // (developer, social links and crawled links).
    await step.do("purge-agent", async () => {
      const stub = await this.env.DevAgent.getByName(slug);
      await stub.purge();
    });

    // Remove the original and digital screenshots from R2.
    await step.do("delete-screenshots", async () => {
      await this.env.SCREENSHOTS.delete([slug, `${slug}/digital`]);
    });

    // Remove the control-plane record last so the slug stays resolvable
    // for the steps above.
    await step.do("delete-site", async () => {
      await controlDb.delete(sites).where(eq(sites.slug, slug));
    });

    await step.do("notify", async () => {
      const to = this.env.ADMIN_EMAIL_TO;

      const raw = createReplyMessage({
        to,
        subject: `Removal complete: ${slug}`,
        body: `The developer site ${slug} has been removed from mydevlist.com.`,
      });

      await this.env.EMAIL.send(
        new EmailMessage("no-reply@mydevlist.com", to, raw),
      );
    });
  }
}
