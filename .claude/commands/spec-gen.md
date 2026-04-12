---
description: "Generate structured specs from planning documents (기획서 → 스펙). Orchestrates analysis, writing, and validation agents."
argument-hint: "[--domain <name>] [path to planning doc or domain name] (blank = interactive mode)"
---

# Spec Generation Command (기획서 문서화)

> Orchestrates the spec-driven workflow: analyze → write → validate → generate tasks.
> Detailed rules for each phase live in the respective agents.

**Input**: $ARGUMENTS

---

## Process

### Phase 0: PARSE ARGUMENTS

Parse `$ARGUMENTS` for the `--domain` flag:

1. If `$ARGUMENTS` contains `--domain <name>`:
   - Extract `<name>` as the target domain (kebab-case, singular noun)
   - Proceed to **Phase 1-D** (domain-targeted mode)
2. Otherwise:
   - Proceed to **Phase 1** (legacy mode, unchanged)

---

### Phase 1-D: DOMAIN-TARGETED INPUT

> This phase runs only when `--domain <name>` is provided. It skips interactive mode entirely.

1. Search `docs/specs/` for files matching `{domain}.v*.md`
2. Search `docs/state/{domain}.json` for current state
3. Search `docs/tasks/{domain}-v*.json` for existing tasks

**If existing spec found:**

Read the latest version spec and state file, then present:

> **📋 도메인 현황: `{domain}`**
>
> | 항목 | 값 |
> |------|-----|
> | 최신 버전 | v{N} |
> | 상태 | {status} |
> | 태스크 진행 | {tasks_completed}/{tasks_total} |
>
> 다음 중 선택하세요:
> 1. **새 버전 생성** — v{N+1} 스펙을 작성합니다 (기획서를 제공해주세요)
> 2. **기존 스펙 리뷰** — v{N} 스펙을 검토하고 개선합니다
> 3. **태스크 재생성** — 현재 스펙으로 태스크를 다시 생성합니다

**GATE**: Wait for user response.

- Option 1 → ask for planning document input, then proceed to Phase 2 with version = N+1
- Option 2 → load existing spec as input, proceed to Phase 2 (analysis of existing spec)
- Option 3 → skip to Phase 5 (task generation only) with current spec

**If no existing spec found:**

Check for similar domain names in `docs/specs/` (fuzzy match). If close matches exist, suggest them:

> **`{domain}` 도메인의 스펙이 없습니다.**
>
> 유사한 도메인: {similar domains, if any}
>
> 새 스펙(v1)을 생성합니다. 기획서를 제공해주세요:
> - 파일 경로 또는 직접 입력

**GATE**: Wait for user to provide planning document, then proceed to Phase 2 with version = 1.

---

### Phase 1: INPUT — Identify Source (Legacy Mode)

> This phase runs when `--domain` is NOT provided. Behavior is unchanged from before.

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
