import { DevListClient } from "./dev-list-client";
import { getDevList } from "./queries";

export const DevList = async () => {
  const { devs, nextCursor } = await getDevList(null);

  return <DevListClient initialDevs={devs} initialCursor={nextCursor} />;
};
