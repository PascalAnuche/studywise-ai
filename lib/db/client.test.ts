import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * `openPath` picks where SQLite actually opens the database, and its
 * interesting branch only runs on a read-only filesystem — which is to say,
 * only in the deployed serverless environment and never on a developer's
 * machine. Windows makes it worse: `chmod -w` on a directory is advisory, so
 * the read-only case cannot even be simulated locally.
 *
 * That leaves a test as the only way this branch is exercised before a deploy,
 * which is exactly the situation that produced the "unable to open database
 * file" build failure in the first place.
 */
const load = async () => (await import('./client')).openPath;
const loadUrl = async () => (await import('./client')).databaseUrl;

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.DATABASE_URL;
});

describe('openPath', () => {
  it('opens the file in place when its directory is writable', async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    vi.spyOn(fs, 'accessSync').mockReturnValue(undefined);

    const openPath = await load();
    expect(openPath()).toBe(path.resolve(process.cwd(), 'dev.db'));
  });

  it('copies to the temp directory when the directory is read-only', async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    const source = path.resolve(process.cwd(), 'dev.db');
    const target = path.join(os.tmpdir(), 'studywise.db');

    vi.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('EACCES');
    });
    // Source present, target not yet copied.
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => p === source);
    const copy = vi.spyOn(fs, 'copyFileSync').mockReturnValue(undefined);

    const openPath = await load();
    expect(openPath()).toBe(target);
    expect(copy).toHaveBeenCalledWith(source, target);
  });

  it('copies only once, so a warm instance reuses its own copy', async () => {
    process.env.DATABASE_URL = 'file:./dev.db';

    vi.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('EACCES');
    });
    // Target already there from an earlier invocation on this instance.
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const copy = vi.spyOn(fs, 'copyFileSync').mockReturnValue(undefined);

    const openPath = await load();
    expect(openPath()).toBe(path.join(os.tmpdir(), 'studywise.db'));
    expect(copy).not.toHaveBeenCalled();
  });

  it('names the missing path when there is nothing to copy', async () => {
    process.env.DATABASE_URL = 'file:./dev.db';

    vi.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('EACCES');
    });
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const openPath = await load();
    // The build failure this guards against was opaque; this one says where.
    expect(() => openPath()).toThrow(/No database at .*dev\.db/);
  });
});

/**
 * A host can hold a `DATABASE_URL` that exists but is empty — added to the
 * project and never given a value. `??` does not treat that as unset, so the
 * blank string skipped the fallback, failed the `file:` test and reached the
 * client as `createClient({ url: '' })`. Three deployments died on it.
 */
describe('databaseUrl', () => {
  it('falls back when the variable is unset', async () => {
    delete process.env.DATABASE_URL;
    expect(await (await loadUrl())()).toBe('file:./dev.db');
  });

  it('falls back when the variable is set but empty', async () => {
    process.env.DATABASE_URL = '';
    expect((await loadUrl())()).toBe('file:./dev.db');
  });

  it('falls back when the variable is only whitespace', async () => {
    process.env.DATABASE_URL = '   ';
    expect((await loadUrl())()).toBe('file:./dev.db');
  });

  it('uses a real value, trimmed of stray whitespace', async () => {
    process.env.DATABASE_URL = '  libsql://example.turso.io  ';
    expect((await loadUrl())()).toBe('libsql://example.turso.io');
  });
});
