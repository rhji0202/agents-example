# HubNext (허브넥스트)

중국 → 한국 배송대행 플랫폼. 현지 물류센터에서 상품 수령·검수·합배송을 처리한다.

## Architecture

Monorepo with two independent packages (no shared workspace root):

- **`frontend/`** - Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui (radix-nova style)
- **`backend/`** - NestJS 11 + SWC compiler

Each package has its own `pnpm-lock.yaml`. Run `pnpm install` inside each directory separately.

**Important:** The frontend uses Next.js 16 which has breaking changes from earlier versions. Always check `frontend/node_modules/next/dist/docs/` before using Next.js APIs.

## Tech Stack

### Frontend

| Category | Tech | Version |
|----------|------|---------|
| Framework | Next.js (App Router, RSC) | 16.2 |
| UI Library | React | 19.2 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui (radix-nova) | - |
| Icons | lucide-react | 1.8 |
| Server State | TanStack React Query | 5.97 |
| Client State | Zustand | - |
| Validation | Zod | - |
| CSS Utility | clsx + tailwind-merge (via `@/lib/utils`) | - |
| Animation | tw-animate-css | 1.4 |
| Bundler | Turbopack (Next.js built-in) | - |

### Backend

| Category | Tech | Version |
|----------|------|---------|
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.x |
| Compiler | SWC | - |
| HTTP | Express (via @nestjs/platform-express) | - |
| Testing | Jest + ts-jest + Supertest | 29.x |
| Database | Prisma + MariaDB | - |
| Authentication | JWT (HttpOnly Cookie) | - |
| Linting | ESLint + Prettier | 9.x / 3.x |

### Shared

| Category | Tech |
|----------|------|
| Package Manager | pnpm |
| Node Target | ES2023 (backend), ES2017 (frontend) |
| Monorepo | Independent packages (no workspace root) |

## Directory Structure

```
agents-example/
├── frontend/                  # Next.js 16 App Router
│   ├── app/
│   │   ├── (user)/            # 고객 페이지
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── order/
│   │   │   ├── tracking/
│   │   │   ├── mypage/
│   │   │   └── review/
│   │   └── (admin)/           # 관리자 페이지
│   │       └── admin/
│   │           ├── login/
│   │           └── (dashboard)/
│   │               ├── orders/
│   │               ├── inbound/
│   │               ├── shipments/
│   │               ├── payments/
│   │               ├── returns/
│   │               ├── members/
│   │               ├── staff/
│   │               └── settings/
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── user/              # 고객 컴포넌트
│   │   └── admin/             # 관리자 컴포넌트
│   ├── hooks/
│   ├── stores/
│   └── lib/
│       ├── utils.ts
│       ├── api/
│       └── validations/
├── backend/                   # NestJS 11
│   ├── src/
│   │   ├── main.ts            # Bootstrap (global pipes, filters, interceptors)
│   │   ├── app.module.ts
│   │   ├── common/            # Cross-cutting: filters, guards, interceptors, pipes, decorators
│   │   ├── config/            # Environment validation, typed config
│   │   ├── prisma/            # PrismaService, PrismaModule
│   │   └── modules/           # 도메인 모듈
│   │       ├── auth/          # 회원가입, 로그인, 고객/직원관리, 권한, 포인트
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── dto/
│   │       │   ├── guards/
│   │       │   └── strategies/
│   │       ├── order/         # 대행 신청, 접수, 검토, 반려/승인
│   │       │   ├── order.module.ts
│   │       │   ├── order.controller.ts
│   │       │   ├── order.service.ts
│   │       │   └── dto/
│   │       ├── inbound/       # 상품 수령, 측정/검수, 사진 촬영
│   │       │   ├── inbound.module.ts
│   │       │   ├── inbound.controller.ts
│   │       │   ├── inbound.service.ts
│   │       │   └── dto/
│   │       ├── payment/       # 배송비 계산, 결제, 예치금, 환불
│   │       │   ├── payment.module.ts
│   │       │   ├── payment.controller.ts
│   │       │   ├── payment.service.ts
│   │       │   └── dto/
│   │       ├── shipment/      # 출고, 배송, 추적, 완료 확인
│   │       │   ├── shipment.module.ts
│   │       │   ├── shipment.controller.ts
│   │       │   ├── shipment.service.ts
│   │       │   └── dto/
│   │       ├── return/        # 리턴 신청, 승인, 수령, 환불 연동
│   │       │   ├── return.module.ts
│   │       │   ├── return.controller.ts
│   │       │   ├── return.service.ts
│   │       │   └── dto/
│   │       └── notification/  # 알림 (이메일/SMS), 에스컬레이션
│   │           ├── notification.module.ts
│   │           ├── notification.controller.ts
│   │           ├── notification.service.ts
│   │           └── dto/
│   └── test/
└── docs/                      # 프로젝트 문서
```

