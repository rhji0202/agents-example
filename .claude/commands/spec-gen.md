---
description: "Generate structured specs from planning documents (기획서 → 스펙). Orchestrates analysis, writing, and validation agents."
argument-hint: "[path to planning doc or domain name] (blank = interactive mode)"
---

# Spec Generation Command (기획서 문서화)

> Orchestrates the spec-driven workflow: analyze → write → validate → generate tasks.

**Input**: $ARGUMENTS

---

## Your Role

You are the spec generation orchestrator. You coordinate multiple specialized agents to convert planning documents into structured, versioned specification documents.

**Available agents you MUST use:**
- `spec-analyzer` — Analyze requirements and identify gaps
- `spec-writer` — Write the structured spec document
- `spec-validator` — Validate the completed spec
- `planner` — Generate task breakdowns from validated specs
- `architect` — Resolve architectural questions during spec writing

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
>
> Which planning document would you like to convert?

**GATE**: Wait for user response before proceeding.

---

### Phase 2: ANALYZE — Requirement Extraction

Delegate to **spec-analyzer** agent:

1. Pass the planning document content
2. Request structured analysis including:
   - Extracted requirements (functional + non-functional)
   - Gap analysis
   - Conflict check against existing specs
   - Feasibility assessment
3. Present the analysis report to the user

> 📋 **분석 결과 (Analysis Result)**
>
> {analysis summary}
>
> 진행하시겠습니까? 수정할 부분이 있으면 알려주세요.
> Proceed with spec generation? Let me know if anything needs adjustment.

**GATE**: Wait for user confirmation before proceeding.

---

### Phase 3: WRITE — Spec Generation

Delegate to **spec-writer** agent:

1. Pass the analysis report and original planning document
2. Determine version number:
   - New domain → v1
   - Existing domain → increment from latest version
3. Generate the spec at `docs/specs/{domain}.v{N}.md`
4. Generate state file at `docs/state/{domain}.json`
5. Log event to `docs/state/{domain}.events.jsonl`

---

### Phase 4: VALIDATE — Quality Check

Delegate to **spec-validator** agent:

1. Pass the generated spec path
2. Run full validation checklist
3. If FAIL: loop back to spec-writer with failure details
4. If PASS WITH WARNINGS: show warnings to user
5. If PASS: proceed to Phase 5

---

### Phase 5: TASKS — Generate Implementation Tasks

Delegate to **planner** agent:

1. Read the validated spec
2. Generate task breakdown at `docs/tasks/{domain}-v{N}.json`
3. Follow the task schema from `docs/tasks/_schema.json`
4. Update state file with task counts

---

### Phase 6: SUMMARY — Report

Present the final summary:

```markdown
## ✅ Spec Generation Complete

### Generated Files
- 📄 Spec: `docs/specs/{domain}.v{N}.md`
- 📊 State: `docs/state/{domain}.json`
- 📝 Events: `docs/state/{domain}.events.jsonl`
- ✅ Tasks: `docs/tasks/{domain}-v{N}.json`

### Statistics
- Functional Requirements: {N}
- Non-Functional Requirements: {N}
- User Stories: {N}
- Implementation Tasks: {N}
- Estimated Complexity: {Low/Medium/High}

### Next Steps
1. Review the spec: `docs/specs/{domain}.v{N}.md`
2. Start implementation: `/prp-implement {domain}`
3. Track progress: check `docs/state/{domain}.json`
```

---

## Error Handling

- If analysis finds critical gaps: pause and ask user for missing information
- If spec writing fails validation: auto-retry once with corrective context
- If architectural conflicts detected: delegate to **architect** agent for resolution
- If user cancels: save partial work as draft

## Related Commands

- `/plan` — General implementation planning
- `/prp-prd` — PRD generation (more product-focused)
- `/prp-implement` — Implement from an existing spec
- `/feature-dev` — Full feature development workflow
