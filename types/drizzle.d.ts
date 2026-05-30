// Generated `.sql` migration files are imported as text (see the "Text"
// rule in wrangler.jsonc), and drizzle-kit emits a plain-JS `migrations.js`
// bundle for durable-sqlite. Give both a type so TS can resolve the imports.

declare module "*.sql" {
  const content: string;
  export default content;
}

declare module "*/migrations/migrations" {
  const migrations: {
    journal: {
      entries: {
        idx: number;
        when: number;
        tag: string;
        breakpoints: boolean;
      }[];
    };
    migrations: Record<string, string>;
  };
  export default migrations;
}
