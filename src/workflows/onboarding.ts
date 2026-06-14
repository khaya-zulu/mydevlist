import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";

import { createReplyMessage } from "@/app/utils/email";

export type OnboardingParams = { url: string; slug: string };

export class OnboardingWorkflow extends WorkflowEntrypoint<
  Env,
  OnboardingParams
> {
  async run(event: WorkflowEvent<OnboardingParams>, step: WorkflowStep) {
    const { url, slug } = event.payload;

    await step.do("onboard", async () => {
      const stub = await this.env.DevAgent.getByName(slug);
      await stub.onboard({ url, slug });
    });

    await step.do("notify", async () => {
      const to = this.env.ADMIN_EMAIL_TO;

      const raw = createReplyMessage({
        to,
        subject: `Onboarding complete: ${slug}`,
        body:
          `Onboarding for ${slug} (${url}) is complete.\n\n` +
          `Review the profile: https://mydevlist.com/${slug}`,
      });

      await this.env.EMAIL.send(
        new EmailMessage(this.env.ADMIN_EMAIL_TO, to, raw),
      );
    });
  }
}
