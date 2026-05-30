import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { WorkerEntrypoint } from "cloudflare:workers";
import * as PostalMime from "postal-mime";

export { DevAgent } from "@/app/agents/dev";

export type AppContext = {};

const app = defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  render(Document, [route("/", Home)]),
]);

export default class DefaultWorker extends WorkerEntrypoint<Env> {
  async email(message: ForwardableEmailMessage) {
    const parser = new PostalMime.default();
    const rawEmail = new Response((message as any).raw);

    const email = await parser.parse(await rawEmail.arrayBuffer());
  }

  override async fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }
}
