---
description: "Generate structured specs from planning documents (기획서 → 스펙). Orchestrates analysis, writing, and validation agents."
argument-hint: "[path to planning doc or domain name] (blank = interactive mode)"
---

# Spec Generation Command (기획서 문서화)

> Orchestrates the spec-driven workflow: analyze → write → validate → generate tasks.
> Detailed rules for each phase live in the respective agents.

**Input**: $ARGUMENTS

---

## Process

### Phase 1: INPUT — Identify Source

**If a file path is provided:**
1. Read the file at the given path
2. Identify the document type and language
3. Proceed to Phase 2

**If a domain name is provided:**
1. Check `docs/specs/` for existing specs in this domain
2. If exists: ask whether to create a new version or review existing
3. If not: proceed to interactive mode

**If no input provided (interactive mode):**

> 어떤 기획서를 문서화하시겠습니까?
>
> 1. **파일 경로** — 기획서 파일이 있으면 경로를 알려주세요
> 2. **도메인 이름** — 새 스펙을 생성할 도메인 이름을 입력하세요 (예: order, shipping, payment)
> 3. **직접 입력** — 기획 내용을 직접 설명해 주세요

**GATE**: Wait for user response before proceeding.

---

### Phase 2: ANALYZE

Delegate to `spec-analyzer` agent with the planning document content.

Present the analysis report to the user:

> **분석 결과 (Analysis Result)**
>
> {analysis summary}
>
> 진행하시겠습니까? 수정할 부분이 있으면 알려주세요.

**GATE**: Wait for user confirmation before proceeding.

---

### Phase 3: WRITE

Delegate to `spec-writer` agent with:
- Analysis report from Phase 2
- Original planning document
- Version number (new domain → v1, existing → increment)

The agent generates:
- `docs/specs/{domain}.v{N}.md`
- `docs/state/{domain}.json`
- `docs/state/{domain}.events.jsonl`

---

### Phase 4: VALIDATE

Delegate to `spec-validator` agent with the generated spec path.

- **FAIL** → pass failure details back to `spec-writer` for correction (auto-retry once)
- **PASS WITH WARNINGS** → show warnings to user, continue
- **PASS** → proceed to Phase 5

---

### Phase 5: TASKS

Delegate to `planner` agent:
- Read the validated spec
- Generate `docs/tasks/{domain}-v{N}.json` following `docs/tasks/_schema.json`
- Update state file with task counts

---

### Phase 6: SUMMARY

```markdown
## Spec Generation Complete

### Generated Files
- Spec: `docs/specs/{domain}.v{N}.md`
- State: `docs/state/{domain}.json`
- Events: `docs/state/{domain}.events.jsonl`
- Tasks: `docs/tasks/{domain}-v{N}.json`

### Statistics
- Functional Requirements: {N}
- Non-Functional Requirements: {N}
- User Stories: {N}
- Implementation Tasks: {N}

### Next Steps
1. Review the spec: `docs/specs/{domain}.v{N}.md`
2. Publish frontend: `/spec-publish {domain}`
3. Track progress: check `docs/state/{domain}.json`
```

---

## Error Handling

- Critical gaps in analysis → pause and ask user for missing information
- Spec validation failure → auto-retry once with corrective context
- Architectural conflicts → delegate to `architect` agent
- User cancels → save partial work as draft

## Related Commands

- `/spec-publish` — 스펙 → 프론트엔드 퍼블리싱
- `/plan` — 구현 계획
- `/feature-dev` — 기능 개발 워크플로
