import { createClient, type Client, type InValue, type Row } from '@libsql/client';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * libSQL, which speaks SQLite over a local file *or* a remote Turso database
 * behind the same API. One `DATABASE_URL` picks between them:
 *
 *   file:./dev.db          local development, unchanged from before
 *   libsql://…turso.io     hosted, with DATABASE_AUTH_TOKEN
 *
 * This replaced `node:sqlite`, which only ever reads a local file. A serverless
 * instance gets a read-only bundle and its own throwaway temp directory, so a
 * file-backed database there loses every write when the instance recycles. That
 * is fine for a demo and wrong for a student's saved work.
 *
 * The cost of the change is that libSQL is asynchronous where `node:sqlite` was
 * synchronous, which is why every function in this directory returns a promise.
 *
 * Server-only. Nothing in /app client components may import this.
 */

let client: Client | null = null;

/**
 * The effective database URL.
 *
 * A blank value counts as unset. `??` alone does not: a host with an empty
 * `DATABASE_URL` — a variable added but never given a value — passes `''`
 * straight through, which skips the fallback, fails the `file:` test, and
 * reaches the client as `createClient({ url: '' })`.
 */
export function databaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  return raw ? raw : 'file:./dev.db';
}

/** `file:./dev.db` in the env, a filesystem path on disk. */
export function resolveDatabasePath(): string {
  const url = databaseUrl();
  const bare = url.startsWith('file:') ? url.slice('file:'.length) : url;
  return path.resolve(process.cwd(), bare);
}

/** True when the configured database is a local file rather than a remote one. */
export function isFileDatabase(): boolean {
  return databaseUrl().startsWith('file:');
}

/**
 * Where a *file* database is actually opened.
 *
 * A serverless deployment ships the seeded file inside a read-only bundle, and
 * SQLite cannot open a database it cannot write beside — WAL mode needs to
 * create a `-wal` sibling even to read. So when the directory is not writable
 * the file is copied to the temp directory once per cold start.
 *
 * This path only matters when running file-backed. Point DATABASE_URL at a
 * hosted database and none of it applies.
 */
export function openPath(): string {
  const source = resolveDatabasePath();

  try {
    fs.accessSync(path.dirname(source), fs.constants.W_OK);
    return source;
  } catch {
    const target = path.join(os.tmpdir(), 'studywise.db');
    if (!fs.existsSync(target)) {
      if (!fs.existsSync(source)) {
        throw new Error(
          `No database at ${source}. The build should have created it via the ` +
            `prebuild script; see AGENTS.md.`
        );
      }
      fs.copyFileSync(source, target);
    }
    return target;
  }
}

export function getClient(): Client {
  if (!client) {
    client = isFileDatabase()
      ? createClient({ url: `file:${openPath()}` })
      : createClient({
          url: databaseUrl(),
          authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
        });
  }
  return client;
}

/**
 * libSQL rows carry their columns as named properties *and* as array indices.
 * Serialising one straight to JSON leaks `"0"`, `"1"`, `"length"` into the
 * response, so every row is copied to a plain object keyed by column name.
 */
function toPlain<T>(row: Row, columns: string[]): T {
  const out: Record<string, unknown> = {};
  for (const column of columns) out[column] = row[column];
  return out as T;
}

export async function queryAll<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const result = await getClient().execute({ sql, args: params as InValue[] });
  return result.rows.map((row) => toPlain<T>(row, result.columns));
}

export async function queryOne<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  const result = await getClient().execute({ sql, args: params as InValue[] });
  const row = result.rows[0];
  return row ? toPlain<T>(row, result.columns) : undefined;
}

/** A statement run for its effect rather than its rows. */
export async function run(sql: string, ...params: unknown[]): Promise<void> {
  await getClient().execute({ sql, args: params as InValue[] });
}

/**
 * Several statements as one unit.
 *
 * `batch` in write mode is a transaction: the whole set applies or none of it
 * does. Replacing a plan's sessions is the case that needs it — the old rows
 * are deleted before the new ones are written, and a failure between the two
 * would otherwise leave the plan empty.
 */
export async function batch(statements: { sql: string; args: unknown[] }[]): Promise<void> {
  if (statements.length === 0) return;
  await getClient().batch(
    statements.map(({ sql, args }) => ({ sql, args: args as InValue[] })),
    'write'
  );
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Calendar day, the unit the streak counts in. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
