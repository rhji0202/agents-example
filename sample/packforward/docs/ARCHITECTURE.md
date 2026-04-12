# Architecture

## System Structure
```
[소비자 웹] ──→ [Next.js App Router] ──→ [Supabase]
[창고관리 웹] ─┘    │                      ├── PostgreSQL
                    │                      ├── Auth
                    │                      ├── Storage (입고 사진)
                    │                      └── Realtime (알림)
                    │
                    ├──→ 배송사 API (UPS/FedEx/EMS)
                    ├──→ 토스페이먼츠 (결제)
                    └──→ 관세청 API (통관부호 검증)
```

## Tech Stack
| Area | Choice | Reason |
|------|--------|--------|
| Frontend | Next.js 15 App Router | SSR + 파일 기반 라우팅 |
| Language | TypeScript | 타입 안전성 |
| DB/Auth | Supabase | 백엔드 인력 없이 Auth+DB+Realtime |
| CSS | Tailwind CSS | 빠른 프로토타이핑 |
| Payment | 토스페이먼츠 | 국내 PG 연동 편의 |
| Deploy | Vercel | Next.js 최적화 |

## User Roles
| Role | Description |
|------|-------------|
| user | 소비자. 입고 조회, 합배송 신청, 결제, 추적 |
| warehouse_staff | 창고 직원. 입고 처리, 검수, 포장, 발송 |
| admin | 운영자. 전체 관리, 정산, 정책 설정 |

## Domain Boundaries
| Domain | Responsibility | Dependencies |
|--------|---------------|--------------|
| auth | 인증, 통관부호, 창고주소 발급 | 없음 |
| inbound | 입고 등록, 검수, 사진, 보관 | auth |
| consolidation | 합배송 묶음, 재포장 옵션 | inbound |
| shipping | 배송 신청, 배송사 선택, 운송장 | consolidation, payment |
| payment | 배송비 계산, 결제, 환불 | consolidation |
| tracking | 추적번호 연동, 통관 상태 | shipping |

## Directory Direction
```
src/
├── app/
│   ├── (user)/        # 소비자 페이지
│   └── (admin)/       # 관리자 페이지
├── features/          # 도메인별 격리
│   ├── auth/
│   ├── inbound/
│   ├── consolidation/
│   ├── shipping/
│   ├── payment/
│   └── tracking/
├── components/        # 공유 UI
├── lib/               # Supabase client, utils
└── types/             # 공유 타입
```
