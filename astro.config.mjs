import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import db from "@astrojs/db";

import cloudflare from "@astrojs/cloudflare";

/** @type {import("@astrojs/cloudflare").Options["platformProxy"]} */
export const platformProxyOptions = {
  // internal defaults `@astrojs/cloudflare`
  enabled: true,
  configPath: "wrangler.toml",
  experimentalJsonConfig: false,
  persist: true,
};

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), db()],
  output: "server",
  adapter: cloudflare({
    platformProxy: platformProxyOptions,
  }),
});
