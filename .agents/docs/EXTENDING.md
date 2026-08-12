# Extending StudyWise

How to add a feature, and how to re-skin the product, without breaking what is already here.

Read `../../AGENTS.md` first. The standing rules there apply to everything below: anchor work to the PRD, take all colour and type from `/tokens`, and treat UI quality as part of the requirement.

---

## A total UI overhaul

The product is built so a redesign is a change to tokens and components, not a rewrite. Four things make that true. Keep them true.

### 1. The role layer is the contract

Components reference `--color-primary`, never `--_p-indigo-500`. Role names are stable; what they point at is not. That single indirection is what lets the palette change underneath every component at once.

**A re-skin is a token file, not a CSS edit.** Re-export from Figma, run `npm run tokens`, done. If you find yourself editing hex values in a `.module.css`, stop: the change belongs in `/tokens`.

### 2. Themes are additive

A theme file is `<name>.theme.tokens.json` in `/tokens`. It restates the **whole role set** against the same primitives, and the build emits:

```css
[data-theme='dark'] { … }                       /* explicit choice */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) { … }                 /* system preference */
}
```

Explicit choice wins over system preference. `ThemeToggle` sets the attribute and nothing else; it knows no colours.

A theme must define every role. The build warns if one is missing, because interaction states (hover, pressed, focus) are *derived* from the roles — a half-defined theme mixes light hovers into dark surfaces. Theme primitives are namespaced (`--_p-dark-indigo-300`) so both palettes stay readable, and an identical colour in both themes is stored once.

Adding a third theme, or replacing the brand entirely, is the same operation.

### 3. The catalogue is the inventory

`/preview` shows every shared component in every state it must handle: loading, disabled, empty, error, and all four AI response shapes.

**Rebuild against it.** Redesigning without an inventory means rediscovering the forgotten states one bug report at a time — the disabled button, the empty list, the escalation that must not look like an answer. It is also the fastest theme check: switch theme in the topbar and judge everything at once.

Add a specimen whenever you add a component or a state. A state that is not on this page will be missed.

### 4. Rules live outside the components

Derived data belongs in `lib/view-models/`, not in JSX. "What is next" is the earliest scheduled session from an active plan, on or after today — that is a product rule, and it must survive a page being rewritten.

`lib/view-models/dashboard.ts` is the pattern: the page renders, the view model decides. Its rules are unit-tested without rendering anything.

### What the tests protect during a redesign

| Test | Catches |
| --- | --- |
| `tokens/contrast.test.ts` | A new palette or theme failing WCAG AA. Known failures are listed explicitly, and the test fails if one is *fixed* so the list cannot rot |
| `lib/copy.test.ts` | Copy that characterises the student rather than the work (prompt §12) |
| `lib/view-models/*.test.ts` | Product rules quietly changing when a page is rewritten |

And look at it: `npm run shots` renders every page at desktop and mobile. Full-page capture flattens sticky elements, so use `node scripts/viewshot.mjs <url> <out>` when checking anything sticky.

---

## Adding a feature

The four v1 features (PRD section 7) are all built the same way. A fifth follows the same path.

### 1. Decide whether it needs a new AI mode

Prompt section 10 defines four: Explain, Plan, Track, Quiz. Modes do not bleed into each other, and **mode comes from the calling route, never from request content**.

A new mode means:

- Add it to `Mode` in `lib/ai/types.ts`
- Add its instructions to `MODE_INSTRUCTIONS` in `lib/ai/prompts/modes.ts`
- Add a method to the `AiProvider` interface, and implement it in `lib/ai/providers/mock.ts`
- Add a `run*` entry point in `lib/ai/index.ts`

The result type is its own union: `<Mode>Result = <Success> | AsideResult`. **Every mode must be able to return an `AsideResult`** — a student can disclose distress while planning as easily as while asking a question, and prompt section 13 holds everywhere.

### 2. Data

Add tables to `lib/db/schema.sql` and mirror them in `DATA_MODEL.md`. The two are kept in sync by hand; they drift the moment you skip one.

Nullable means something. `understood` is null until a checkpoint is answered, and null is never counted as "no".

### 3. Routes

One folder per feature under `app/api`. Every route:

- Resolves the student through `getCurrentStudentId()`, never from the query string
- Validates with the helpers in `lib/api.ts`
- Returns **camelCase DTOs, never raw database rows** (`../rules/CODE_STYLE.md`)
- Persists only what should be persisted — see the `isPersistable` boundary

### 4. UI

- Feature components under `app/<feature>/components/`
- Shared components in `/components`, and add them to `/preview`
- Add a `loading.tsx`; without one a click shows nothing until the server responds
- Add the destination to `components/navigation.ts` — sidebar and topbar both read from it, so they cannot disagree

### 5. Wire it into the loop

The journey map is Discover → Learn → Practice → Track → Reflect. A feature that does not connect to the others works against PRD section 3's goal of fewer separate tools.

Existing seams: follow-up offers from an answer, recommendations after a quiz, weak-area links on Progress. A new feature should both offer a way out and be reachable from elsewhere.

### 6. Docs

Update `COMPONENTS.md`, `API.md`, `DATA_MODEL.md`, and the changelog. `../../AGENTS.md` gets any new open decision — do not resolve one by implementing it.

---

## Mock data

Two sources, and the difference matters.

**`scripts/seed.mjs`** fills the real database for the features that have tables. It seeds one student with a term of coherent study: the topics on the plan are the topics quizzed, the weak areas are the ones actually missed, and the recommendations name those same topics. Dates are relative to today, so it never goes stale, and it is re-runnable. `npm run db:seed`.

**`lib/mock/`** covers the four flows with no backend yet: Resources, Notes, Flashcards, Achievements, and the Settings preferences. Three rules keep it honest:

1. **Everything is in that one module.** No fixture is inlined in a component, so deleting `lib/mock` and following the type errors is an exact inventory of what still needs a real source
2. **The shapes are what the real queries should return**, so swapping the source is a change of import, not a rewrite
3. **It agrees with the seed.** Same topics, same subjects, same dates

Every screen rendering from `lib/mock` says so on the page, via `MockNotice`. Sample data that looks indistinguishable from real data is how a stakeholder ends up believing a feature is finished.

When a flow gets its backend, delete its section from `lib/mock`, drop the `MockNotice`, and extend the seed instead.

## Things that will bite

- **`npm run dev` is slow by design.** It compiles each route on first visit. Benchmark with `npm run build && npm start`, and run only one dev server.
- **`migrate --fresh` fails while a server holds the database.** Stop it first; the script says so. A plain `npm run db:migrate` works regardless: it applies `schema.sql` and then any additive column migrations listed in `scripts/migrate.mjs`, because `CREATE TABLE IF NOT EXISTS` never adds a column to a table that already exists. New columns go in that list as well as in `schema.sql`.
- **Do not hand-edit `tokens/tokens.css`.** It is generated, and your edit disappears on the next export.
- **Do not reference `--_p-*` in a component.** Primitives are internal; naming one stops a palette change propagating, which is the whole point of the split.
