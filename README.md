# My Dev List

A directory of software engineers. Each entry is a developer's portfolio that has been crawled, summarised and turned into a profile page by an AI agent.

The application is built on [RedwoodSDK](https://docs.rwsdk.com/) and runs entirely on [Cloudflare Workers](https://developers.cloudflare.com/workers), using Workers' Durable Objects, Workflows, D1, R2, Browser Rendering and Email primitives.

## How it works

A developer is added by emailing their portfolio URL to the worker. From there the pipeline is fully automated:

1. **Inbound email** is received by the worker's `email()` handler ([src/worker.tsx](src/worker.tsx)). The sender is checked against an allow-list, the message is parsed, and an LLM email agent decides what to do with it.
2. **The email agent** ([src/app/utils/email.ts](src/app/utils/email.ts)) is a tool-calling agent that can `onboardDeveloper` (record the site and kick off onboarding) or `removeDeveloper`. It replies to every email in plain prose.
3. **Onboarding** is run as a durable [Workflow](src/workflows/onboarding.ts). It calls the developer's `DevAgent`, then emails the operator when the profile is ready.
4. **The DevAgent** ([src/agents/dev.ts](src/agents/dev.ts)) — a Durable Object — drives a headless browser agent over the portfolio site, summarises the developer with an LLM, generates a pixelated "digital" version of the screenshot, and stores everything.
5. **Profile pages** ([src/app/pages/dev.tsx](src/app/pages/dev.tsx)) are rendered server-side at `/<slug>` from the agent's stored data.

## Architecture

### Control plane and data plane

The app deliberately splits storage into two planes:

- **Control plane** — a single shared [D1](https://developers.cloudflare.com/d1) database ([src/db/control](src/db/control)). It holds the `sites` registry (slug, URL, name, role, onboarding status) and `subscribers`. This is the global index of who is on the list.
- **Data plane** — per-developer SQLite, embedded in each `DevAgent` Durable Object ([src/db/data](src/db/data)). Each agent owns its `developer` record, `social_links` and `crawled_links`. A developer's crawled data lives entirely inside their own Durable Object and never touches the shared database.

Both planes use [Drizzle ORM](https://orm.drizzle.team) with separate schemas, migration directories and `drizzle.*.config.ts` files. Each `DevAgent` runs its own data-plane migrations on construction (`migrateDataDb`), which is why the build is configured to import `.sql` migrations as text (see `rules` in [wrangler.jsonc](wrangler.jsonc)).

### DevAgent (Durable Object)

`getByName(slug)` gives a stable, per-developer agent instance. Its responsibilities:

- `onboard({ url, slug })` — run the browser agent, summarise, generate the digital image, and write to both planes (marks the site `ready` in the control plane).
- `getProfile()` — return the developer record, social links and crawled links for rendering.
- `purge()` — clear the developer's data plane (used during removal).

### Browser agent

[src/app/utils/browser.ts](src/app/utils/browser.ts) launches a headless browser via Cloudflare's [Playwright binding](https://developers.cloudflare.com/browser-rendering) and runs an AI `ToolLoopAgent` over it. The agent has a small tool set — `goToPage`, `readPage`, `getLinks`, `extractSocialLinks` — and a bounded tool-call budget. Hooks fire as it works, letting the `DevAgent` persist crawled links, social links and screenshots as they're discovered. The agent returns a Markdown bio as its final message.

### Screenshots (R2)

The first page the browser reads is screenshotted and stored in an [R2](https://developers.cloudflare.com/r2) bucket keyed by slug. A "digital" pixelated variant is generated from it with an image model and stored at `<slug>/digital`. Both are served through the `/screenshots/*` route in [src/worker.tsx](src/worker.tsx) with long-lived cache headers. The profile page uses the digital image as the hero and floats the original as a preview.

### Workflows

Durable [Cloudflare Workflows](https://developers.cloudflare.com/workflows) handle the multi-step, retryable processes. Each finishes by emailing the operator.

| Workflow               | File                                               | Purpose                                                                                         |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `OnboardingWorkflow`   | [onboarding.ts](src/workflows/onboarding.ts)       | Run a developer's onboarding, then notify.                                                      |
| `RemovalWorkflow`      | [removal.ts](src/workflows/removal.ts)             | Purge the agent's data plane, delete screenshots from R2, then delete the control-plane record. |
| `PendingWorkflow`      | [pending.ts](src/workflows/pending.ts)             | Re-trigger onboarding for any sites still `pending`.                                            |
| `DigitalImageWorkflow` | [digital-image.ts](src/workflows/digital-image.ts) | Regenerate the pixelated screenshot from the stored original.                                   |

### AI models

Built on the [Vercel AI SDK](https://ai-sdk.dev). The browser, email and summarisation agents use OpenAI text models via `@ai-sdk/openai`; the pixelated screenshots are produced with an OpenAI image model.

## Development

This project uses [Bun](https://bun.sh) and [Wrangler](https://developers.cloudflare.com/workers/wrangler).

```shell
bun install
bun run dev          # local dev server
```

Other useful scripts (see [package.json](package.json)):

```shell
bun run db:generate          # generate migrations for both planes
bun run db:migrate:local     # apply control-plane migrations to local D1
bun run db:migrate           # apply control-plane migrations to remote D1
bun run check                # generate worker types + typecheck
bun run release              # build and deploy with wrangler
```

### Configuration

- **Bindings** are declared in [wrangler.jsonc](wrangler.jsonc): D1 (`DB`), R2 (`SCREENSHOTS`), Browser Rendering (`BROWSER`), the `DevAgent` Durable Object, the four Workflows, Email (`EMAIL`) and static assets (`ASSETS`). Set `name` and the `database_id` before deploying.
- **Environment variables** (see [.env.example](.env.example)) include the OpenAI key plus the email settings: `ALLOW_LIST` (senders allowed to email the worker), `ADMIN_EMAIL_FROM`, `ADMIN_EMAIL_TO`.

## Further reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
  </content>
