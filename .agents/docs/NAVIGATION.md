# Navigation and Flows

The eight flows from the approved flow diagram, and where each one lives in the app.

Source of truth for the shape of each flow is the diagram; this file records how it maps to routes, and what is built.

## Destinations

`components/navigation.ts` is the single list. The sidebar reads it, and the topbar reads it for the current section label, so the two cannot disagree about what exists.

| # | Flow | Route | Sidebar | Status |
| --- | --- | --- | --- | --- |
| — | Home | `/` | yes | Built to the approved design |
| 1 | Learn with AI Assistant | `/assistant` | yes | Built |
| 2 | Create a Study Plan | `/planner` | yes | Built |
| 3 | Take an AI-Generated Quiz | `/practice` | **no** | Built |
| 4 | Resources & Upload Materials | `/resources` | yes | Route only |
| 5 | Notes & Flashcards | `/notes`, `/flashcards` | yes | Routes only |
| 6 | Track Learning Progress | `/progress` | yes | Built |
| 7 | Achievements & Study Streak | `/achievements` | yes | Route only |
| 8 | Profile & Settings | `/profile`, `/settings` | yes | Routes only |

**Flow 3 has no sidebar entry.** The approved design's sidebar has eight items and Practice is not among them, but flow 3 needs a home. It is reached from the Home composer's "Generate Quiz" action, from AI recommendations, and from weak-area links on Progress, so the flow is never a dead end. Open question in the PRD section 12.

Flow 5 is one diagram covering two destinations: Notes is the writing half, Flashcards the recall half. They are separate sidebar entries because the design lists them separately.

## Home

Home is the hub every flow returns to, and the only screen the approved design specifies in full.

```
Sidebar            Main column                        Assistant rail
─────────          ──────────────────────────         ──────────────
8 destinations     Greeting                           Latest explanation
Profile/Settings   Composer + 4 quick actions         answer / because / confidence
Upgrade to Pro     Today's Plan | Learning Progress   Sources, when available
Theme toggle       AI Recommendations                 Follow-up composer
```

The four quick actions each start a different flow, and "Generate Quiz" is how a student reaches Practice.

The assistant rail is a **reading surface, not a second Assistant**. It shows the most recent saved explanation and hands every interaction to `/assistant`, so one place owns the thread and one place owns the section 9 format.

## Cross-feature seams

The journey map is Discover → Learn → Practice → Track → Reflect. A feature that only connects back to Home works against PRD section 3's goal of fewer separate tools. Existing seams:

| From | To | Where |
| --- | --- | --- |
| An answer | Practice or Planner | `FollowUpPrompt` on the answer |
| A quiz result | Assistant or Planner | `RecommendationCard` after submitting |
| A weak area | Assistant or Practice | `WeakAreaList` on Progress |
| Home | any flow | Composer quick actions and recommendations |

Planned by the flow diagram, not yet built: a material (flow 4) should reach Assistant, Practice and Flashcards; a note (flow 5) should reach Assistant and Practice.

## Adding a destination

1. Add it to `PRIMARY_DESTINATIONS` or `SECONDARY_DESTINATIONS` in `components/navigation.ts`, with its flow number
2. Add a filled icon variant in `components/Icon.tsx` — the active state uses the solid form, not colour alone
3. Create the route with a `loading.tsx`
4. Add the row to the table above

See `EXTENDING.md` for the rest.
