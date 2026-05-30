import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/db/control/schema.ts",
  out: "./src/db/control/migrations",
});
