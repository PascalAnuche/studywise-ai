#!/usr/bin/env node
// Applies lib/db/schema.sql. `--fresh` drops the database file first.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, announce, databaseFile } from './db-path.mjs';

const file = databaseFile();
announce(file);

if (process.argv.includes('--fresh')) {
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
const db = new DatabaseSync(file);
db.exec(schema);

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
  const exists = db
    .prepare(`SELECT COUNT(*) AS n FROM pragma_table_info(?) WHERE name = ?`)
    .get(table, column).n;
  if (exists) continue;

  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  added.push(`${table}.${column}`);
}

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all();

console.log(`Migrated ${path.basename(file)}: ${tables.length} tables`);
for (const t of tables) console.log(`  ${t.name}`);
for (const column of added) console.log(`  + added column ${column}`);
db.close();
