---
name: publish
description: UI 스펙 MD 파일을 읽고 Next.js 페이지(page.tsx + _components/)를 생성한다. 특정 페이지 또는 전체 페이지를 선택적으로 퍼블리싱. 기존 파일 충돌 시 사용자 확인.
origin: project
tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Publish

UI 스펙 MD(`docs/specs/{domain}-ui.md`)를 읽고 Next.js 순수 UI 코드(page.tsx + `_components/`)를 생성한다.

## When to Activate

- `/publish {domain}` — 해당 도메인의 전체 페이지 퍼블리싱
- `/publish {domain} {page}` — 특정 페이지만 퍼블리싱
- "퍼블리싱해줘", "UI 코드 생성해줘", "스펙대로 페이지 만들어줘"

## Usage

```
/publish {domain}               # 도메인의 모든 페이지 생성
/publish {domain} {page}        # 특정 페이지만 생성
/publish {domain} --list        # 페이지 목록만 확인
```

예시:
- `/publish auth` → auth-ui.md의 모든 페이지 생성
- `/publish auth login` → 로그인 페이지만 생성
- `/publish auth --list` → auth-ui.md에 정의된 페이지 목록 출력

## Workflow

### 1. 입력 파싱

$ARGUMENTS에서 도메인명과 페이지명(선택)을 추출한다.

- 도메인명 비어 있으면 → 사용자에게 물어본다
- `--list` 플래그 → 페이지 목록만 출력하고 종료

### 2. 문서 읽기

#### 기본 문서 (항상 읽기)

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | Domains 테이블 → 도메인 매핑, 프로젝트 컨텍스트 |
| `docs/PRD.md` | 사용자 여정, 비즈니스 컨텍스트 |
| `docs/ARCHITECTURE.md` | 디렉토리 구조, API 규칙, 라우트 그룹 |
| `docs/PERMISSIONS.md` | 역할별 접근 권한 → 조건부 렌더링, 버튼 표시 조건 |
| `docs/UI-GUIDE.md` | 색상, 컴포넌트, 안티패턴 → 코드 스타일 준수 |

#### 도메인 문서 (도메인별 읽기)

| 문서 | 용도 | 없을 때 |
|------|------|---------|
| `docs/specs/{domain}-ui.md` | 레이아웃, 폼 필드, 상태, 조건부 렌더링 | **에러** — 생성 불가 |
| `docs/specs/{domain}.md` | 플로우, 비즈니스 규칙, 상태 흐름 | **경고** 후 계속 |
| `docs/models/{domain}.md` | 엔티티 필드, 상태 enum, FK 관계 | **경고** 후 계속 |

UI 스펙이 없으면 에러:
> "UI 스펙이 없습니다. `/ui-spec {domain}` 또는 `/project-docs`로 먼저 생성하세요."

Brief/Model이 없으면 경고 후 계속:
> "Brief(`docs/specs/{domain}.md`)가 없습니다. UI 스펙만으로 생성합니다."

**Note:** CLAUDE.md Domains 테이블의 Model 링크로 모델 파일 경로를 확인한다. 도메인명과 모델 파일명이 다를 수 있다 (예: auth 도메인 → `models/user.md`).

#### 각 문서에서 활용하는 정보

| 문서 | 추출 항목 |
|------|----------|
| Brief | Flow(네비게이션 흐름, 리디렉트), Business Rules(유효성 검증, 제한 조건), Status(상태 전이), Screens(페이지 보완) |
| Model | 엔티티 필드(폼 필드 타입 매칭), Status enum(뱃지 값 목록), Relationships(연관 데이터 표시) |
| PERMISSIONS | 역할별 액션(버튼 표시/숨김 조건, 읽기 전용 판단) |
| UI-GUIDE | 상태 배지 색상, 안티패턴 회피, 컴포넌트 스타일 |
| ARCHITECTURE | App Router 경로 규칙, 라우트 그룹 구조 |
| PRD | 사용자 여정 맥락, 용어 일관성 |

### 3. 페이지 파싱

UI 스펙의 `## ` 헤더를 기준으로 페이지를 식별한다.
각 페이지에서 추출할 정보:

| 항목 | 소스 |
|------|------|
| 페이지명 | `## {name}` 헤더 |
| 경로 | `- Path: {path}` |
| 역할 | `- Role: {role}` |
| 레이아웃 | `### Layout` 코드블록 |
| 폼 필드 | `### Form Fields` 테이블 |
| 액션 | `### Actions` 테이블 |
| 상태 | `### States` 테이블 |
| 조건부 | `### Conditional` 목록 |

### 4. 페이지 선택

- `{page}` 인자가 있으면 → 해당 페이지만
- 없으면 → 전체 목록을 보여주고 선택 요청:

```
auth-ui.md에 정의된 페이지:

  1. 고객 로그인 → /login
  2. 회원가입 → /register
  3. 비밀번호 찾기 → /forgot-password
  4. 마이페이지 → /mypage
  5. 관리자 로그인 → /admin/login
  6. 고객관리 목록 → /admin/members
  7. 고객 상세 → /admin/members/:id
  8. 직원관리 목록 → /admin/staff
  9. 직원 상세 → /admin/staff/:id
  10. 직원 추가 → /admin/staff/new

전체 생성하려면 "전체", 선택하려면 번호를 입력하세요 (예: 1,3,5)
```

### 5. 충돌 체크

생성할 파일 경로를 미리 계산하고, 이미 존재하는 파일이 있는지 확인한다.

충돌이 있으면 사용자에게 보여준다:

