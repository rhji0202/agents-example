# Project Documentation Workflow

## Document Structure

```
project/
├── CLAUDE.md                      # Agent entry point (auto-loaded)
└── docs/
    ├── PRD.md                     # Business context
    ├── ARCHITECTURE.md            # System structure
    ├── PERMISSIONS.md             # Role × action matrix
    ├── models/
    │   ├── _overview.md           # Entity relationships
    │   └── {domain}.md            # Entity definitions
    ├── briefs/
    │   ├── _cross-domain.md       # Cross-domain rules
    │   └── {domain}.md            # Per-domain brief
    ├── plans/
    │   ├── active/                # In-progress plans
    │   └── completed/             # Done plans
    └── generated/                 # Agent-generated artifacts
```

## Document Navigation (CRITICAL)

CLAUDE.md is auto-loaded every session. It contains a **Domains table** — this is the primary index for all domain documentation.

### Finding domain docs

1. Read the Domains table in CLAUDE.md
2. Follow the Brief link → `docs/briefs/{domain}.md`
3. Follow the Model link → `docs/models/{domain}.md`

Do NOT scan `docs/briefs/` or `docs/models/` with Glob. Use the Domains table.

### When implementing a domain

```
CLAUDE.md (auto-loaded)
  → Domains table → find the domain row
    → Brief link → flow, rules, screens, scope
    → Model link → entities, fields, status, FK
    → PERMISSIONS.md → relevant role rows only
    → briefs/_cross-domain.md → only if touching other domains
```

### When making architecture decisions

```
CLAUDE.md → ARCHITECTURE.md → domain boundaries, tech stack, roles
```

### When planning implementation

```
CLAUDE.md → Domains table (check Status column)
  → pick a domain with brief + model ready
  → /plan docs/briefs/{domain}.md
```

## File Conventions

- File size: 200 lines max per file
- Domain names: kebab-case, singular (`order`, `user-auth`)
- Index files: `_` prefix (`_overview.md`, `_cross-domain.md`)
- No formal ID systems (FR-001 etc.) — plain language

## Required Brief Sections (6)

1. **Summary** — one sentence
2. **Flow** — numbered steps
3. **Business Rules** — bullet list
4. **Status** — state flow
5. **Screens** — table with paths
6. **Out of Scope** — deferred features

## Required Model Sections (per entity)

1. **Field table** — field, type, required, description
2. **Status flow** — if stateful
3. **Relationships** — FK directions

## UI Document (optional per domain)

복잡한 화면이 있는 도메인은 `briefs/{domain}-ui.md`에 UI 상세를 분리한다.
Brief의 Screens 섹션에서 링크로 연결.

포함 내용: Layout (ASCII), Form Fields (테이블), States (로딩/빈/에러), Conditional (조건부 표시), Actions (버튼), Status Badge (색상)

## Document Creation

기획자가 AI와 대화하며 문서를 하나씩 만든다. 순서:

1. **PRD.md** — "어떤 서비스야?" 대화로 생성
2. **ARCHITECTURE.md** — "기술 스택은? 역할은?" 대화로 생성
3. **CLAUDE.md** — PRD + ARCHITECTURE 기반으로 생성
4. **briefs/{domain}.md** — 도메인별로 "플로우는? 규칙은? 화면은?" 대화로 생성
5. **models/{domain}.md** — brief와 함께 생성
6. **_cross-domain.md** — 2개 이상 도메인 완성 후 생성
7. **PERMISSIONS.md** — 도메인 완성될 때마다 업데이트

한번에 다 만들 필요 없다. 준비된 도메인부터 만들고, 나머지는 나중에.

## Document Update (CRITICAL)

문서는 한번 만들고 끝이 아니다. 프로젝트 진행에 따라 업데이트해야 한다.

### 도메인 구현 시작할 때
| 업데이트 대상 | 변경 |
|-------------|------|
| CLAUDE.md | Domains 테이블 Status → `in-progress` |
| plans/active/{domain}.md | 구현 계획 파일 생성 |

### 도메인 구현 완료할 때
| 업데이트 대상 | 변경 |
|-------------|------|
| CLAUDE.md | Domains 테이블 Status → `done` |
| plans/active/ → completed/ | 계획 파일 이동 |

### 구현 중 스키마가 변경될 때
| 업데이트 대상 | 변경 |
|-------------|------|
| models/{domain}.md | 필드 추가/수정/삭제 |
| models/_overview.md | 관계 변경 시 |

### 요구사항이 변경될 때
| 업데이트 대상 | 변경 |
|-------------|------|
| briefs/{domain}.md | 규칙, 화면, 상태 수정 |
| _cross-domain.md | 도메인 간 규칙 변경 시 |
| PERMISSIONS.md | 권한 변경 시 |

### 새 도메인 추가할 때
| 업데이트 대상 | 변경 |
|-------------|------|
| CLAUDE.md | Domains 테이블에 행 추가 |
| ARCHITECTURE.md | Domain Boundaries에 행 추가 |
| briefs/{domain}.md | 새 brief 생성 |
| models/{domain}.md | 새 model 생성 |
| models/_overview.md | 관계 추가 |
| PERMISSIONS.md | 새 도메인 권한 섹션 추가 |
| _cross-domain.md | 도메인 간 규칙 추가 |

### Scope 변경할 때
| 업데이트 대상 | 변경 |
|-------------|------|
| PRD.md | Scope v1 포함/제외 수정 |
| briefs/{domain}.md | Out of Scope 수정 |

### 원칙
- 코드가 문서와 다르면 **문서를 코드에 맞게** 업데이트한다 (코드가 진실)
- 구현 완료 후 generated/ 에 실제 스키마를 자동 생성한다
- 문서 업데이트는 코드 변경과 같은 커밋에 포함한다

## From Documentation to Implementation

| After docs are ready | Command |
|---------------------|---------|
| Plan a domain | `/plan docs/briefs/{domain}.md` |
| Guided development | `/feature-dev {domain}` |
