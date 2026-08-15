#!/usr/bin/env node
// Applies lib/db/schema.sql. `--fresh` drops a local database file first.
//
// Runs against whatever DATABASE_URL points at, so the same command migrates a
// local file or a hosted Turso database.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, connect, databaseUrl, isFileDatabase, prepare } from './db-client.mjs';

const client = connect();
const isFile = isFileDatabase();
const file = isFile ? path.resolve(ROOT, databaseUrl().slice('file:'.length)) : null;

if (process.argv.includes('--fresh')) {
  if (!isFile) {
    // Dropping a hosted database is not something a build script should be able
    // to do by accident.
    console.error('--fresh only applies to a local file database. Refusing to drop a remote one.');
    process.exit(1);
  }

  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    try {
      fs.rmSync(file + suffix, { force: true });
    } catch (error) {
      // Windows holds a lock while another process has the database open, so a
      // running dev server makes this fail. Say so plainly: the silent version
      // of this leaves the old schema in place and the next error is a
      // confusing "no such table" from somewhere else entirely.
      if (error.code === 'EPERM' || error.code === 'EBUSY') {
        console.error(
          `Cannot drop ${path.basename(file)}: the file is in use.\n` +
            'Stop the dev server (or anything else holding the database) and run this again.'
        );
        process.exit(1);
      }
      throw error;
    }
  }
  console.log(`Dropped ${path.basename(file)}`);
}

const schema = fs.readFileSync(path.resolve(ROOT, 'lib/db/schema.sql'), 'utf8');
await client.executeMultiple(schema);

/**
 * Additive column migrations.
 *
 * schema.sql uses CREATE TABLE IF NOT EXISTS, so a new column never reaches a
 * database that already has the table. Dropping and recreating is not an option
 * whenever anything else holds the file open, which on Windows includes a
 * running dev server, so new columns are added here instead.
 *
 * Append only, and keep each entry matching schema.sql exactly.
 */
const ADDITIVE = [
  { table: 'plan_sessions', column: 'start_time', definition: 'TEXT' },
  { table: 'quiz_questions', column: 'reasoning', definition: "TEXT NOT NULL DEFAULT ''" },
  { table: 'quiz_questions', column: 'explanation_id', definition: 'INTEGER REFERENCES explanations(id)' },
];

const added = [];
for (const { table, column, definition } of ADDITIVE) {
  const row = await prepare(
    client,
    `SELECT COUNT(*) AS n FROM pragma_table_info(?) WHERE name = ?`
  ).get(table, column);
  if (Number(row.n) > 0) continue;

  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  added.push(`${table}.${column}`);
}

const tables = await prepare(
  client,
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
).all();

console.log(`Migrated ${file ? path.basename(file) : 'remote database'}: ${tables.length} tables`);
for (const t of tables) console.log(`  ${t.name}`);
for (const column of added) console.log(`  + added column ${column}`);
client.close();
