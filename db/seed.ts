import { $ } from "execa";

// https://astro.build/db/seed
export default async function seed() {
  console.log("🌱 seeding database using snaplet...");
  await $`npx tsx root-seed.ts`;
}
