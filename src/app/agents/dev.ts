import { Agent } from "agents";

// import { Stagehand } from "@browserbasehq/stagehand";

export class DevAgent extends Agent {
  async onboard(input: { url: string }) {
    // const { url } = input;
    // const stagehand = new Stagehand({
    //   env: "BROWSERBASE",
    // });
    // await stagehand.init();
    // const agent = stagehand.agent({
    //   mode: "hybrid",
    //   model: "google/gemini-3.5-flash",
    //   systemPrompt:
    //     "You are a helpful agent that learns about a developer's portfolio website. You will be given a URL and you will need to learn about the developer and their portfolio website.",
    // });
    // const [page] = stagehand.context.pages();
    // await page.goto(url);
    // const result = await agent.execute({
    //   instruction: "Learn about the developer and their portfolio website.",
    //   maxSteps: 20,
    // });
    // console
  }
}
