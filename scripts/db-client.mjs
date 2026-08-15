// The libSQL client the scripts share with the app.
//
// Same `DATABASE_URL` contract as lib/db/client.ts, so `npm run db:seed`
// against a hosted Turso database is a change of environment variable and
// nothing else:
//
//   file:./dev.db          local development
//   libsql://…turso.io     hosted, with DATABASE_AUTH_TOKEN
//
// The `prepare` shim exists so the seed script reads the way it did under
// node:sqlite. It is not a general compatibility layer — just enough to keep a
// 340-line script from becoming a rewrite when the driver changed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The effective database URL.
 *
 * A blank value counts as unset. `??` alone does not: a host with an empty
 * `DATABASE_URL` — a variable added but never given a value — passes `''`
 * straight through, which skips the fallback, fails the `file:` test, and
 * reaches the client as `createClient({ url: '' })`. That is the URL_INVALID
 * every build was dying on.
 */
export function databaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  return raw ? raw : 'file:./dev.db';
}

export function isFileDatabase() {
  return databaseUrl().startsWith('file:');
}

export function connect() {
  const url = databaseUrl();

  if (!url.startsWith('file:')) {
    console.log(`database: ${url.replace(/\/\/.*@/, '//')}`);
    return createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined });
  }

  // Resolved from the repo root, not the working directory: a build host is not
  // obliged to run npm scripts from the project root, and a path like /dev.db
  // fails as the near-useless "unable to open database file".
  const file = path.resolve(ROOT, url.slice('file:'.length));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  console.log(`database: ${file}`);
  return createClient({ url: `file:${file}` });
}

/** A prepared-statement shape over the async client. */
export function prepare(client, sql) {
  return {
    async get(...args) {
      const result = await client.execute({ sql, args });
      return result.rows[0];
    },
    async run(...args) {
      await client.execute({ sql, args });
    },
    async all(...args) {
      const result = await client.execute({ sql, args });
      return result.rows;
    },
  };
}
