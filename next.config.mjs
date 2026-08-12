/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in; keep it external so the bundler doesn't try to trace it.
  serverExternalPackages: ['node:sqlite'],

  /**
   * `next dev` and `next build` both write to `.next` by default, so a
   * production build run while a dev server is watching overwrites the chunks
   * that server is serving. The dev server then throws "Cannot find module
   * './331.js'" on every route until it is restarted.
   *
   * Setting NEXT_DIST_DIR sends a build somewhere else, so verification builds
   * can run without disturbing a dev server:
   *
   *   NEXT_DIST_DIR=.next-verify npm run build
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
