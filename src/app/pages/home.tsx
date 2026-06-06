import { count, inArray } from "drizzle-orm";

import { Globe, type GlobeMarker } from "@/app/components/globe";
import { DevList } from "@/app/features/dev-list";
import { Subscribe } from "@/app/features/subscribe";
import { FeatherIcon } from "../components/icons/feather";
import { Seo } from "@/app/components/seo";
import { SITE_DESCRIPTION, pageTitle } from "@/app/shared/site";
import { controlDb, sites } from "@/db/control";

export const Home = async () => {
  const markers: GlobeMarker[] = await controlDb
    .select({ slug: sites.slug, name: sites.name })
    .from(sites)
    .where(inArray(sites.status, ["ready", "visible"]))
    .limit(5);

  const [{ value: devCount }] = await controlDb
    .select({ value: count() })
    .from(sites)
    .where(inArray(sites.status, ["ready", "visible"]));

  return (
    <>
      <Seo title={pageTitle()} description={SITE_DESCRIPTION} />

      <div className="flex items-start justify-between pl-12 sm:pl-24 pr-12 max-w-400 gap-10 mx-auto">
      <div className="sticky top-0 h-screen flex items-center justify-center shrink-0">
        <div className="relative">
          <Globe markers={markers} />

          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center z-50">
            <div className="flex items-center gap-2 bg-white px-4 py-2">
              <FeatherIcon />
              <h1 className="font-instrument text-4xl">My Dev List</h1>
            </div>
            <Subscribe count={devCount} />
          </div>
        </div>
      </div>
      <DevList />
    </div>
    </>
  );
};
