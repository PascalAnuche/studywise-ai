# Installation

## Prerequisites
- Node.js 20+
- npm 10+

## Setup
1. Clone the repo
2. `npm install`
3. Copy the environment template: `cp .env.example .env.local`
4. Fill in the required environment variables (below)
5. Initialize the database: `npm run db:migrate`
6. Start the dev server: `npm run dev`
7. Visit `http://localhost:3000`

## Environment Variables
| Variable | Required | Notes |
|---|---|---|
| DATABASE_URL | Yes | SQLite file path, e.g. `file:./dev.db` |
| AI_PROVIDER | Yes | Not yet decided, see `../../AGENTS.md` |
| AI_PROVIDER_API_KEY | Yes | Depends on the provider chosen |

## Verifying Setup
The dev server should load the dashboard at `/`, and `npm run typecheck` and `npm run lint` should both pass on a clean clone.

Note: the scripts referenced here don't exist yet, this file should be updated the moment the Next.js scaffold is initialized, same caveat as `../../AGENTS.md`.