```
다음 파일이 이미 존재합니다:

  - frontend/app/(user)/login/page.tsx (117줄)
  - frontend/app/(user)/register/page.tsx (348줄)

각 파일에 대해:
  [덮어쓰기] / [스킵] / [전체 덮어쓰기] / [전체 스킵] / [취소]
```

### 6. 코드 생성

#### 경로 매핑 규칙

UI 스펙의 Path → Next.js App Router 경로:

| Path 패턴 | App Router 경로 |
|-----------|----------------|
| `/login` | `app/(user)/login/page.tsx` |
| `/register` | `app/(user)/register/page.tsx` |
| `/{path}` | `app/(user)/(main)/{path}/page.tsx` |
| `/admin/login` | `app/(admin)/admin/login/page.tsx` |
| `/admin/{path}` | `app/(admin)/admin/(main)/{path}/page.tsx` |
| `/admin/{path}/:id` | `app/(admin)/admin/(main)/{path}/[id]/page.tsx` |
| `/admin/{path}/new` | `app/(admin)/admin/(main)/{path}/_components/{path}-create-dialog.tsx` |

인증이 필요 없는 페이지 (`Role: 비로그인`):
- user 쪽: `app/(user)/` 바로 아래 (layout 그룹 밖)
- admin 쪽: `app/(admin)/admin/login/`

인증이 필요한 페이지:
- user 쪽: `app/(user)/(main)/` 아래
- admin 쪽: `app/(admin)/admin/(main)/` 아래

#### 코드 스타일 규칙 (CRITICAL)

기존 구현 패턴을 반드시 따른다. 아래는 프로젝트에서 추출한 규칙:

**공통:**
- `'use client';` 상단 선언
- shadcn/ui 컴포넌트 import (`@/components/ui/`)
- lucide-react 아이콘
- Tailwind CSS 4 유틸리티 클래스
- 한국어 UI 텍스트

**고객 페이지 (user):**
- `AuthLayout` 래퍼 사용 (로그인/회원가입/비밀번호찾기)
- `(main)` 그룹 내 페이지는 user layout이 자동 적용됨
- 에러 표시: `rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive`

**관리자 페이지 (admin):**
- `AdminHeader` 컴포넌트로 페이지 타이틀 (`@/components/layout/admin/header`)
- `(main)` 그룹 내 페이지는 admin layout(사이드바+탑바)이 자동 적용됨
- 목록 페이지: 필터 탭 + Table 컴포넌트 + 페이지네이션
- 상세 페이지: 카드 섹션 (`rounded-xl border bg-background p-6`)

**상태 관리:**
- 순수 UI 생성이므로 API 호출은 TODO 주석으로 표시
- `useState`로 로컬 상태 관리
- mock 데이터로 UI 구조 확인 가능하게 작성

**컴포넌트 추출:**
- 페이지 내에서만 쓰이는 작은 컴포넌트 → 같은 파일 하단에 정의
- 페이지 간 공유 or 복잡한 컴포넌트 → `_components/` 디렉토리에 분리
- 파일당 최대 400줄, 넘으면 `_components/`로 분리

**폼:**
- Label + Input 조합 (`space-y-2` 래퍼)
- 인라인 에러: `<p className="text-sm text-destructive">{message}</p>`
- 제출 버튼: `Button` with `w-full`, `size="lg"`, pending 상태 표시

**테이블 (목록 페이지):**
- shadcn Table 컴포넌트 사용
- `statusMap` 객체로 상태 뱃지 색상 관리
- FilterTabs 컴포넌트로 필터 UI
- 로딩/빈 상태/데이터 3분기 렌더링

**상세 페이지:**
- 뒤로가기 링크 (`ArrowLeft` 아이콘)
- 정보 섹션을 카드로 분리 (`rounded-xl border bg-background p-6`)
- 수정불가 필드: `disabled className="bg-muted"`
- 상태 변경: `Select` 컴포넌트
- 확인 모달: `Dialog` 컴포넌트

### 7. 결과 출력

생성 완료 후 요약:

```
생성 완료:

  Created  frontend/app/(user)/login/page.tsx (115줄)
  Created  frontend/app/(user)/register/page.tsx (340줄)
  Skipped  frontend/app/(user)/forgot-password/page.tsx (이미 존재)

총 2개 파일 생성, 1개 스킵
```

## Quality Gate

- [ ] UI 스펙의 모든 Form Fields가 코드에 반영되었는가
- [ ] UI 스펙의 모든 States(로딩/빈/에러)가 처리되었는가
- [ ] UI 스펙의 Conditional(조건부 렌더링)이 구현되었는가
- [ ] UI 스펙의 Actions(버튼/액션)이 핸들러로 연결되었는가
- [ ] 기존 코드 패턴(AdminHeader, AuthLayout, statusMap 등)을 따르는가
- [ ] 파일당 400줄을 넘지 않는가
- [ ] API 호출 부분은 TODO 주석으로 표시했는가
- [ ] UI-GUIDE.md의 안티패턴을 위반하지 않았는가

## Scope Boundaries

**생성하는 것:**
- `page.tsx` — 라우트 페이지 컴포넌트
- `_components/*.tsx` — 페이지 전용 컴포넌트 (필요 시)

**생성하지 않는 것:**
- `lib/api/*.ts` — API 클라이언트 함수
- `lib/queries/*.ts` — TanStack Query 훅
- `lib/validations/*.ts` — Zod 스키마
- `components/ui/*.ts` — shadcn/ui 컴포넌트
- `components/common/*.ts` — 공용 컴포넌트
- 레이아웃 파일 (`layout.tsx`, `loading.tsx`, `error.tsx`)
