/**
 * Stub for the `server-only` package under Vitest.
 *
 * The real package deliberately throws when imported outside a React Server
 * Component, which is exactly what a unit test looks like. Aliasing it here
 * means server modules can be tested directly instead of having their logic
 * split into a second file just to make it reachable.
 *
 * This changes nothing about the app build: Next still resolves the real
 * package, so a `server-only` module imported from a client component is still
 * a build error.
 */
export {};
