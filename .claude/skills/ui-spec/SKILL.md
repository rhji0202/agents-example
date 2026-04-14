---
name: ui-spec
description: Generate Next.js page-level UI/UX specs from project planning documents. Takes a page name as input and outputs docs/ui/{page}-ui.md. Use when designing frontend pages before implementation.
origin: project
tools: Read, Write, Grep, Glob
---

# UI Spec

기획서(PRD, ARCHITECTURE, PERMISSIONS, UI-GUIDE)에 근거하여 Next.js 페이지별 UI/UX 스펙을 생성한다.

## When to Activate

- 프론트엔드 페이지 구현 전 UI 설계가 필요할 때
- runway step 설계 중 프론트엔드 step에 대한 UI 스펙이 없을 때
- 기존 UI 스펙을 업데이트해야 할 때

## Usage

```
/ui-spec {page}
```

예시:
- `/ui-spec login` → `docs/ui/login-ui.md`
- `/ui-spec order-list` → `docs/ui/order-list-ui.md`
- `/ui-spec admin-dashboard` → `docs/ui/admin-dashboard-ui.md`

## Workflow

### 1. 입력 파싱

$ARGUMENTS에서 페이지 이름을 추출한다. 비어 있으면 사용자에게 페이지 이름을 물어본다.

### 2. 문서 읽기

반드시 아래 문서를 모두 읽는다:

- `/docs/PRD.md` — 비즈니스 요구사항, 사용자 여정
- `/docs/ARCHITECTURE.md` — 디렉토리 구조, API 규칙, 데이터 구조
- `/docs/PERMISSIONS.md` — 해당 페이지의 역할별 권한
- `/docs/UI-GUIDE.md` — 디자인 원칙, 색상, 컴포넌트, 타이포그래피, 안티패턴

### 3. 페이지 분석

- 고객용(`(user)`)인지 관리자용(`(admin)`)인지 판별
- PRD의 User Journey에서 이 페이지의 위치와 역할 파악
- PERMISSIONS.md에서 접근 가능한 역할과 허용 액션 추출
- ARCHITECTURE.md에서 해당 라우트 경로와 관련 API 엔드포인트 확인

### 4. 스펙 작성

**ui-spec-writer** 에이전트의 출력 템플릿에 따라 작성한다.

### 5. 파일 생성

`docs/ui/{page}-ui.md`에 저장한다.

### 6. 사용자에게 결과 제시

- 생성된 파일 경로
- 주요 설계 결정 요약
- 수정이 필요한 부분이 있으면 알려달라고 요청

## Output Template

```markdown
# {Page} UI Spec

## 페이지 개요

- **경로**: `/app/(user|admin)/{route}/page.tsx`
- **타입**: {목록 | 상세 | 폼 | 대시보드}
- **접근 권한**: {역할 목록}
- **사용자 여정**: {이 페이지가 속한 여정 단계}

## 와이어프레임 (텍스트)

{ASCII 또는 구조적 텍스트로 레이아웃 표현}

## 레이아웃

- **구조**: {헤더/사이드바/메인/푸터 배치}
- **너비**: {max-w 기준}
- **반응형**: 320 / 768 / 1024 / 1440

## 컴포넌트 목록

| 컴포넌트 | 타입 | 데이터 소스 | 상태 |
|----------|------|------------|------|

## 상태 관리

| 관심사 | 도구 | 상세 |
|--------|------|------|
| 서버 상태 | TanStack Query | {쿼리 키, 엔드포인트} |
| URL 상태 | searchParams | {필터, 정렬, 페이지네이션} |
| 클라이언트 상태 | Zustand / useState | {모달, 토글} |
| 폼 상태 | React Hook Form + Zod | {검증 스키마} |

## API 연동

| 엔드포인트 | 메서드 | 용도 | 요청 | 응답 |
|-----------|--------|------|------|------|

## 인터랙션

| 사용자 액션 | 시스템 반응 | 에러 처리 |
|------------|-----------|----------|

## 조건부 렌더링

| 조건 | 표시 내용 |
|------|----------|
| 로딩 중 | {스켈레톤} |
| 데이터 없음 | {빈 상태 + CTA} |
| 에러 | {에러 메시지 + 재시도} |
| 권한 없음 | {접근 제한 안내} |

## 디자인 노트

- UI-GUIDE.md 준수사항
- 안티패턴 회피
- 페이지 특화 결정
```

## Quality Gate

- PRD에 근거하지 않은 기능을 추가하지 마라
- PERMISSIONS.md에 없는 권한을 부여하지 마라
- UI-GUIDE.md의 안티패턴(AI 슬롭)을 위반하지 마라
- ARCHITECTURE.md의 디렉토리 구조와 다른 경로를 사용하지 마라
- 모든 컴포넌트는 loading / error / empty / filled 4가지 상태를 고려하라
