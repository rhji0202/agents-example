# Architecture

### Phase Guide

| Phase | 시점 | 기준 |
|-------|------|------|
| **Phase 0** | MVP 개발 | 핵심 기능 동작에 필수인 최소 인프라 |
| **Phase 1** | 런칭 후 안정화 | 운영 품질 확보 (모니터링, 캐시, 파일 스토리지) |
| **Phase 2** | 스케일 단계 | 트래픽·팀 규모 성장에 따른 인프라 확장 |

_Phase 표기가 없는 섹션·항목은 Phase 0 (필수)_

## System Structure

```
                        ┌──────────────────┐
                        │  External APIs   │
                        │  {결제 GW}       │
                        │  {배송사 API}    │
                        │  {알림톡/SMS}    │
                        └────────┬─────────┘
                                 │
┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐
│  고객 웹     │─▶│  Next.js 16  │─▶│  NestJS 11    │─▶│  MariaDB    │
│  (신청/추적) │  │  Frontend    │  │  Backend API  │  │  (Prisma)   │
└─────────────┘  └──────────────┘  └───────┬───────┘  └─────────────┘
                                           │
┌─────────────┐  ┌──────────────┐          ├──────────┬──────────────┐
│  관리자 웹   │─▶│  같은 Next.js │          │          │              │
│  /admin/*   │  │  App Router  │   ┌──────┴──┐  ┌───┴────┐  ┌─────┴─────┐
└─────────────┘  └──────────────┘   │  Redis  │  │  Queue │  │  File     │
                                    │ (Cache) │  │ (Bull) │  │  Storage  │
                                    └─────────┘  └────────┘  │  {S3 등}  │
                                                             └───────────┘
```

**Phase별 인프라 도입:**
- **Phase 0**: Next.js + NestJS + MariaDB (핵심 CRUD, 인증, 비즈니스 로직)
- **Phase 1**: + Redis (세션/캐시) + File Storage ({S3 등})
- **Phase 2**: + Bull Queue (비동기 처리) + CDN/WAF + 수평 확장

## Tech Stack

| Area         | Choice                       | Reason                                            |
| ------------ | ---------------------------- | ------------------------------------------------- |
| Frontend     | Next.js 16 (App Router, RSC) | SSR + RSC로 초기 로딩 최적화, Turbopack 빌드 속도 |
| UI           | Tailwind CSS 4 + shadcn/ui   | 일관된 디자인 시스템, 빠른 UI 개발                |
| Backend      | NestJS 11 + SWC              | 모듈 기반 아키텍처, DI 지원, TypeScript 네이티브  |
| DB           | MariaDB + Prisma             | 트랜잭션 안정성, type-safe ORM                    |
| Cache        | Redis                        | 세션, 캐시, 큐 처리                               |
| File Storage | {S3 / MinIO / 로컬}         | {이미지, 서류, 송장 등 파일 저장}                 |
| Auth         | JWT (HttpOnly Cookie)        | 무상태 인증, XSS 방지                             |
| Server State | TanStack React Query 5       | 캐싱, 낙관적 업데이트, 자동 재검증                |
| Client State | Zustand                      | 경량 상태 관리, 보일러플레이트 최소               |
| Validation   | Zod                          | 프론트/백 공유 가능한 스키마 검증                 |

## API Design Convention

| 항목 | 규칙 |
|------|------|
| Style | REST (리소스 중심) |
| URL | `/{version}/{resource}` — 복수형, kebab-case |
| Versioning | URL path (`/v1/`) — 하위 호환 깨질 때만 올림 |
| Auth | HttpOnly Cookie (JWT) |
| Pagination | `?page=1&limit=20` → 응답에 `meta: { total, page, limit, lastPage }` |
| Filtering | `?status=pending&sort=createdAt:desc` |
| Bulk | `POST /{resource}/bulk` — 배열 요청, 개별 결과 응답 |
| File Upload | {Presigned URL / Multipart — 결정 필요} |
| Error format | `{ statusCode, message, error, details? }` |

