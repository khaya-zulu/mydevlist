import { drizzle } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";

import migrations from "./migrations/migrations";
import * as schema from "./schema";

export function createDataDb(storage: DurableObjectStorage) {
  return drizzle(storage, { schema });
}

export type DataDb = ReturnType<typeof createDataDb>;

export async function migrateDataDb(db: DataDb) {
  await migrate(db, migrations);
}

export * from "./schema";
