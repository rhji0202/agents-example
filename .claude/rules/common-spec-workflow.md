# Spec-Driven Workflow

## Rules

1. **Never overwrite spec files.** Always create a new version file (v1.md, v2.md, v3.md). Stable specs are immutable.
2. **Always update state after task completion.** Every task status change must update `docs/state/{id}.json` and append an event to `docs/state/{id}.events.jsonl`.
3. **Spec changes must precede implementation.** Do not implement features without a corresponding spec. If no spec exists, create one first with `/spec create`.
4. **Use ADD/MODIFY/REMOVE prefixes** in the Changes section. Each line becomes a traceable task via `/spec-sync`.
5. **Every spec version must include the triple:** Current State, Changes, Target State. This is non-negotiable for AI accuracy.
6. **Task IDs trace to spec changes.** Every task's `source_change` field must reference the exact change line from the spec diff.
7. **Draft specs are mutable. Stable specs are not.** Only edit specs with `status: draft`. To change a stable spec, create a new draft version.
8. **Partial updates only.** When a spec changes, update only the affected tasks and code. Never regenerate everything.
9. **Events are append-only.** Never edit or delete lines from `.events.jsonl` files.

## When This Rule Applies

- Before implementing any feature: check if a spec exists in `docs/specs/`
- After completing a task: update state and events
- When requirements change: create a new spec draft, don't edit the stable version