## Inter-domain Communication

| 패턴 | 사용 시점 | 예시 |
|------|----------|------|
| 직접 호출 (Service import) | 동기 필수, 같은 트랜잭션 | {주문 생성 시 재고 차감} |
| Event (Bull Queue) | 비동기 가능, 실패 허용 | {상태 변경 → 알림 발송} |
| Cron Batch | 주기적 집계 | {정산, 통계} |

원칙:
- 도메인 간 직접 import는 **읽기(조회)** 위주. 쓰기(상태 변경)는 이벤트로 분리
- 순환 의존 금지 — A → B → A 발생 시 이벤트로 끊기
- {이벤트 버스 도입 시점: 도메인 N개 이상 또는 외부 서비스 연동 복잡도 증가 시}

## Caching Strategy

| 레이어 | 대상 | TTL | 무효화 시점 | Phase |
|--------|------|-----|-----------|-------|
| React Query | API 응답 (목록, 상세) | staleTime: {N초} | mutation 후 invalidate | 0 |
| CDN/Browser | 정적 에셋 (이미지, JS, CSS) | 장기 (immutable hash) | 배포 시 | 1 |
| Redis | {세션, 사용자 프로필, 설정 등} | {N분} | 데이터 변경 시 write-through | 1 |

캐시 불가: {결제 상태, 재고/수량, 실시간 환율 등 — 항상 원본 조회}

## Async Processing

| 처리 | 방식 | 용도 | Phase |
|------|------|------|-------|
| {정산 배치} | Cron Job (NestJS Schedule) | {일/주/월 단위 정산 집계} | 0 |
| {알림 발송} | 동기 → Bull Queue | {Phase 0: 동기 발송 / Phase 2: 큐 기반 재시도} | 0→2 |
| {외부 API 연동} | 직접 호출 → Queue + Retry | {Phase 0: timeout만 / Phase 2: 큐 + retry 정책} | 0→2 |
| {파일 처리} | 동기 → Queue | {Phase 0: 동기 처리 / Phase 2: 비동기 리사이즈·압축} | 0→2 |

실패 정책:
- **Phase 0**: try-catch + 로그 기록, 수동 재처리
- **Phase 2**: 최대 {N}회 재시도, exponential backoff, Dead Letter Queue

## Security Architecture

```
Client ──HTTPS──▶ [CDN/WAF] ──▶ [Next.js] ──▶ [NestJS API]
                                                    │
                                            ┌───────┴────────┐
                                            │ JwtAuthGuard   │
                                            │ RolesGuard     │
                                            │ ThrottlerGuard │
                                            └───────┬────────┘
                                                    │
                                              [Service Layer]
                                              resource-level authz
```

| 레이어 | 보호 수단 |
|--------|----------|
| Transport | HTTPS only, HSTS |
| Gateway | Rate limiting (IP + User), CORS whitelist |
| Auth | JWT HttpOnly Cookie, Refresh Token rotation |
| Authorization | Guard → coarse RBAC, Service → resource-level |
| Input | ValidationPipe (whitelist + forbidNonWhitelisted), Zod |
| Output | ClassSerializer로 민감 필드 제거 (password, token) |
| DB | Prisma parameterized queries (SQL injection 방지) |
| File | {업로드 파일 타입/크기 제한, 저장 경로 격리} |

## Database Strategy

| 항목 | 방침 |
|------|------|
| Schema 관리 | Prisma Migrate — 모든 변경은 마이그레이션 파일로 |
| 네이밍 | snake_case (테이블/컬럼), 단수형 |
| Soft Delete | `deleted_at` nullable timestamp — {주요 엔티티 나열} |
| Audit Fields | `created_at`, `updated_at` 전 테이블 필수 |
| Index | FK, status, created_at 기본 인덱스. 쿼리 패턴에 따라 복합 인덱스 |
| Rollback | 마이그레이션마다 down 스크립트 작성 |
| Scaling | {v1: 단일 인스턴스 / 이후: Read Replica 분리 방향} |

