import { Agent } from "agents";

import { executeBrowserAgent } from "@/app/utils/browser";

export class DevAgent extends Agent {
  async onboard(input: { url: string }) {
    const { url } = input;

    const result = await executeBrowserAgent({
      prompt: `Learn about the developer and their portfolio website at ${url}. Visit the site, explore relevant sub pages, and summarise who the developer is and what they work on.`,
    });

    console.log(result);
  }
}
