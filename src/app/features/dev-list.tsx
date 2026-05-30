import { controlDb, sites } from "@/db/control";
import { desc, inArray } from "drizzle-orm";

import { Polaroid } from "./polaroid";

export const DevList = async () => {
  const devs = await controlDb
    .select({
      slug: sites.slug,
      url: sites.url,
      name: sites.name,
      role: sites.role,
    })
    .from(sites)
    .where(inArray(sites.status, ["ready", "visible"]))
    .orderBy(desc(sites.requestedAt));

  return (
    <div className="flex-1 h-full flex py-10 gap-4">
      <div className="flex-1 flex flex-col gap-4">
        {devs
          .filter((_, i) => i % 2 === 0)
          .map((dev, i) => (
            <Polaroid key={dev.slug} dev={dev} index={i * 2} />
          ))}
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {devs
          .filter((_, i) => i % 2 === 1)
          .map((dev, i) => (
            <Polaroid key={dev.slug} dev={dev} index={i * 2 + 1} />
          ))}
      </div>
    </div>
  );
};
