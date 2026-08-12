import { DatabaseSync } from 'node:sqlite';
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

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(resolveDatabasePath());
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
