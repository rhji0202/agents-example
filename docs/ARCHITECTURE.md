# Architecture

## System Structure

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  고객 웹     │────▶│  Next.js 16  │────▶│  NestJS 11    │
│  (신청/추적) │     │  Frontend    │     │  Backend API  │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
┌─────────────┐     ┌──────────────┐              │
│  관리자 웹   │────▶│  같은 Next.js │              │
│  /admin/*   │     │  App Router  │              │
└─────────────┘     └──────────────┘              │
                                           ┌──────┴──────┐
                                           │  MariaDB    │
                                           │  (Prisma)   │
                                           └─────────────┘
```

## Tech Stack

| Area | Choice | Reason |
|------|--------|--------|
| Frontend | Next.js 16 (App Router, RSC) | SSR + RSC로 초기 로딩 최적화, Turbopack 빌드 속도 |
| UI | Tailwind CSS 4 + shadcn/ui | 일관된 디자인 시스템, 빠른 UI 개발 |
| Backend | NestJS 11 + SWC | 모듈 기반 아키텍처, DI 지원, TypeScript 네이티브 |
| DB | MariaDB + Prisma | 트랜잭션 안정성, type-safe ORM |
| Auth | JWT (HttpOnly Cookie) | 무상태 인증, XSS 방지 |
| Server State | TanStack React Query 5 | 캐싱, 낙관적 업데이트, 자동 재검증 |
| Client State | Zustand | 경량 상태 관리, 보일러플레이트 최소 |
| Validation | Zod | 프론트/백 공유 가능한 스키마 검증 |

## User Roles

| Role | Description |
|------|-------------|
| customer | 개인 소비자 또는 셀러. 대행 신청, 추적, 결제, 후기 |
| admin | 시스템 관리자. 신청 검토, 전체 운영, 설정 관리 |
| cs | CS팀. 완료 확인, 반려/리턴 처리, 고객 대응 |
| qa | QA팀. 상품 측정/검수, 리턴 상품 확인 |
| finance | 재무팀. 결제 확인, 환불, 세금계산서 |
| logistics | 물류팀. 포장, 운송장, 통관, 출고 |

## Domain Boundaries

| Domain | Responsibility | Dependencies |
|--------|---------------|--------------|
| auth | 회원가입, 로그인, 역할 관리, VIP 등급 | — |
| order | 대행 신청, 접수, 검토, 반려/승인 | auth |
| inbound | 상품 수령, 측정/검수, 사진 촬영 | order |
| payment | 배송비 계산, 차등 요금제, 결제 요청/확인, 예치금, 환불 | inbound, auth |
| shipment | 출고, 배송, 추적, 완료 확인 | payment, order |
| return | 리턴 신청, 승인, 수령, 환불 연동 | shipment, payment |
| notification | 알림 (이메일/SMS), 에스컬레이션 | 전 도메인 |

## Directory Direction

```
frontend/app/
├── (user)/               # 고객 페이지
│   ├── login/
│   ├── register/
│   ├── order/            # 신청 폼
│   ├── tracking/         # 배송 추적
│   ├── mypage/           # 마이페이지, 예치금
│   └── review/           # 후기
└── (admin)/
    └── admin/
        ├── login/
        └── (dashboard)/
            ├── orders/       # 주문 관리
            ├── inbound/      # 입고 관리
            ├── shipments/    # 출고/배송
            ├── payments/     # 결제/정산
            ├── returns/      # 리턴 관리
            ├── members/      # 회원/VIP
            └── settings/     # 시스템 설정

backend/src/
├── auth/
├── order/
├── inbound/
├── payment/
├── shipment/
├── return/
├── notification/
└── common/               # 공유 유틸, 가드, 필터
```