## Commands

### Frontend (`cd frontend`)

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
```

Path alias: `@/*` maps to the frontend root.

### Backend (`cd backend`)

```bash
pnpm start:dev    # Dev server with watch mode
pnpm build        # Production build (nest build)
pnpm lint         # ESLint with auto-fix
pnpm format       # Prettier
pnpm test         # Unit tests (Jest)
pnpm test:cov     # Coverage report
pnpm test:e2e     # E2E tests
```

Backend listens on `process.env.PORT ?? 3000`.

## Backend Conventions (NestJS)

### Module Structure

각 도메인은 독립된 NestJS Module로 구성한다. Controller → Service → Repository(Prisma) 레이어를 지킨다.

- **Controller**: HTTP 입력 파싱, Service 호출, 응답 반환만 담당 (비즈니스 로직 금지)
- **Service**: 비즈니스 로직, 트랜잭션 조율
- **Repository/Prisma**: 데이터 접근 (Service가 직접 PrismaClient 사용 가능)
- 다른 모듈에 필요한 Provider만 `exports`에 명시

### Global Bootstrap

`main.ts`에서 전역 설정을 등록한다:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
app.useGlobalFilters(new HttpExceptionFilter());
```

### DTO & Validation

- 모든 요청 DTO에 `class-validator` 데코레이터 사용
- 응답은 전용 Response DTO 또는 `@Exclude()`로 내부 필드(password, token 등) 제거
- ORM 엔티티를 직접 반환하지 않는다

### Auth & Guards

- JWT는 HttpOnly Cookie로 전달
- 인증: `JwtAuthGuard` → 인가: `RolesGuard` 순서
- Guard에서 coarse access control, Service에서 resource-level authorization

### Exception Handling

- 일관된 에러 응답 포맷 사용 (`HttpExceptionFilter`)
- 예상된 에러: `HttpException` 계열 throw
- 예상치 못한 에러: 중앙 필터에서 로깅 후 500 반환
- 에러 메시지에 민감한 데이터 포함 금지

### Config

- `ConfigModule.forRoot({ isGlobal: true })` + 부팅 시 환경변수 검증
- 타입이 지정된 ConfigService를 통해 접근

### Testing

- Unit test: Service를 격리 테스트 (의존성 mock)
- Integration test: `Test.createTestingModule`로 전체 모듈 테스트 + 동일한 global pipes/filters 적용
- Supertest로 HTTP 레벨 검증

## Domains

| Domain | Description | Brief | Model | Status |
|--------|-------------|-------|-------|--------|
| auth | 회원가입, 로그인, 고객관리, 직원관리, 권한 그룹, 포인트 | docs/briefs/auth.md | docs/models/user.md | planned |
| order | 대행 신청, 접수, 검토, 반려/승인 | docs/briefs/order.md | docs/models/order.md | planned |
| inbound | 상품 수령, 측정/검수, 사진 촬영 | docs/briefs/inbound.md | docs/models/inbound.md | planned |
| payment | 배송비 계산, 결제, 예치금, 환불 | docs/briefs/payment.md | docs/models/payment.md | planned |
| shipment | 출고, 배송, 추적, 완료 확인 | docs/briefs/shipment.md | docs/models/shipment.md | planned |
| return | 리턴 신청, 승인, 수령, 환불 연동 | docs/briefs/return.md | docs/models/return.md | planned |
| notification | 알림 (이메일/SMS), 에스컬레이션 | docs/briefs/notification.md | docs/models/notification.md | planned |

## Documentation

- Business context: docs/PRD.md
- System design: docs/ARCHITECTURE.md
- Permissions: docs/PERMISSIONS.md
- Data models: docs/models/_overview.md
- Cross-domain rules: docs/briefs/_cross-domain.md
