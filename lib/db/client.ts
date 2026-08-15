import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * SQLite via node:sqlite, which ships with Node 24 and needs no native build
 * step. Server-only, nothing in /app client components may import this.
 */

let db: DatabaseSync | null = null;

/** `file:./dev.db` in the env, a filesystem path on disk. */
export function resolveDatabasePath(): string {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';
  const bare = url.startsWith('file:') ? url.slice('file:'.length) : url;
  return path.resolve(process.cwd(), bare);
}

/**
 * Where to actually open the database.
 *
 * A serverless deployment ships the seeded file inside a read-only bundle, and
 * SQLite cannot open a database it cannot write beside — WAL mode needs to
 * create a `-wal` sibling even to read. So when the directory is not writable
 * the file is copied to the temp directory once per cold start and opened
 * there.
 *
 * The consequence is deliberate and needs saying: **writes survive only as
 * long as that instance does.** Anything a student saves on the deployed demo
 * is lost when the instance recycles. Replacing this with a hosted database is
 * tracked in AGENTS.md.
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

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(openPath());
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('PRAGMA journal_mode = WAL');
  }
  return db;
}

/**
 * node:sqlite returns rows as untyped `Record<string, SQLOutputValue>`. These
 * two helpers are the single place that assertion happens, so the cast is
 * documented once rather than repeated at every call site. The mapping is
 * guaranteed by lib/db/schema.sql, which is why row types and schema must be
 * changed together.
 */
export function queryAll<T>(sql: string, ...params: unknown[]): T[] {
  return getDb()
    .prepare(sql)
    .all(...(params as never[])) as unknown as T[];
}

export function queryOne<T>(sql: string, ...params: unknown[]): T | undefined {
  return getDb()
    .prepare(sql)
    .get(...(params as never[])) as unknown as T | undefined;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Calendar day, the unit the streak counts in. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
