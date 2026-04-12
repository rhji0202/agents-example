# PackForward (배대지 플랫폼)

해외 직구 상품을 미국 창고에서 수령 → 합배송 → 한국 배송하는 서비스.

## Architecture

모노레포, 프론트/백 독립 패키지 (공유 워크스페이스 없음):

- **`frontend/`** — Next.js 15 App Router + Tailwind CSS + shadcn/ui
- **`backend/`** — NestJS 11 + Prisma + Supabase (PostgreSQL)

각 패키지에 별도 `pnpm-lock.yaml`. 각 디렉토리에서 `pnpm install` 실행.

## Tech Stack

### Frontend
| Category | Tech | Version |
|----------|------|---------|
| Framework | Next.js (App Router, RSC) | 15.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | - |
| Server State | TanStack React Query | 5.x |
| Client State | Zustand | - |
| Validation | Zod | - |

### Backend
| Category | Tech | Version |
|----------|------|---------|
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.x |
| Database | Supabase (PostgreSQL) | - |
| ORM | Prisma | - |
| Auth | Supabase Auth + JWT | - |
| Storage | Supabase Storage (입고 사진) | - |
| Payment | 토스페이먼츠 | - |

## Directory Structure

```
packforward/
├── frontend/
│   ├── app/
│   │   ├── (user)/               # 소비자 페이지
│   │   │   ├── login/
│   │   │   ├── inbound/
│   │   │   ├── consolidation/
│   │   │   ├── shipping/
│   │   │   └── my/
│   │   └── (admin)/              # 관리자 페이지
│   │       └── admin/
│   │           ├── login/
│   │           ├── inbound/
│   │           ├── consolidation/
│   │           └── shipping/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── user/                 # 소비자 컴포넌트
│   │   └── admin/                # 관리자 컴포넌트
│   ├── lib/
│   │   ├── api/                  # API 클라이언트
│   │   └── validations/          # Zod 스키마
│   └── types/                    # 공유 타입
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── inbound/
│       │   ├── consolidation/
│       │   ├── shipping/
│       │   ├── payment/
│       │   └── tracking/
│       ├── prisma/               # Prisma schema + migrations
│       └── common/               # Guards, interceptors, pipes
└── docs/                         # 프로젝트 문서
```

## Commands

### Frontend (`cd frontend`)
```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest
```

Path alias: `@/*` → frontend root

### Backend (`cd backend`)
```bash
pnpm start:dev    # Dev server (watch mode)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Unit tests (Jest)
pnpm test:e2e     # E2E tests
pnpm prisma:migrate  # DB migration
pnpm prisma:generate # Prisma client 생성
```

## Domains

| Domain | Description | Brief | Model | Status |
|--------|-------------|-------|-------|--------|
| auth | 회원, 창고주소 발급, 통관부호 | docs/briefs/auth.md | docs/models/user.md | done |
| inbound | 입고 등록, 검수, 보관 | docs/briefs/inbound.md | docs/models/inbound.md | done |
| consolidation | 합배송 묶음, 재포장 | docs/briefs/consolidation.md | docs/models/consolidation.md | done |
| shipping | 한국행 배송, 운송장 | docs/briefs/shipping.md | docs/models/shipment.md | in-progress |
| payment | 배송비 계산, 결제 | docs/briefs/payment.md | docs/models/payment.md | in-progress |
| tracking | 배송 추적, 통관 | docs/briefs/tracking.md | docs/models/shipment.md | planned |

## Documentation

- Business context: [docs/PRD.md](docs/PRD.md)
- System design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Permissions: [docs/PERMISSIONS.md](docs/PERMISSIONS.md)
- Data models: [docs/models/_overview.md](docs/models/_overview.md)
- Cross-domain rules: [docs/briefs/_cross-domain.md](docs/briefs/_cross-domain.md)
- Execution plans: docs/plans/active/
