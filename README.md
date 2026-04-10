# HubNext (허브넥스트)

구매대행/배송대행 플랫폼. 에이전트 기반 spec-driven 개발 워크플로우를 사용합니다.

## Architecture

```
agents-example/
├── frontend/          # Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui
├── backend/           # NestJS 11 + Prisma + MariaDB
├── docs/
│   ├── specs/         # 버전관리 도메인 스펙 ({domain}.v{N}.md)
│   ├── state/         # 스펙 상태 추적 (JSON + JSONL)
│   └── tasks/         # 스펙 버전별 태스크 파일
└── .claude/
    ├── agents/        # 에이전트 정의
    ├── commands/      # 슬래시 커맨드
    ├── skills/        # 스킬 레퍼런스
    └── rules/         # 코딩 규칙 및 워크플로우 표준
```

Monorepo이지만 workspace root 없이 `frontend/`, `backend/`가 각각 독립된 `pnpm-lock.yaml`을 가짐.

## Quick Start

```bash
# Frontend
cd frontend && pnpm install && pnpm dev

# Backend
cd backend && pnpm install && pnpm start:dev
```

---

## Spec-Driven Workflow

기획서(Planning Document)를 구조화된 스펙으로 변환하고, 그 스펙으로부터 프론트엔드를 자동 스캐폴딩하는 워크플로우.

### 전체 흐름

```
기획서 (대행신청.md 등)
  │
  ├─ /spec-gen ─────────────────────── 스펙 생성
  │   ├─ spec-analyzer  → 요구사항 분석 리포트
  │   ├─ [사용자 확인]
  │   ├─ spec-writer    → docs/specs/{domain}.v{N}.md
  │   ├─ spec-validator → 품질 검증 (PASS/FAIL)
  │   └─ planner        → docs/tasks/{domain}-v{N}.json
  │
  └─ /spec-publish ─────────────────── 프론트엔드 퍼블리싱
      └─ spec-publisher → types, mocks, MSW handlers, components
```

### 사용법

#### 1단계: 기획서 → 스펙 변환 (`/spec-gen`)

```
/spec-gen 대행신청.md          # 파일 경로로 시작
/spec-gen order               # 도메인 이름으로 시작
/spec-gen                     # 대화형 모드
```

실행하면 다음 파일이 생성됩니다:

| 생성 파일 | 경로 | 설명 |
|----------|------|------|
| 스펙 문서 | `docs/specs/{domain}.v{N}.md` | 요구사항, 데이터 모델, API 계약 |
| 상태 파일 | `docs/state/{domain}.json` | 진행 상태 추적 |
| 이벤트 로그 | `docs/state/{domain}.events.jsonl` | 변경 이력 |
| 태스크 파일 | `docs/tasks/{domain}-v{N}.json` | 구현 태스크 목록 |

#### 2단계: 스펙 → 프론트엔드 (`/spec-publish`)

```
/spec-publish order 신청서페이지           # 도메인 + 페이지 지정
/spec-publish rbac 관리자 로그인페이지      # 관리자 페이지
/spec-publish order                       # 도메인만 (어떤 페이지인지 물어봄)
```

실행하면 다음 파일이 생성됩니다:

| 생성 파일 | 경로 | 설명 |
|----------|------|------|
| TypeScript 타입 | `frontend/types/{domain}.ts` | 스펙 데이터 모델 → 인터페이스 |
| Mock 데이터 | `frontend/mocks/fixtures/{domain}.fixtures.ts` | 한국어 실제 데이터 |
| MSW 핸들러 | `frontend/mocks/handlers/{domain}.handlers.ts` | Mock API 엔드포인트 |
| API 클라이언트 | `frontend/lib/api/{domain}-api.ts` | 타입된 fetch wrapper |
| 컴포넌트 | `frontend/components/{user\|admin}/{feature}/` | 스캐폴드 |
| 페이지 | `frontend/app/(user\|admin)/{path}/page.tsx` | 라우트 페이지 |

백엔드 없이 MSW로 프론트엔드를 독립 실행할 수 있습니다.

### 스펙 상태 머신

```
idle → syncing → in_progress → verifying → completed → stable
                      ↑                          │
                      └──── (새 버전) ────────────┘
```

