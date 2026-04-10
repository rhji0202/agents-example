# Spec-Driven Workflow Standards (기획서 문서화 워크플로 표준)

## Purpose

This rule defines standards for converting planning documents (기획서) into structured specifications and tracking their implementation.

## Mandatory Workflow

When creating or updating specs:

1. **Analyze first** — Always run `spec-analyzer` before writing
2. **Use templates** — Follow the structure defined in `spec-documentation` skill
3. **Validate after** — Always run `spec-validator` after writing
4. **Track state** — Maintain state files in `docs/state/`
5. **Generate tasks** — Create task breakdowns in `docs/tasks/`

## File Conventions

| File Type | Path Pattern | Example |
|-----------|-------------|---------|
| Spec | `docs/specs/{domain}.v{N}.md` | `docs/specs/order.v1.md` |
| State | `docs/state/{domain}.json` | `docs/state/order.json` |
| Events | `docs/state/{domain}.events.jsonl` | `docs/state/order.events.jsonl` |
| Tasks | `docs/tasks/{domain}-v{N}.json` | `docs/tasks/order-v1.json` |

## Naming Rules

- Domain names: kebab-case, singular noun (`order`, `shipping`, `user-profile`)
- Spec IDs: same as domain name
- Requirement IDs: `FR-NNN` (functional), `NFR-NNN` (non-functional)
- User story IDs: `US-NNN`
- Task IDs: `{domain}-v{N}-NNN` (e.g., `order-v1-001`)

## Required Spec Sections

Every spec MUST include (matches `spec-documentation` skill template):

**Required:**
- [ ] Overview with clear purpose
- [ ] Problem statement with current state and pain points
- [ ] Functional requirements with IDs, priorities, and acceptance criteria
- [ ] Non-functional requirements covering at least performance and security
- [ ] User stories with acceptance criteria
- [ ] Dependencies list
- [ ] Constraints & assumptions
- [ ] Changelog

**Conditional** (include when the domain has data entities or API endpoints):
- [ ] Data model with entity definitions and relationships
- [ ] API contracts with request/response formats

**Optional** (include when helpful):
- [ ] UI/UX requirements with screens and user flows
- [ ] Glossary for domain-specific terms

## Spec Quality Checklist

Before a spec is considered complete:
- [ ] No filler content — unknowns marked as `TBD - needs clarification`
- [ ] Every requirement is testable and unambiguous
- [ ] Every user story links to requirements
- [ ] State file exists and matches spec version
- [ ] Task file exists with valid task IDs
- [ ] Schemas validated against `docs/state/_schema.json` and `docs/tasks/_schema.json`

## Timestamp Convention

All timestamps in state files and event logs MUST use KST with explicit offset:
- Format: `YYYY-MM-DDTHH:MM:SS+09:00` (e.g., `2026-04-10T21:00:00+09:00`)
- Do NOT use UTC (`Z` suffix) — maintain consistency across all files

## Version Management

- New domains start at v1
- Version increments are sequential (no gaps)
- Previous versions are never modified after promotion to `stable`
- Deprecated requirements are marked, not deleted
- Changelog entry required for every version

## Agent Orchestration

| Step | Agent | Trigger |
|------|-------|---------|
| Analysis | `spec-analyzer` | Before any spec writing |
| Writing | `spec-writer` | After analysis approval |
| Validation | `spec-validator` | After spec writing |
| Task planning | `planner` | After validation passes |
| Architecture | `architect` | When design questions arise |
| Doc sync | `doc-updater` | When docs need updating |

## Entry Point

Use `/spec-gen` command to start the spec generation workflow.
