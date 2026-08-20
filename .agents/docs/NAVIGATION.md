# Navigation and Flows

The eight flows from the approved flow diagram, and where each one lives in the app.

Source of truth for the shape of each flow is the diagram; this file records how it maps to routes, and what is built.

## Destinations

`components/navigation.ts` is the single list. The sidebar reads it, and the topbar reads it for the current section label, so the two cannot disagree about what exists.

| # | Flow | Route | Sidebar | Status |
| --- | --- | --- | --- | --- |
| — | Home | `/` | yes | Built to the approved design |
| 1 | Learn with AI Assistant | `/assistant` | yes | Built to the approved design |
| 2 | Create a Study Plan | `/planner` | yes | Built to the approved design |
| 3 | Take an AI-Generated Quiz | `/practice` | **no** | Built |
| 4 | Resources & Upload Materials | `/resources` | yes | Screen built, renders from `lib/mock` |
| 5 | Notes | `/notes` | yes | Screen built, renders from `lib/mock` |
| 6 | Track Learning Progress | `/progress` | yes | Built |
| 7 | Achievements & Study Streak | `/achievements` | yes | Screen built, achievements from `lib/mock`, streak is real |
| 8 | Profile & Settings | `/profile`, `/settings` | yes | Profile is real; Settings renders from `lib/mock` |

**Flow 3 has no sidebar entry.** The approved design's sidebar has eight items and Practice is not among them, but flow 3 needs a home. It is reached from the Home composer's "Generate Quiz" action, from AI recommendations, and from weak-area links on Progress, so the flow is never a dead end. Open question in the PRD section 12.

Flow 5 covered two destinations in the original diagram, Notes and Flashcards. Flashcards was removed from the product; Notes is what remains.

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

## AI Assistant

Three columns: recent conversations, the conversation, and the "why" rail.

```
Chat list          Conversation                    Why this answer?
─────────          ────────────────────────        ────────────────
New Chat           Question                        Reasoning
Recent Chats       Answer, tables rendered         Confidence
  (explanations)   Explain this answer             Sources
Clear (disabled)   Understanding checkpoint        (sample data)
                   Follow-ups
                   Composer
```

A "chat" is a saved explanation and its follow-ups — the schema already models a thread that way, so nothing new was introduced to reconcile later. `AnswerBody` renders markdown tables, because "what is the difference between X and Y" is one of the most common shapes an explanation takes and the design shows it as a real table.

On this screen the reasoning lives in its own column rather than a collapsible: `DESIGN_SYSTEM.md` calls the "why" affordance the biggest lever for trust.

## Study Planner

```
Toolbar: ‹ week › · Today · Week | Month(disabled)
─────────────────────────────────────────────────
Hour grid 8 AM – 8 PM × Mon–Sun     Session detail
Sessions placed by start time       Topic, notes
                                    Mark complete (disabled)
Create Study Plan  ───▶ modal       This week checklist
```

Sessions are positioned from `start_time` and `duration_minutes`, so the calendar is a view of the plan rather than a second copy. A session with no start time cannot be placed on a time grid, so it is listed under the calendar instead of being dropped or given an invented slot.

The plan form is a modal behind **Create Study Plan**: creating a plan is occasional, and reading the schedule is what the page is for the rest of the time.

## Cross-feature seams

The journey map is Discover → Learn → Practice → Track → Reflect. A feature that only connects back to Home works against PRD section 3's goal of fewer separate tools. Existing seams:

| From | To | Where |
| --- | --- | --- |
| An answer | Practice or Planner | `FollowUpPrompt` on the answer |
| A quiz result | Assistant or Planner | `RecommendationCard` after submitting |
| A weak area | Assistant or Practice | `WeakAreaList` on Progress |
| Home | any flow | Composer quick actions and recommendations |

Planned by the flow diagram, not yet built: a material (flow 4) should reach Assistant and Practice; a note (flow 5) should reach Assistant and Practice.

## Adding a destination

1. Add it to `PRIMARY_DESTINATIONS` or `SECONDARY_DESTINATIONS` in `components/navigation.ts`, with its flow number
2. Add a filled icon variant in `components/Icon.tsx` — the active state uses the solid form, not colour alone
3. Create the route with a `loading.tsx`
4. Add the row to the table above

See `EXTENDING.md` for the rest.