### Audit Logging

| 대상 | 기록 항목 | 저장 | Phase |
|------|----------|------|-------|
| {관리자 행위 — 상태 변경, 환불, 권한 수정 등} | who, when, what, before, after | {별도 audit 테이블 / 외부 로그} | 0 |
| {민감 데이터 접근 — 개인정보 조회 등} | who, when, target | {별도 audit 테이블 / 외부 로그} | 1 |

## Infrastructure / Deployment

| 항목 | 방침 |
|------|------|
| 호스팅 | {AWS / GCP / 자체 서버} |
| 컨테이너 | Docker + docker-compose (dev), {K8s / ECS — prod} |
| CI/CD | {GitHub Actions / GitLab CI} → Build → Test → Deploy |
| 환경 | dev / staging / production — staging은 prod 동일 구성 |
| Secret 관리 | 환경변수 (.env) — prod는 {AWS SSM / Vault 등} |
| SSL | {Let's Encrypt / CloudFlare / ALB 등} |
| Scaling | {v1: 단일 서버 / 이후: 수평 확장 — stateless 설계 유지} |

### Backup / DR

| 대상 | 주기 | 보존 | RPO | RTO | Phase |
|------|------|------|-----|-----|-------|
| DB | {일 1회 full + 실시간 binlog} | {N일} | {N분} | {N시간} | 0 |
| File Storage | {버전 관리 / 크로스 리전 복제} | {N일} | {N시간} | {N시간} | 1 |
| Redis | {필요 시 RDB 스냅샷 — 캐시 특성상 유실 허용} | - | - | - | 2 |

## Monitoring / Observability

| 영역 | 도구 | 대상 | Phase |
|------|------|------|-------|
| Logging | {Winston / Pino} → {CloudWatch / ELK} | 요청/응답, 에러, 비즈니스 이벤트 | 0 (console) → 1 (ELK) |
| Uptime | {UptimeRobot / Route53 Health Check} | 서비스 가용성 | 0 |
| Alerting | {Slack webhook} → {PagerDuty} | 에러율 급증, 큐 적체, DB 커넥션 고갈 | 0 (Slack) → 1 (PagerDuty) |
| Metrics | {Prometheus + Grafana / CloudWatch} | API 응답시간, 에러율, 큐 길이 | 1 |

### Structured Log Format

모든 로그에 공통 포함:

```json
{
  "timestamp": "{ISO 8601}",
  "level": "{info/warn/error}",
  "requestId": "{요청 추적 ID}",
  "userId": "{인증된 사용자 ID — 없으면 null}",
  "method": "{HTTP method}",
  "path": "{요청 경로}",
  "message": "{로그 메시지}",
  "duration": "{처리 시간 ms — 응답 시}",
  "error": "{에러 시 stack trace}"
}
```

### Alert Conditions

- API 5xx 에러율 > {N}% (5분 윈도우) — Phase 0
- DB 커넥션 사용률 > {N}% — Phase 1
- 응답시간 p95 > {N}ms — Phase 1
- 큐 메시지 적체 > {N}건 — Phase 2

## Roles & Domains

- 역할 정의: docs/PRD.md → Stakeholders
- 역할별 권한: docs/PERMISSIONS.md
- 도메인 목록 및 상태: CLAUDE.md → Domains 테이블

## Directory Structure

### Frontend

```text
frontend/
├── app/                          # Next.js 16 App Router
│   ├── globals.css               # Tailwind @import + CSS 커스텀 프로퍼티
│   ├── layout.tsx                # 루트 레이아웃 (최소 공통: QueryProvider, ThemeProvider)
│   ├── not-found.tsx             # 404 페이지
│   ├── (user)/                   # 고객 라우트 그룹
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── (main)/               # 레이아웃 그룹 (URL 무관)
│   │       ├── layout.tsx        # 사용자 전용 Provider + 레이아웃 (헤더/푸터)
│   │       ├── loading.tsx       # 서스펜스 폴백 (스켈레톤)
│   │       ├── error.tsx         # 에러 바운더리
│   │       └── {domain}/         # 도메인별 라우트 (briefs 참조)
│   │           ├── _components/  # 도메인 전용 컴포넌트 + 테스트 co-locate
│   │           └── page.tsx
│   └── (admin)/                  # 관리자 라우트 그룹
│       └── admin/
│           ├── login/
│           │   └── page.tsx
│           └── (main)/           # 레이아웃 그룹 (URL 무관)
│               ├── layout.tsx    # 관리자 전용 Provider + 레이아웃 (사이드바/탑바)
│               ├── loading.tsx   # 서스펜스 폴백 (스켈레톤)
│               ├── error.tsx     # 에러 바운더리
│               ├── dashboard/
│               │   └── page.tsx  # 대시보드 홈 (/admin/dashboard)
│               └── {domain}/     # 도메인별 라우트 (briefs 참조)
│                   ├── _components/  # 도메인 전용 컴포넌트 (co-locate)
│                   └── page.tsx
│
├── middleware.ts                  # 역할 기반 라우트 가드 (/admin/* → 관리자 인증 필수)
│
├── components/
│   ├── providers/                # Provider 래퍼 컴포넌트
│   │   ├── query-provider.tsx    # QueryClientProvider + devtools
│   │   └── theme-provider.tsx    # next-themes Provider
│   ├── ui/                       # shadcn/ui 기본 컴포넌트 (직접 수정 X)
│   │   └── ...
│   ├── common/                   # 사용자/관리자 양쪽 공용 컴포넌트
│   │   ├── data-table.tsx        # 페이지네이션/소팅/필터 테이블
│   │   ├── status-badge.tsx      # 상태 뱃지 (도메인 공용)
│   │   ├── file-upload.tsx       # 파일/이미지 업로드
│   │   ├── confirm-dialog.tsx    # 확인 모달
│   │   ├── empty-state.tsx       # 빈 상태 표시
│   │   ├── loading-skeleton.tsx  # 스켈레톤 로딩
│   │   └── error-boundary.tsx    # 에러 바운더리
│   └── layout/                   # 레이아웃 셸
│       ├── user/                 # 사용자 레이아웃
│       │   ├── header.tsx
│       │   └── footer.tsx
│       └── admin/                # 관리자 레이아웃
│           ├── sidebar.tsx
│           └── topbar.tsx
│
├── hooks/                        # 도메인 무관 유틸리티 훅만 (*.test.ts co-locate)
│   ├── use-debounce.ts
│   ├── use-pagination.ts
│   └── use-media-query.ts
│
├── stores/                       # Zustand (순수 UI 상태만, 서버 상태 금지)
│   └── ui-store.ts               # 사이드바 열림/닫힘, 테마 등
│
├── lib/                          # 유틸리티 & 인프라
│   ├── utils.ts                  # cn() (clsx + tailwind-merge)
│   ├── constants.ts              # 상수 (상태값, 라벨 매핑, 라우트 경로)
│   ├── types.ts                  # 공통 타입 (API envelope, 페이지네이션 메타)
│   ├── api/                      # API 클라이언트 (도메인 타입 co-locate)
│   │   ├── client.ts             # fetch 래퍼 (baseURL, 인터셉터, 에러 핸들링)
│   │   ├── auth.ts               # 로그인, 로그아웃, 토큰 갱신
│   │   ├── users.ts              # 회원 CRUD, 마이페이지, VIP
│   │   └── {domain}.ts           # 도메인별 API 함수 + Request/Response 타입
│   ├── validations/              # Zod 스키마 (폼 검증)
│   │   ├── auth.ts               # 로그인/회원가입 폼 검증
│   │   ├── users.ts              # 회원정보 수정 폼 검증
│   │   └── {domain}.ts           # 도메인별 폼 검증
│   └── queries/                  # TanStack Query 키 & 훅
│       ├── query-keys.ts         # 쿼리 키 팩토리
│       ├── use-auth.ts           # 인증 (로그인/로그아웃/현재사용자)
│       ├── use-users.ts          # 회원 목록/상세/수정
│       └── use-{domain}.ts       # 도메인별 쿼리 훅
│
├── public/                       # 정적 파일
│   ├── logo.svg
│   └── images/
│
├── e2e/                          # Playwright E2E 테스트
│   ├── playwright.config.ts
│   └── {domain}.spec.ts
│
├── .env.example                  # 환경변수 템플릿 (NEXT_PUBLIC_API_URL 등)
├── next.config.ts                # Next.js 설정 (Turbopack)
├── tailwind.config.ts            # Tailwind CSS 4 설정
├── tsconfig.json                 # TypeScript 설정 (@/* 경로 별칭)
├── components.json               # shadcn/ui 설정
└── package.json
```

### Backend

```text
backend/
├── src/
│   ├── main.ts                       # Bootstrap (global pipes, filters, interceptors, CORS)
│   ├── app.module.ts                 # 루트 모듈
│   │
│   ├── common/                       # 횡단 관심사 (cross-cutting)
│   │   ├── decorators/               # @Roles(), @CurrentUser(), @Public()
│   │   ├── dto/                      # 공유 DTO (PaginationQueryDto)
│   │   ├── filters/                  # HttpExceptionFilter
│   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/             # ResponseInterceptor, LoggingInterceptor
│   │   ├── pipes/                    # 커스텀 파이프
│   │   └── types/                    # 공통 타입 (PaginatedResponse, ApiResponse)
│   │
│   ├── config/                       # 환경 설정
│   │   ├── configuration.ts          # 타입된 ConfigService 팩토리
│   │   └── validation.ts             # 부팅 시 환경변수 검증
│   │
│   ├── prisma/                       # DB 접근 레이어
│   │   ├── prisma.module.ts          # Global PrismaModule
│   │   └── prisma.service.ts         # PrismaClient 래핑 (onModuleInit/Destroy)
│   │
│   └── modules/                      # 도메인 모듈
│       ├── auth/                     # 인증 모듈 (특수 구조)
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts    # 로그인, 로그아웃, 토큰 갱신
│       │   ├── auth.service.ts       # JWT 발급/검증, 비밀번호 해싱
│       │   ├── auth.service.spec.ts
│       │   ├── guards/              # 인증 전용 가드 (이 모듈에서만 사용)
│       │   │   ├── local-auth.guard.ts    # 로그인 엔드포인트용
│       │   │   └── refresh-token.guard.ts # 토큰 갱신 엔드포인트용
│       │   ├── strategies/           # Passport 전략
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       ├── register.dto.ts
│       │       └── auth-response.dto.ts
│       ├── users/                    # 사용자 모듈
│       │   ├── users.module.ts
│       │   ├── users.controller.ts   # 회원 CRUD, 마이페이지, VIP 등급
│       │   ├── users.service.ts      # 회원 조회/수정, 포인트 관리
│       │   ├── users.service.spec.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       ├── update-user.dto.ts
│       │       └── user-response.dto.ts  # @Exclude(password, token)
│       └── {domain}/                 # 일반 도메인 모듈 (briefs 참조)
│           ├── {domain}.module.ts
│           ├── {domain}.controller.ts
│           ├── {domain}.service.ts
│           ├── {domain}.service.spec.ts
│           └── dto/
│               ├── create-{domain}.dto.ts
│               ├── update-{domain}.dto.ts
│               └── {domain}-response.dto.ts
│
├── test/                             # E2E 테스트
│   └── {domain}.e2e-spec.ts
│
├── prisma/
│   ├── schema.prisma                 # Prisma 스키마 (진실의 원천)
│   └── seed.ts                       # 초기 데이터 (관리자 계정, 기본 설정)
│
├── .env.example                      # 환경변수 템플릿 (DATABASE_URL, JWT_SECRET 등)
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```
