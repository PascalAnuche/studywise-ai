# .agents

Everything an agent or developer needs beyond the root `../README.md`. Start from `../AGENTS.md`, which indexes this folder and holds the open decisions.

## Contents

```
docs/            architecture, data model, API, design
  product/       PRD, roadmap, changelog
rules/           normative standards, follow when writing code
studywise-ai-prompt.md   AI behavior spec — authoritative
```

`docs/` is descriptive, it explains how the system works. `rules/` is normative, it constrains how you write code. When the two disagree, `rules/` wins and the doc needs updating.

## `studywise-ai-prompt.md`

Authoritative, supplied 10 August 2026. It was missing from the repo for a period while eleven documents cited it; a reconstruction stood in and has been fully replaced.

The eight documents that depend on its content, and on what:

| Cited by | For |
| --- | --- |
| `docs/ARCHITECTURE.md` | Explain mode, and section 10 for mode routing |
| `docs/API.md` | Section 10, Explain mode on `/api/assistant/ask` |
| `docs/DATA_MODEL.md` | Section 9, the answer/because/confidence format stored per explanation |
| `docs/COMPONENTS.md` | Section 9, the signal `ConfidenceBadge` renders |
| `rules/SECURITY.md` | Section 12, treating academic performance data as sensitive by default |
| `../studywise-ai-prd.md` | Described as 13 sections covering role, explainability, modes, privacy, escalation |
| `docs/product/ROADMAP.md` | Listed as a completed prerequisite |
| `docs/product/CHANGELOG.md` | Listed as delivered |

Sections 9, 10, and 12 are depended on by number. Renumbering the spec breaks five documents.

One discrepancy the arrival of the original exposed, tracked in `../AGENTS.md`: prompt section 9 spells the middle confidence value **`one valid interpretation`**, while `docs/DATA_MODEL.md`, `docs/COMPONENTS.md`, and `docs/DESIGN_SYSTEM.md` all spell it **`one interpretation`**. It is a stored enum and a rendered label, so one spelling has to win before `ConfidenceBadge` is built.
