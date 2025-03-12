import { defineConfig } from "astro/config";
import db from "@astrojs/db";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

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
  integrations: [db()],
  output: "server",

  adapter: cloudflare({
    platformProxy: platformProxyOptions,
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
