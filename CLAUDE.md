# HubNext (허브넥스트)

중국 → 한국 배송대행 플랫폼. 현지 물류센터에서 상품 수령·검수·합배송을 처리한다.

## Project Status

**현재 단계: 기획 완료 / 코드 미착수**

- PRD, 아키텍처, 권한 매트릭스, UI 가이드 문서 작성 중
- `frontend/`, `backend/` 디렉토리 아직 없음 — 코드 scaffolding 전

## Architecture

Monorepo (독립 패키지, 공유 workspace root 없음):

- **`frontend/`** — Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui
- **`backend/`** — NestJS 11 + SWC + Prisma + MariaDB

Tech Stack 상세, 디렉토리 구조, API 규칙, 보안 아키텍처는 docs/ARCHITECTURE.md 참조.

**Next.js 16 주의:** 이전 버전과 breaking change가 있음. 코드 작성 시 `frontend/node_modules/next/dist/docs/`를 먼저 확인할 것.

## Commands

> 아래 명령어는 `frontend/`, `backend/` 디렉토리가 생성된 후 사용 가능.

### Frontend (`cd frontend`)

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
```

Path alias: `@/*` → frontend root.

### Backend (`cd backend`)

```bash
pnpm start:dev    # Dev server (watch mode)
pnpm build        # Production build
pnpm lint         # ESLint with auto-fix
pnpm format       # Prettier
pnpm test         # Unit tests (Jest)
pnpm test:cov     # Coverage report
pnpm test:e2e     # E2E tests
```

Backend port: `process.env.PORT ?? 8080`.

## Documentation

| 문서                 | 내용                                                            |
| -------------------- | --------------------------------------------------------------- |
| docs/PRD.md          | 비즈니스 요구사항, 사용자 여정, 스코프                          |
| docs/ARCHITECTURE.md | 시스템 구조, Tech Stack, API 규칙, DB 전략, 보안, 디렉토리 구조 |
| docs/PERMISSIONS.md  | 역할별 권한 매트릭스                                            |
| docs/UI-GUIDE.md     | 디자인 원칙, 색상, 컴포넌트, 타이포그래피                       |
| docs/specs/          | 기능별 상세 스펙 문서 (runway 실행 시 guardrails에 자동 포함)    |
| docs/ui/{page}-ui.md | 페이지별 UI/UX 스펙 (`/ui-spec {page}`로 생성)                  |
| docs/phases/         | 구현 phase 관리 (`/runway`로 설계, `runway.js`로 실행)           |

## Runway (구현 자동화)

Step 설계부터 실행까지의 워크플로우:

```bash
# 1. Step 설계 (대화형)
/runway {task-name}

# 2. UI 스펙 생성 (프론트엔드 step 필요 시)
/ui-spec {page-name}

# 3. Step 실행 (headless)
node scripts/runway.js {task-name}          # 순차 실행
node scripts/runway.js {task-name} --push   # 실행 후 push
node scripts/runway.js {task-name} --step N # 특정 step만
node scripts/runway.js --status             # 전체 현황
```
