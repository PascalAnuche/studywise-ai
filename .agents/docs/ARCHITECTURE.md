# Architecture

## System Overview
StudyWise AI is a single Next.js application, server and client in one codebase, no separate backend service. SQLite runs embedded, no separate database server. The AI provider sits behind a single adapter layer so the rest of the app never talks to a provider SDK directly.

```
Browser (Next.js client components)
        │
        ▼
Next.js server (route handlers under /app/api)
        │
        ├──▶ /lib/db  ──▶ SQLite
        │
        └──▶ /lib/ai  ──▶ AI provider (adapter, provider TBD)
```

## Request Flow (example: Assistant "ask")
1. Student submits a question from the Assistant UI
2. `/api/assistant/ask` receives it, loads student context (course, prior explanations) from `/lib/db`
3. `/lib/ai` builds the prompt using the Explain mode defined in `../studywise-ai-prompt.md`, sends it to the provider
4. The response is parsed into answer, reasoning, and confidence, per the format in prompt section 9
5. The result is saved via `/lib/db` and returned to the client, `understood` still null
6. The client shows the understanding checkpoint, its answer triggers `/api/assistant/checkpoint`, which resolves `understood` and extends the streak

## Mode Routing
The AI adapter routes every request to one of four modes before building a prompt, Explain, Plan, Track, Quiz, matching the four features. Mode is determined by which API route called the adapter, not inferred from request content, this keeps behavior predictable (`../studywise-ai-prompt.md` section 10).

## Why No Separate Backend
Given SQLite and a single Next.js deployment target, a separate backend service adds deployment complexity without a clear benefit at v1 scale. Revisit if progress analytics (PRD 7.4) grow heavy enough to need background processing.

## Related Docs
- Data model: `DATA_MODEL.md`
- API contracts: `API.md`
- Coding conventions: `../rules/CODE_STYLE.md`
