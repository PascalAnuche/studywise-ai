# Code Style

## General
- TypeScript strict mode, no `any` without a comment explaining why
- Functional components only, no class components
- Named exports for components, default exports only where Next.js requires them (page files)

## Naming
- Components: PascalCase (`ConfidenceBadge.tsx`)
- Utility functions: camelCase
- Database tables and columns: snake_case, matching `../docs/DATA_MODEL.md`
- API routes: kebab-case URLs, camelCase keys in request/response JSON

## File Organization
- One component per file, colocate its types in the same file unless shared across features
- Feature-specific components live under their feature folder (`/app/assistant/components`), shared components live in `/components`

## Formatting
- Prettier, default config unless a specific need arises
- ESLint, `next/core-web-vitals` as the baseline config

## AI-Specific Conventions
- Prompt templates live as string constants in `/lib/ai/prompts`, not inline template literals scattered through route handlers
- Never log full student questions or AI responses in production, per `SECURITY.md`

## Comments
- Comment why, not what, the code should be readable enough that "what" is redundant
- Flag any TODO tied to an open item in `../../AGENTS.md` by name, e.g. `// TODO: AI_PROVIDER not yet decided, see AGENTS.md`
