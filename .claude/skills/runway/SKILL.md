---
name: runway
description: Multi-step implementation orchestrator. Explores project docs, designs self-contained execution steps, and generates phase files for automated sequential execution via scripts/runway.js.
origin: project
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Runway

프로젝트 문서(PRD, ARCHITECTURE 등)를 기반으로 구현 step을 설계하고, 자동 실행 가능한 phase 파일을 생성하는 워크플로우.

## When to Activate

- 새로운 기능 또는 모듈의 구현을 시작할 때
- 기획 문서가 준비되어 있고, 코드 scaffolding이 필요할 때
- 대규모 작업을 자동 실행 가능한 step으로 분해해야 할 때

## Workflow

$ARGUMENTS가 비어 있으면 사용자에게 task 이름을 물어본다.

### A. 탐색

`/docs/` 하위 문서를 읽고 프로젝트의 기획·아키텍처·설계 의도를 파악한다:

1. `/docs/PRD.md` — 비즈니스 요구사항, 사용자 여정, 스코프
2. `/docs/ARCHITECTURE.md` — 시스템 구조, Tech Stack, API 규칙, 디렉토리 구조
3. `/docs/PERMISSIONS.md` — 역할별 권한 매트릭스
4. `/docs/UI-GUIDE.md` — 디자인 원칙, 색상, 컴포넌트
5. `/CLAUDE.md` — 프로젝트 규칙, 커맨드

기존 `docs/phases/` 하위에 이미 생성된 phase가 있으면 현황을 파악한다.

프론트엔드 관련 작업이면 `docs/ui/` 하위의 UI 스펙도 확인한다.

### B. 논의

구현을 위해 구체화하거나 기술적으로 결정해야 할 사항이 있으면 사용자에게 제시하고 논의한다:

- 기술적 결정 사항 (라이브러리 선택, 아키텍처 패턴 등)
- 범위 확인 (어디까지 이 task에 포함할지)
- 의존성 (다른 task나 외부 시스템에 의존하는 부분)
- 프론트엔드 step이 필요한데 UI 스펙이 없으면 `/ui-spec {page}` 실행을 제안

사용자가 "진행해" 또는 "설계해줘" 라고 하면 C 단계로 넘어간다.

### C. Step 설계

**step-designer** 에이전트의 7원칙에 따라 step 초안을 작성한다:

1. **Scope 최소화** — 하나의 step에서 하나의 레이어 또는 모듈만
2. **자기완결성** — 외부 참조 금지, 필요한 정보는 전부 파일 안에
3. **사전 준비 강제** — 읽어야 할 파일 경로 명시
4. **시그니처 수준 지시** — 인터페이스만, 구현은 에이전트 재량
5. **AC는 실행 가능한 커맨드** — `pnpm build && pnpm test`
6. **주의사항은 구체적으로** — "X를 하지 마라. 이유: Y"
7. **네이밍** — kebab-case slug

초안을 사용자에게 제시하고 피드백을 받는다. 승인될 때까지 반복한다.

### D. 파일 생성

사용자가 승인하면 아래 파일들을 생성한다.

#### D-1. `docs/phases/index.json`

전체 현황 인덱스. 이미 존재하면 `phases` 배열에 새 항목을 추가한다.

```json
{
  "phases": [
    { "dir": "{task-name}", "status": "pending" }
  ]
}
```

- `dir`: task 디렉토리명
- `status`: `"pending"` | `"completed"` | `"error"` | `"blocked"`
- 타임스탬프는 runway.js가 자동 기록. 생성 시 넣지 않는다

#### D-2. `docs/phases/{task-name}/index.json`

```json
{
  "project": "{CLAUDE.md에서 프로젝트명}",
  "phase": "{task-name}",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "core-types", "status": "pending" }
  ]
}
```

필드 규칙:
- `steps[].step`: 0부터 시작하는 순번
- `steps[].name`: kebab-case slug
- `steps[].status`: 초기값은 모두 `"pending"`
- 타임스탬프, summary, error_message 등은 실행 시 자동 기록

#### D-3. `docs/phases/{task-name}/step{N}.md`

각 step마다 1개씩 생성:

```markdown
# Step {N}: {이름}

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md`
- {이전 step에서 생성/수정된 파일 경로}
- {UI 스펙이 필요한 경우: `/docs/ui/{page}-ui.md`}

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

{구체적인 구현 지시}

## Acceptance Criteria

\```bash
{실행 가능한 검증 커맨드}
\```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가?
   - 기술 스택을 벗어나지 않았는가?
   - CLAUDE.md 규칙을 위반하지 않았는가?
3. 결과에 따라 `docs/phases/{task-name}/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "산출물 한 줄 요약"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- {구체적 금지 사항. "X를 하지 마라. 이유: Y" 형식}
- 기존 테스트를 깨뜨리지 마라
```

## 실행 방법

파일 생성 후 사용자에게 실행 커맨드를 안내한다:

```bash
node scripts/runway.js {task-name}          # 순차 실행
node scripts/runway.js {task-name} --push   # 실행 후 push
```
