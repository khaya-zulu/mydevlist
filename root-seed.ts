/**
 * ! Executing this script will delete all data in your database and seed it with 10 Page.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { copycat, faker } from "@snaplet/copycat";

import { platformProxyOptions } from "./astro.config.mjs";

import { getPlatformProxy } from "wrangler";

const downloadAndStoreImage = async (
  url: string,
  options: { env: Record<string, unknown>; key: string }
) => {
  const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
  await (options.env.R2 as any).put(options.key, arrayBuffer);

  console.log("Uploaded image:", options.key);
};

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const { env } = await getPlatformProxy(platformProxyOptions);

  // Seed the database with 10 Page
  const { Page } = await seed.Page((x) =>
    x(10, {
      screenshotKey: async ({ seed }) => {
        const key = copycat.uuid(seed);
        const url = faker.image.url();

        await downloadAndStoreImage(url, { key, env });

        return key;
      },
    })
  );
  await seed.Click((x) => x(40), { connect: { Page } });

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes
  process.exit();
};

main();
