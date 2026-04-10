---
description: Decompose a raw domain specification document into a structured page-centric spec file
argument-hint: <path/to/spec-document.md> [--id <domain-id>] [--skip-validation]
---

Parse the following from $ARGUMENTS:
1. `document_path` — Path to the raw domain specification document (required)
2. `--id <domain-id>` — (optional) Override auto-detected domain ID
3. `--skip-validation` — (optional) Skip the validation step after generation

## Spec Generator Orchestrator

This command orchestrates the full spec generation pipeline: analyze → preview → write → validate.

### Step 1: Analyze

Launch the `spec-analyzer` agent with the document path and optional `--id` override.

The analyzer will:
- Read and classify the document's sections
- Determine the unified section structure for the page spec
- Detect cross-cutting concerns with existing domains
- Write the analysis to `docs/specs/.analysis/{domain-id}.analysis.json`
- Output a **preview** showing the proposed section structure

**IMPORTANT**: After the analyzer outputs the preview, **STOP and wait for user confirmation**. Show the preview and ask:

```
위 구조로 스펙 파일을 생성할까요? (Y/n)
- domain-id를 변경하려면: --id <new-id>
- 섹션 구성을 변경하려면: 어떤 섹션을 추가/제거할지 알려주세요
```

Do NOT proceed to Step 2 until the user confirms.

### Step 2: Write

After user confirmation, launch the `spec-writer` agent with the analysis JSON path.

The writer will:
- Read the analysis JSON and source document
- Generate a single unified spec file at `docs/specs/{domain-id}.v{N}.md`
- Output a generation summary

### Step 3: Validate (unless --skip-validation)

If `--skip-validation` is NOT set, launch the `spec-validator` agent with the domain-id.

The validator will:
- Check the generated file for spec-workflow compliance
- Verify the Current/Changes/Target triple
- Check source coverage and section completeness
- Output a validation report with PASS/WARN/FAIL verdict

### Output

After all steps complete, output a final summary:

```
## /spec-gen 완료

**도메인**: {domain_name} (`{domain_id}`)
**버전**: v{N}
**생성된 파일**: docs/specs/{domain_id}.v{N}.md

**검증 결과**: {PASS/WARN/FAIL}
```

### Usage Examples

```bash
# 기본 사용 — 분석 → preview → 확인 → 생성 → 검증
/spec-gen 대행신청.md

# domain-id 직접 지정
/spec-gen 대행신청.md --id proxy-order

# 검증 건너뛰기 (빠른 생성)
/spec-gen 대행신청.md --skip-validation

# 다른 경로의 문서
/spec-gen docs/raw/inventory-request.md --id inventory
```

### Related

- **Skill**: `spec-management` — 전체 라이프사이클 가이드
- **Agents**: `spec-analyzer`, `spec-writer`, `spec-validator`
- **Rules**: `common-spec-workflow.md`
