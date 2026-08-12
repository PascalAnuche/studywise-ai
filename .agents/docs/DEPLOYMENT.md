# Deployment

No deployment target is confirmed yet, this doc holds the shape of what's needed once one is picked.

## Considerations
- SQLite is file-based, hosting needs persistent disk, not every serverless platform supports this by default, factor that in before picking a host
- AI provider costs scale with usage, no rate limiting is defined yet (`../rules/SECURITY.md`), add this before any public deployment
- No authentication system is specified in the PRD yet, don't deploy with real student data until one exists

## Environment
Production needs the same variables as `INSTALLATION.md`, with different values:

| Variable | Notes |
|---|---|
| NODE_ENV | `production`, the only variable not already in `INSTALLATION.md` |
| DATABASE_URL | already required for local, in production it points at a mounted volume rather than a working-directory file |

## Open Decisions
- Hosting platform not chosen
- CI/CD pipeline not set up
- No staging environment defined yet

This file should move from "shape of what's needed" to actual steps once a host is picked, don't let it go stale once real deployment starts.