### 파일 네이밍 규칙

| 항목 | 패턴 | 예시 |
|------|------|------|
| 스펙 파일 | `{domain}.v{N}.md` | `order.v1.md` |
| 상태 파일 | `{domain}.json` | `order.json` |
| 이벤트 로그 | `{domain}.events.jsonl` | `order.events.jsonl` |
| 태스크 파일 | `{domain}-v{N}.json` | `order-v1.json` |
| 기능 요구사항 ID | `FR-NNN` | `FR-001` |
| 비기능 요구사항 ID | `NFR-NNN` | `NFR-001` |
| 사용자 스토리 ID | `US-NNN` | `US-001` |
| 태스크 ID | `{domain}-v{N}-NNN` | `order-v1-001` |

### 스펙 문서 구조

모든 스펙은 다음 섹션을 포함합니다:

1. **Overview** (개요)
2. **Problem Statement** (문제 정의)
3. **Functional Requirements** (기능 요구사항) - `FR-NNN` ID, 우선순위, 수락 기준
4. **Non-Functional Requirements** (비기능 요구사항) - 성능, 보안 최소 포함
5. **User Stories** (사용자 스토리) - As a / I want / So that 형식
6. **Data Model** (데이터 모델) - 엔티티, 관계, 제약조건
7. **API Contracts** (API 계약) - 엔드포인트, 요청/응답 포맷
8. **UI/UX Requirements** (UI/UX 요구사항) - 화면, 플로우
9. **Dependencies** (의존성)
10. **Constraints & Assumptions** (제약사항 및 가정)
11. **Glossary** (용어집)
12. **Changelog** - 버전별 변경사항

### 에이전트 역할

| 에이전트 | 역할 | 모델 | 도구 |
|---------|------|------|------|
| `spec-analyzer` | 기획서 분석, 갭/충돌 탐지 | Sonnet | Read, Grep, Glob |
| `spec-writer` | 스펙 문서 + 상태 + 이벤트 생성 | Sonnet | Read, Write, Edit, Grep, Glob |
| `spec-validator` | 스펙 완성도/정합성 검증 | Haiku | Read, Grep, Glob |
| `spec-publisher` | 스펙 → TypeScript, Mock, 컴포넌트 | Sonnet | Read, Write, Edit, Bash, Grep, Glob |

### 타임스탬프 규칙

모든 상태 파일과 이벤트 로그의 타임스탬프는 KST(+09:00) 사용:

```
2026-04-10T21:00:00+09:00
```

---

## 현재 스펙 목록

| 도메인 | 버전 | 상태 | FR | NFR | 태스크 |
|--------|------|------|---:|----:|-------:|
| `order` | v1 | in_progress | 42 | 18 | 20 |
| `rbac` | v1 | in_progress | 41 | 16 | 31 |

---

## Frontend Route Groups

```
app/
├── (user)/                    # 고객 페이지
│   ├── login/                 # /login
│   ├── register/              # /register
│   └── order/                 # /order
└── (admin)/
    └── admin/                 # /admin/* URL prefix
        ├── login/             # /admin/login (사이드바 없음)
        └── (dashboard)/       # 인증된 관리자 페이지 (사이드바 있음)
            └── page.tsx       # /admin — 대시보드
```

- 고객 페이지: `app/(user)/{feature}/`, 컴포넌트: `components/user/{feature}/`
- 관리자 페이지: `app/(admin)/admin/{feature}/`, 컴포넌트: `components/admin/{feature}/`
- 공용 인증 컴포넌트: `components/auth/`

---

## Tech Stack

| 영역 | 기술 | 버전 |
|------|------|------|
| Frontend | Next.js (App Router, RSC) | 16.2 |
| UI | React + Tailwind CSS + shadcn/ui | 19.2 / 4.x |
| Server State | TanStack React Query | 5.97 |
| Validation | Zod | - |
| Mock API | MSW (Mock Service Worker) | - |
| Backend | NestJS + SWC | 11.x |
| Database | Prisma + MariaDB | - |
| Auth | JWT (HttpOnly Cookie) | - |
| Package Manager | pnpm | - |
