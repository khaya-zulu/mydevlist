import { defineDb, defineTable, column } from "astro:db";

const Page = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    url: column.text(),
    screenshotKey: column.text(),
    description: column.text(),
    createdAt: column.date({ default: new Date() }),
  },
});

const Click = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    pageId: column.number({ references: () => Page.columns.id }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Page,
    Click,
  },
});
