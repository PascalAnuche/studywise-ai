// Where the database lives, resolved the same way by every script.
//
// This used to be `path.resolve(process.cwd(), './dev.db')` duplicated in
// migrate.mjs and seed.mjs. A build host is not obliged to run npm scripts from
// the project root, and when the working directory was elsewhere the path
// became something like `/dev.db` — a read-only location, which SQLite reports
// only as the near-useless "unable to open database file".
//
// Resolving from this file's own location instead makes the path independent of
// where the script was invoked, the same rule tokens/build-tokens.js follows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * A `file:` URL is a filesystem path. Anything else — a postgres:// URL set on
 * the host, say — is not something these scripts can write to, and silently
 * resolving it as a relative path produces a nonsense location and the same
 * opaque SQLite error. Fail with the reason instead.
 */
export function databaseFile() {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (!url.startsWith('file:')) {
    console.error(
      `DATABASE_URL is "${url}", which is not a file: URL.\n` +
        'These scripts write a local SQLite file and cannot use a remote database.\n' +
        'Unset DATABASE_URL to use the default ./dev.db, or point it at a file: path.'
    );
    process.exit(1);
  }

  const file = path.resolve(ROOT, url.slice('file:'.length));

  // SQLite does not create missing directories, and reports that as the same
  // "unable to open database file" as every other cause.
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

/** Printed by both scripts, so a failing build log shows the path it tried. */
export function announce(file) {
  console.log(`database: ${file}`);
}
