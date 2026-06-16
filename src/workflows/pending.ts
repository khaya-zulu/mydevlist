import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";
import { eq } from "drizzle-orm";

import { createReplyMessage } from "@/app/utils/email";
import { controlDb, sites } from "@/db/control";

export type PendingParams = Record<string, never>;

export class PendingWorkflow extends WorkflowEntrypoint<Env, PendingParams> {
  async run(_event: WorkflowEvent<PendingParams>, step: WorkflowStep) {
    const pendingSites = await step.do("fetch-pending", async () =>
      controlDb
        .select({ slug: sites.slug, url: sites.url })
        .from(sites)
        .where(eq(sites.status, "pending")),
    );

    for (const site of pendingSites) {
      await step.do(`retry-${site.slug}`, async () => {
        await this.env.ONBOARDING_WORKFLOW.create({
          params: { url: site.url, slug: site.slug },
        });
      });
    }

    await step.do("notify", async () => {
      const to = this.env.ADMIN_EMAIL_TO;

      const body =
        pendingSites.length === 0
          ? "No pending developer sites to retry."
          : `Retrying onboarding for ${pendingSites.length} pending site(s):\n\n` +
            pendingSites
              .map((site) => `- ${site.slug} (${site.url})`)
              .join("\n");

      const raw = createReplyMessage({
        to,
        subject: `Pending onboarding retry: ${pendingSites.length} site(s)`,
        body,
      });

      await this.env.EMAIL.send(
        new EmailMessage(this.env.ADMIN_EMAIL_TO, to, raw),
      );
    });
  }
}
