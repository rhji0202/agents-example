# Spec-Driven Workflow

## Spec Structure: Page-Centric Single File

Each domain/page produces **one spec file** (`docs/specs/{domain-id}.v{N}.md`) containing all aspects: data model, workflow, screens, popups, actions, and business rules. No multi-file splits (domain/workflow/actions/policies/ui).

- Spec documents are **reference documents** — no line-count limit (unlike source code's 800-line rule)
- Shared content (enums/policies across domains) goes to `docs/specs/shared/`

## Rules

### Planning Phase (always applies)

1. **Never overwrite spec files.** Always create a new version file (v1.md, v2.md, v3.md). Stable specs are immutable.
2. **Spec changes must precede implementation.** Do not implement features without a corresponding spec. If no spec exists, create one first with `/spec-gen`.
3. **Use ADD/MODIFY/REMOVE prefixes** in the Changes section. Each line becomes a traceable task via `/spec-sync`.
4. **Every spec version must include the triple:** Current State, Changes, Target State. This is non-negotiable for AI accuracy.
5. **Draft specs are mutable. Stable specs are not.** Only edit specs with `status: draft`. To change a stable spec, create a new draft version.
6. **Partial updates only.** When a spec changes, update only the affected tasks and code. Never regenerate everything.
7. **Inline actions with validation rules.** Keep interaction descriptions and their related validation rules together in the same section (screens/popups), not split across files.

### Implementation Phase (applies when transitioning to development)

8. **Always update state after task completion.** Every task status change must update `docs/state/{id}.json` and append an event to `docs/state/{id}.events.jsonl`.
9. **Task IDs trace to spec changes.** Every task's `source_change` field must reference the exact change line from the spec diff.
10. **Events are append-only.** Never edit or delete lines from `.events.jsonl` files.

> **Note**: `docs/state/` and `docs/tasks/` are NOT created during spec generation (planning phase). They are created when transitioning to implementation via `/spec-sync` or equivalent.

## When This Rule Applies

- Before implementing any feature: check if a spec exists in `docs/specs/`
- When requirements change: create a new spec draft, don't edit the stable version
- When transitioning to implementation: create state and task files
- After completing a task (implementation phase): update state and events
