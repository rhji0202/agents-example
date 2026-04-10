---
description: "Generate TypeScript types, mock data, and frontend components from a spec. Enables frontend publishing without backend."
argument-hint: "[spec domain name] [page/feature description] (e.g., order 신청서페이지)"
---

# Spec Publish Command (스펙 기반 프론트엔드 퍼블리싱)

> Orchestrates spec-to-frontend publishing. Detailed generation rules live in the `spec-publisher` agent.

**Input**: $ARGUMENTS

---

## Process

### Step 1: LOCATE SPEC

**If domain name + page description provided** (e.g., `rbac 관리자 로그인페이지`):
1. Find `docs/specs/{domain}.v{N}.md` (latest version)
2. Confirm spec exists

**If only domain name provided:**
1. Find the spec
2. Ask which page/feature to publish

**If no input:**
> 어떤 스펙을 기반으로 퍼블리싱하시겠습니까?
>
> 사용 가능한 스펙 목록을 확인합니다...

List specs in `docs/specs/` and ask user to choose.

**GATE**: Confirm spec found before proceeding.

---

### Step 2: DELEGATE TO spec-publisher

Pass the following to the `spec-publisher` agent:
- Spec file path
- Target page/feature description from user input
- Any existing frontend patterns already observed

The agent handles all generation internally:
- Types, fixtures, MSW handlers, API client, components
- Scanning existing frontend structure
- Route group determination
- File placement decisions

**Do NOT repeat the agent's generation rules here** — the agent owns those instructions.

---

### Step 3: VERIFY & SUMMARY

After the agent completes:

1. Verify generated files exist
2. Present summary:

```markdown
## 퍼블리싱 준비 완료

### 생성된 파일
{list generated files}

### 실행 방법
1. `cd frontend && pnpm dev`
2. MSW가 콘솔에 "[MSW] Mocking enabled" 출력 확인
3. 페이지 접근하여 목데이터로 동작 확인

### 백엔드 연동 시
1. MSW 비활성화 (환경변수 또는 코드 제거)
2. API 클라이언트 URL이 실제 백엔드를 가리키도록 확인
3. Types는 그대로 유지 (계약 역할)
```

---

## Error Handling

- Spec not found → ask user to run `/spec-gen` first
- Data model missing in spec → flag and ask user
- Architectural questions → delegate to `architect` agent

## Related Commands

- `/spec-gen` — 기획서 → 스펙 변환
- `/plan` — 구현 계획
- `/feature-dev` — 기능 개발 워크플로
