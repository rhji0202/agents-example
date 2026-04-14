# Runway Workflow Rules

## Phase 파일 구조

```
docs/phases/
├── index.json                      # 전체 phase 현황
└── {task-name}/
    ├── index.json                  # task 상세 (step 목록, 상태)
    ├── step0.md                    # Step 0 실행 지시
    ├── step1.md                    # Step 1 실행 지시
    └── ...
```

## index.json 스키마

### 전체 현황 (`docs/phases/index.json`)

```json
{
  "phases": [
    {
      "dir": "{task-name}",
      "status": "pending | completed | error | blocked"
    }
  ]
}
```

### Task 상세 (`docs/phases/{task-name}/index.json`)

```json
{
  "project": "{프로젝트명}",
  "phase": "{task-name}",
  "steps": [
    {
      "step": 0,
      "name": "{kebab-case-slug}",
      "status": "pending | completed | error | blocked"
    }
  ]
}
```

## 상태 전이

| 전이 | 추가 필드 | 기록 주체 |
|------|----------|----------|
| pending → completed | `completed_at`, `summary` | Claude(summary), runway.js(timestamp) |
| pending → error | `failed_at`, `error_message` | Claude(message), runway.js(timestamp) |
| pending → blocked | `blocked_at`, `blocked_reason` | Claude(reason), runway.js(timestamp) |

## Step 파일 규약

### 필수 섹션

1. **읽어야 할 파일** — 사전 읽기 목록 (절대 경로)
2. **작업** — 구현 지시 (시그니처 수준)
3. **Acceptance Criteria** — 실행 가능한 검증 커맨드
4. **검증 절차** — AC 실행 + 아키텍처 체크리스트 + 상태 업데이트
5. **금지사항** — "X를 하지 마라. 이유: Y"

### 자기완결성

- 외부 대화 참조 금지: "이전에 논의한 바와 같이" 등 사용 금지
- 필요한 모든 정보를 파일 안에 포함
- 이전 step의 산출물은 파일 경로로 참조

## UI 스펙 연동

프론트엔드 step은 반드시 `docs/ui/{page}-ui.md`를 "읽어야 할 파일"에 포함한다.
UI 스펙이 없으면 step 설계 시 `/ui-spec {page}` 실행을 먼저 제안한다.

## 에러 복구

- **error 발생 시**: index.json에서 해당 step의 `status`를 `"pending"`으로, `error_message`를 삭제한 뒤 재실행
- **blocked 발생 시**: `blocked_reason` 사유를 해결한 뒤, `status`를 `"pending"`으로, `blocked_reason`을 삭제한 뒤 재실행
