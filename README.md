# StudyWise AI

An AI learning assistant that helps university students learn with confidence, explainable answers, a study planner, and AI-generated quizzes with progress tracking, all in one platform.

## Documentation

All documentation lives under `.agents`. Start with `AGENTS.md`, it indexes everything below and holds the open decisions.

**Product**
- Product requirements: `studywise-ai-prd.md` — at the repo root, the root reference for everything built
- Roadmap: `.agents/docs/product/ROADMAP.md`
- Changelog: `.agents/docs/product/CHANGELOG.md`

**Engineering and design** (`.agents/docs`)
- Architecture: `.agents/docs/ARCHITECTURE.md`
- Data model: `.agents/docs/DATA_MODEL.md`
- API reference: `.agents/docs/API.md`
- Components: `.agents/docs/COMPONENTS.md`
- Design system: `.agents/docs/DESIGN_SYSTEM.md`
- Installation: `.agents/docs/INSTALLATION.md`
- Deployment: `.agents/docs/DEPLOYMENT.md`

**Rules** (`.agents/rules`), normative, follow these when writing code
- Code style: `.agents/rules/CODE_STYLE.md`
- Contributing: `.agents/rules/CONTRIBUTING.md`
- Security: `.agents/rules/SECURITY.md`
- Testing: `.agents/rules/TESTING.md`

**Agent context** (`.agents`)
- AI assistant behavior spec: `.agents/studywise-ai-prompt.md` — not yet written, see `.agents/README.md`

## Tech Stack
- Next.js (App Router) + TypeScript
- SQLite
- Styling: Tailwind CSS (default, pending confirmation, see AGENTS.md Open Items)
- AI Provider: not yet decided, integrated behind an adapter so this is a config change later, not a rewrite

## Getting Started
```
npm install
npm run dev
```
App runs at `http://localhost:3000`.

## Project Structure
```
/app
  /(dashboard)        → Home dashboard
  /assistant          → AI Study Assistant
  /planner            → Study Planner
  /practice           → AI-Generated Quiz
  /progress           → Progress Tracking
  /api                → API routes, one subfolder per feature above
/lib
  /ai                 → AI provider adapter, prompt templates, mode routing
  /db                 → SQLite client, schema, queries
/components           → Shared UI components
/tokens               → Figma token exports, build script, generated CSS
/.agents              → All documentation
  /docs               → Architecture, data model, API, design
    /product          → PRD, roadmap, changelog
  /rules              → Code style, contributing, security, testing
```

Design tokens live in `/tokens`: the two `design-tokens.tokens*.json` Figma exports, `build-tokens.js`, and the generated `tokens.css`. Regenerate with `node tokens/build-tokens.js`. See `.agents/docs/DESIGN_SYSTEM.md`.

## Status
v1 in planning, implementation hasn't started. The PRD and the AI behavior spec are complete. Design tokens for color and typography are defined and generated. The build sequence is in `.agents/docs/IMPLEMENTATION_PLAN.md`.

See `AGENTS.md` under Open Items for pending decisions, AI provider, styling library, test framework, confidence-indicator calculation, and the still-undiagrammed Progress Tracking flow.
