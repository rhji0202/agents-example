---
name: project-docs
description: 기획자와 AI가 대화하며 프로젝트 문서를 만드는 스킬. PRD, Architecture, Brief, Model, Permissions, UI 문서의 템플릿, 질문법, PASS/FAIL 기준을 제공한다.
origin: project
---

# Project Documentation Skill

기획자와 AI가 대화하며 프로젝트 문서를 만들 때 사용하는 템플릿, 질문법, 품질 기준.

## When to Activate

### 새 프로젝트 시작
- "프로젝트 시작하자", "기획 정리하자", "새 서비스 만들자"
- "PRD 만들어줘", "아키텍처 잡아줘"
- 기획서/기획 문서를 공유하며 "이거 정리해줘"

### 도메인 추가 (대화 모드)
- "도메인 추가해줘", "brief 만들어줘", "모델 정리해줘"
- "inbound 도메인 기획하자", "결제 플로우 정리해줘"

### 도메인 변경 — Quick Update (직접 요청 모드)
- "{domain}에 xx 추가해줘" → 바로 brief/model 수정
- "{domain} xx 규칙 변경해줘" → Before/After 보여주고 확인
- "합배송 최대 10개에서 20개로 바꿔줘" (brief 업데이트)
- "auth에서 비밀번호 찾기 out of scope 빼줘"
- "order 모델에 xx 필드 추가해줘" (model 업데이트)
- 도메인명 + 구체적 변경 내용이 있으면 질문 없이 바로 처리

### 결정 기록 (ADR)
- "왜 이렇게 결정했어?", "결정 배경 기록해줘", "ADR 작성해줘"
- 기술 스택, 아키텍처, 비즈니스 규칙 변경 시 자동 제안
- "JWT로 결정한 이유 기록해줘", "모노레포 선택 이유 남겨줘"

### 프로젝트 진행 중 문서 동기화
- 구현 시작/완료 시 → CLAUDE.md Status 업데이트
- 스키마 변경 시 → model 업데이트
- 요구사항 변경 시 → brief 업데이트
- 새 역할 추가 시 → PERMISSIONS.md 업데이트

### 기획 상태 확인 (Status Dashboard)
- "기획상태 확인해줘", "지금 어디까지 됐어?", "남은 도메인이 뭐야?"
- "이 도메인 brief 있어?", "모델 정리된 거 맞아?"
- → 실제 파일 존재 여부를 스캔하여 대시보드 출력

## Quick Update Mode (직접 요청)

기획자가 도메인명 + 변경 내용을 한 줄로 요청하면, 질문 없이 바로 처리한다.

### 인식 패턴

```
"auth 도메인에 OTP 로그인 추가해줘"
"order 상태에 on_hold 추가해줘"
"inbound 금지품목 검사 규칙 변경해줘"
"payment 환불 수수료 5% → 3%로"
"auth에서 소셜 로그인 out of scope 빼줘"
"shipment 화면에 실시간 위치 추적 추가"
```

핵심: **도메인명이 포함**되고 **구체적 변경 내용**이 있으면 Quick Update.

### Quick Update Flow

```
1. CLAUDE.md Domains 테이블에서 도메인 → brief/model 파일 매핑
2. brief + model 읽기
3. 변경 유형 판별:

   | 요청 유형 | 수정 대상 |
   |----------|----------|
   | 플로우/규칙 추가·변경 | brief (Flow, Business Rules) |
   | 상태 추가·변경 | brief (Status) + model (Status, enum) |
   | 에러 시나리오 추가·변경 | brief (Error Scenarios) |
   | API 추가·변경 | brief (API Endpoints) |
   | 이벤트 추가·변경 | brief (Domain Events) + _cross-domain.md |
   | 화면 추가·변경 | brief (Screens) + UI 문서 (있으면) |
   | 필드 추가·변경 | model (Field table) |
   | 엔티티 추가 | model (new entity) + _overview.md |
   | 권한 변경 | PERMISSIONS.md |
   | Out of Scope 변경 | brief (Out of Scope) |
   | 도메인 간 규칙 | _cross-domain.md |

4. Before/After 보여주기 (변경된 섹션만)
5. 연쇄 영향 체크 후 알림:
   - "이 변경으로 model에 필드 추가가 필요합니다. 함께 반영할까요?"
   - "PERMISSIONS.md에도 새 action 추가가 필요합니다."
   - "_cross-domain.md에 영향이 있을 수 있습니다."
6. 확인 후 저장
```

### Quick Update vs 대화 모드

| | Quick Update | 대화 모드 |
|---|---|---|
| **언제** | 기존 도메인의 부분 수정 | 새 도메인 생성, 대규모 변경 |
| **질문** | 모호할 때만 (보통 0~1개) | 항상 3~5개 |
| **출력** | 변경 섹션의 Before/After | 전체 초안 |
| **확인** | "이렇게 반영할까요?" 1회 | 단계별 확인 |

### 모호한 요청 처리

구체적이지 않으면 최소한의 질문으로 명확화:

```
기획자: "auth에 알림 추가해줘"
AI: "어떤 알림인가요? (택1)
  a) 로그인 시 이메일/SMS 알림
  b) 비밀번호 변경 알림
  c) 계정 상태 변경 알림
  d) 기타 — 설명해주세요"
```

### Quick Update 예시

```
기획자: "auth 도메인에 비밀번호 찾기 추가해줘. 이메일 인증 방식으로."

AI:
📍 auth brief 변경

**Flow 추가:**
> ### 비밀번호 찾기
> 1. 고객이 "비밀번호 찾기" 클릭
> 2. 가입 시 등록한 이메일 입력
> 3. 인증 코드 발송 (6자리, 유효시간 10분)
> 4. 인증 코드 입력 → 새 비밀번호 설정
> 5. 비밀번호 변경 완료 → 로그인 페이지로 이동

**Business Rules 추가:**
> - 인증 코드: 6자리 숫자, 10분 유효
> - 1시간 내 최대 5회 요청 제한
> - 비밀번호 변경 후 기존 세션 전체 만료

**Screens 추가:**
> | 비밀번호 찾기 | /forgot-password | 이메일 입력, 인증 코드, 새 비밀번호 |

**Out of Scope 제거:**
> - ~~비밀번호 찾기 (이메일/SMS) — v2~~

📍 auth model 변경

**User 필드 — 변경 없음** (password_hash, password_changed_at 이미 있음)

📍 연쇄 영향
- notification 도메인: 이메일 발송 연동 필요 → _cross-domain.md 업데이트 권장

이렇게 반영할까요?
```

## Status Dashboard (기획 상태 확인)

"기획상태 확인해줘", "어디까지 됐어?", "남은 거 뭐야?" 등의 요청 시 실제 파일을 스캔하여 대시보드를 출력한다.

### Status Dashboard Flow

```
1. CLAUDE.md Domains 테이블 읽기
2. 실제 파일 존재 여부 스캔:
   - docs/specs/{domain}.md → Brief 체크
   - docs/models/{domain}.md → Model 체크
   - docs/specs/{domain}-ui.md → UI 체크
   - backend/src/modules/{domain}/ → Backend Code 체크
   - frontend/app/**/{domain}/ → Frontend Code 체크
3. CLAUDE.md Status와 실제 상태 불일치 감지
4. 대시보드 출력
```

### 출력 형식

```markdown
## 기획 상태

### 공통 문서
| 문서 | 상태 |
|------|------|
| PRD | OK / 없음 |
| ARCHITECTURE | OK / 없음 |
| PERMISSIONS | OK / 없음 |
| Cross-Domain | OK / 없음 |
| Model Overview | OK / 없음 |

### 도메인별 상태
| Domain | Brief | Model | UI | Code | Status |
|--------|-------|-------|----|------|--------|
| auth | OK | OK | OK | - | planned |

### 불일치 감지 (있을 때만)
- auth: Status=planned 이지만 코드가 존재함 → in-progress로 변경 권장
- order: Brief 없음 → Domains 테이블에서 제거하거나 brief 생성 필요

### 다음 단계
- 구현 시작 가능: {brief+model 완료된 도메인}
- 문서 보완 필요: {brief 또는 model 없는 도메인}
```

### 불일치 자동 수정

불일치가 발견되면 수정 여부를 물어본다:

```
기획자: "기획상태 확인해줘"
AI: (대시보드 출력 후)
  ⚠️ 불일치 발견:
  - auth: 코드가 존재하지만 Status=planned → in-progress로 변경할까요?
```

## Scope Boundaries

**Activate for:** 프로젝트 문서 생성 및 유지 (PRD, ARCHITECTURE, CLAUDE.md, specs, models, PERMISSIONS, UI)

**Do NOT use for:**
- 코드 구현, 테스트 작성, 코드 리뷰
- 프론트엔드 디자인, DB 마이그레이션
- 이 스킬은 문서 생성/관리 전용. 구현은 다른 스킬/명령이 담당.

## 충돌 처리

### 문서 간 불일치 발견 시
1. CLAUDE.md Domains 테이블이 최상위 진실
2. Brief와 Model의 Status가 다르면 → Brief 기준으로 Model 수정
3. 코드와 문서가 다르면 → 코드가 진실, 문서를 코드에 맞게 수정

### 세션 시작 시
기존 docs/가 있으면 CLAUDE.md Domains 테이블을 먼저 확인하고,
Status가 현실과 다르면 업데이트 후 진행한다.

---

## 0. CLAUDE.md — 프로젝트 진입점

### PRD + ARCHITECTURE 완성 후 생성

PRD에서 가져올 것: 프로젝트명, 한 줄 설명
ARCHITECTURE에서 가져올 것: 기술 스택, 디렉토리, 역할

### CLAUDE.md 템플릿

```markdown
# {프로젝트명}

{한 줄 설명}

## Architecture
{모노레포/싱글/프백분리}

## Tech Stack
### Frontend
| Category | Tech | Version |
|----------|------|---------|

### Backend
| Category | Tech | Version |
|----------|------|---------|

## Directory Structure
{핵심 디렉토리 트리만 — 전체 트리 아님}

## Commands
### Frontend (`cd frontend`)
{dev, build, lint, test}

### Backend (`cd backend`)
{dev, build, lint, test, migrate}

## Domains
| Domain | Description | Brief | Model | Status |
|--------|-------------|-------|-------|--------|

## Documentation
- Business context: docs/PRD.md
- System design: docs/ARCHITECTURE.md
- Permissions: docs/PERMISSIONS.md
- Decision records: docs/decisions/README.md
- Data models: docs/models/_overview.md
- Cross-domain rules: docs/specs/_cross-domain.md
```

### PASS / FAIL 예시

```markdown
# PASS: Tech Stack에 버전이 있음
| Framework | Next.js (App Router) | 15.x |
| ORM | Prisma | 6.x |

# FAIL: 버전 없음
| Framework | Next.js |
| ORM | Prisma |
(agent가 API를 잘못 쓸 수 있음)
```

```markdown
# PASS: Domains에 링크와 Status가 있음
| auth | 인증 | docs/specs/auth.md | docs/models/user.md | done |

# FAIL: 링크 없음
| auth | 인증 관련 기능 |
(agent가 파일을 찾기 위해 Glob을 돌려야 함)
```

---

## 1. PRD — 질문 가이드

### 물어볼 질문 (5개, 순서대로)

```
1. 어떤 서비스인가요? (한 줄로)
2. 어떤 문제를 해결하나요? (누가, 어떤 상황에서, 무슨 불편)
3. 누가 사용하나요? (사용자 유형별 핵심 니즈)
4. v1에 반드시 들어가야 할 것 / 빠져도 되는 것은?
5. 제약이 있나요? (기술적, 사업적, 법적)
```

답변 후 추가 질문:
```
6. 성공을 어떻게 측정하나요? (지표 + 목표치)
7. 가장 걱정되는 리스크는?
8. 아직 결정 안 된 것이 있나요?
```

비기능 요구사항 질문 (대형 플랫폼일 때 추가):
```
9. 예상 사용자 수와 동시 접속자 수는? (초기 / 6개월 / 1년)
10. 서비스 가용성 목표가 있나요? (99.9% 등)
11. 응답 시간 기준이 있나요? (페이지 로딩, API 응답)
12. 데이터 보존 기간에 대한 법적/사업적 요구는?
```

### PRD 템플릿

```markdown
# {프로젝트명}

## Problem
{누가, 어떤 상황에서, 무슨 불편을 겪는지}

## Solution
{이 서비스가 문제를 어떻게 해결하는지}

## Users
| 유형 | 설명 | 핵심 니즈 |
|------|------|----------|

## Core Flow
1. {사용자가 → 무엇을 → 결과}

## Goals
| 지표 | 목표 | 측정 방법 |
|------|------|----------|

## Scope
### v1 포함
### v1 제외 — {이유}

## Non-Functional Requirements
| 항목 | 목표 | 비고 |
|------|------|------|
| 동시 접속자 | {N명} | {초기 / 6개월 / 1년} |
| 가용성 | {99.9%} | {월간 다운타임 허용치} |
| API 응답 시간 | p95 < {N}ms | {조회/쓰기 구분} |
| 페이지 로딩 | < {N}s | {LCP 기준} |
| 데이터 보존 | {N년} | {법적 근거} |

## Constraints

## Risks
| 리스크 | 영향 | 대응 |
|--------|------|------|

## Open Questions
```

### PASS / FAIL 예시

```markdown
# PASS: Problem이 구체적
해외 직구 소비자가 여러 쇼핑몰에서 상품을 구매할 때
각각 국제 배송하면 건당 $20~40의 배송비가 발생한다.
3건만 합치면 $30~60 절약 가능하지만,
개인이 현지 창고를 운영할 수 없다.

# FAIL: Problem이 모호
해외 직구가 불편하고 비용이 많이 들어서 이를 해결하는 서비스가 필요하다.
```

```markdown
# PASS: NFR이 구체적
| 동시 접속자 | 500명 | 초기 100 → 6개월 300 → 1년 500 |
| API 응답 시간 | p95 < 300ms | 목록 조회 기준, 쓰기는 500ms |

# FAIL: NFR이 모호하거나 없음
| 가용성 | 높아야 함 | - |
(SLA를 잡을 수 없고, 인프라 설계 근거가 없음)
```

```markdown
# PASS: Scope 제외 항목에 이유가 있음
- 일본/독일 창고 — 운영 검증 후 확장
- 모바일 앱 — 웹 반응형으로 대체

# FAIL: Scope 제외 항목에 이유 없음
- 일본/독일 창고
- 모바일 앱
```

---

## 2. ARCHITECTURE — 질문 가이드

### 물어볼 질문

```
1. 기술 스택 선호가 있나요? (없으면 추천)
2. 프론트/백 분리? 모노레포? 마이크로서비스?
3. 사용자 역할은 어떤 것들이 있나요?
4. 외부 연동이 필요한 서비스는? (결제, 배송사, 인증 등)
```

PRD의 Users, Constraints를 참조하여 자동으로 도메인 후보를 제시:
```
PRD를 기반으로 다음 도메인을 식별했습니다:
| 도메인 | 설명 |
|--------|------|
추가하거나 빼야 할 도메인이 있나요?
```

### ARCHITECTURE 템플릿

```markdown
# Architecture

## System Structure
{텍스트 다이어그램}

## Tech Stack
| Area | Choice | Reason |
|------|--------|--------|

## User Roles
| Role | Description |
|------|-------------|

## Domain Boundaries
| Domain | Responsibility | Dependencies |
|--------|---------------|--------------|

## Directory Direction
{추천 src/ 구조}
```

### PASS / FAIL 예시

```markdown
# PASS: Domain Boundaries에 의존성 방향이 있음
| shipping | 한국행 배송 | consolidation, payment |
| payment | 배송비 결제 | consolidation |

# FAIL: 의존성이 모호
| shipping | 배송 관련 | 여러 도메인과 연관 |
```

```markdown
# PASS: Tech Stack에 선택 이유가 있음
| DB | Supabase | 백엔드 인력 없이 Auth+DB+Realtime |

# FAIL: 이유 없음
| DB | Supabase | - |
(나중에 "왜 이걸 골랐지?" 맥락이 사라짐)
```

---

## 3. Brief — 질문 가이드

### 물어볼 질문 (도메인별, 4단계)

**Step 1: 플로우**
```
1. 핵심 흐름은? (사용자가 → 뭘 하면 → 무슨 일이 → 결과)
2. 분기점이 있나요? (조건에 따라 다른 경로)
3. 예외 상황은? (실패, 거부, 취소)
```

**Step 2: 비즈니스 규칙 + 에러**
```
1. {플로우에서 파생된 구체적 질문}
2. 상태는 이게 맞나요? {추론한 상태 흐름}
3. 누가 어떤 권한을 가지나요?
4. 각 단계에서 실패하면 어떻게 되나요? (에러 시나리오)
5. 사용자에게 어떤 메시지를 보여줘야 하나요?
```

**Step 3: API + 이벤트**
```
1. 이 도메인에서 필요한 주요 API는? (CRUD + 특수 액션)
2. 다른 도메인에 알려야 하는 이벤트가 있나요? (상태 변경, 완료 등)
3. 외부 시스템 연동이 필요한 API가 있나요? (결제, 배송사 등)
```

**Step 4: 화면**
```
1. 필요한 화면/페이지는?
2. 목록 화면 — 필터, 정렬, 검색 조건은?
3. 폼 — 필수 필드와 선택 필드는?
```

### Brief 템플릿

```markdown
# {Domain} Brief

## Summary
{한 문장: 누가 무엇을 한다.}

## Flow
1. {Step}

## Business Rules
- {Rule}

## Status
{status_a} → {status_b} → {status_c}

## Error Scenarios
| Scenario | Trigger | System Response | User Message | Escalation |
|----------|---------|----------------|-------------|------------|

## API Endpoints
| Method | Path | Description | Auth | Notes |
|--------|------|-------------|------|-------|

## Domain Events
| Event | Trigger | Payload | Subscribers |
|-------|---------|---------|-------------|

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|

## Out of Scope
- {Feature} — {이유 또는 v2}
```

### PASS / FAIL 예시

```markdown
# PASS: Error Scenario가 구체적
| 비밀번호 5회 실패 | 잘못된 비밀번호 연속 입력 | 계정 30분 잠금 | "비밀번호를 5회 잘못 입력하셨습니다. 30분 후 재시도해주세요." | 없음 |

# FAIL: Error Scenario가 모호
| 비밀번호 실패 | 잘못 입력 | 처리 필요 | - | - |
```

```markdown
# PASS: API Endpoint가 리소스 중심이고 Auth 명시
| POST | /v1/orders | 주문 생성 | customer | 멱등키 필수 |
| GET | /v1/orders/:id | 주문 상세 조회 | customer, admin | scope: own (customer) |

# FAIL: API Endpoint에 Auth/Notes 없음
| POST | /v1/orders | 주문 생성 | | |
```

```markdown
# PASS: Domain Event에 구독자가 명시됨
| order.paid | 결제 완료 시 | { orderId, amount, userId } | notification, consolidation |

# FAIL: Event가 모호
| 결제 완료 | 결제 시 | 주문 정보 | 여러 도메인 |
```

```markdown
# PASS: Business Rule이 구체적
- 최소 1개, 최대 10개 상품 합배송 가능
- 재포장 시 수수료 $3 추가
- 결제 완료 후 묶음 변경 불가

# FAIL: Business Rule이 모호
- 적절한 수의 상품을 합배송할 수 있다
- 재포장 시 추가 비용 발생
- 결제 후에는 변경이 제한된다
```

```markdown
# PASS: Status에 분기가 있음
arriving → received → inspected → stored → consolidated
                                 ↘ rejected

# FAIL: Status가 일직선만
arriving → received → inspected → stored → consolidated
(rejected는 어디서 발생하는지 알 수 없음)
```

```markdown
# PASS: Screen에 핵심 기능이 명시됨
| 입고 목록 | /inbound | 상태 필터, 보관일수 표시, 날짜 정렬 |

# FAIL: Screen에 기능이 없음
| 입고 목록 | /inbound | 입고 목록을 보여준다 |
```

---

## 4. Model — 질문 가이드

Brief 작성 시 함께 만든다. 별도 질문 불필요.

Brief의 Flow, Rules, Status에서 자동 추론:
- Flow의 주체 → Entity
- Rules의 조건 → Field + Constraint
- Status → enum field

### Model 템플릿

```markdown
# {Domain} Model

## {EntityName}
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status
{status_a} → {status_b} → {status_c}

### Relationships
- belongs to {Entity} (N:1)
- has many {Entity} (1:N)

### Scale & Access Pattern
| 항목 | 값 |
|------|-----|
| 예상 레코드 수 (1년) | {N건} |
| 증가 속도 | {일 N건} |
| 주요 조회 패턴 | {목록 조회 / 단건 조회 / 집계} |
| 보존 기간 | {N년 / 영구 / 법적 근거} |

### Indexes
- {field}: {query purpose}
```

### PASS / FAIL 예시

```markdown
# PASS: enum 값이 나열됨
| status | enum(draft,submitted,accepted,completed) | YES | 주문 상태 |

# FAIL: enum 값 없음
| status | enum | YES | 상태 |
```

```markdown
# PASS: FK 대상이 명시됨
| user_id | uuid | YES | FK → User |

# FAIL: FK 대상 불명
| user_id | uuid | YES | 사용자 ID |
```

```markdown
# PASS: Scale이 구체적
| 예상 레코드 수 (1년) | 50만 건 |
| 증가 속도 | 일 1,500건 |
| 주요 조회 패턴 | 상태별 목록 (paginated), 단건 상세 |
| 보존 기간 | 5년 (전자상거래법) |

# FAIL: Scale 없음
(인덱스를 잡아야 할지, 파티셔닝이 필요한지 판단 불가)
```

---

## 5. Cross-Domain — 질문 가이드

2개 이상 도메인 brief가 있을 때 AI가 자동으로 질문:

```
도메인 간 연결을 확인합니다.

1. {domain-a}가 완료되면 {domain-b}로 어떻게 넘어가나요?
2. {domain-a}에서 실패하면 {domain-b}에 영향이 있나요?
3. 여러 도메인에 걸치는 규칙이 있나요? (금액 한도, 기한, 금지 항목)
4. 알림이 필요한 이벤트는?
```

### Cross-Domain 템플릿

```markdown
# Cross-Domain Rules

## Entity Lifecycle
{domain_a}({status}) → {domain_b}({status}) → {domain_c}({status})

## Event Map
| Event | Publisher | Subscribers | Sync/Async | On Failure |
|-------|----------|-------------|------------|------------|

## Dependency Graph
{domain_a} → {domain_b} (읽기: 조회, 쓰기: 이벤트)
※ 순환 의존 금지: A → B → A 발생 시 이벤트로 끊기

## Shared Business Rules
### {Rule Name}
- **Domains**: {list}
- **Rule**: {description}
- **On failure**: {what happens}

## Error Scenarios
| Scenario | Affected Domains | Resolution |
|----------|-----------------|------------|

## Notifications
| Event | Source Domain | Recipient | Channel |
|-------|-------------|-----------|---------|
```

### PASS / FAIL 예시

```markdown
# PASS: Error Scenario에 해결 방법이 있음
| 결제 실패 | payment, consolidation | confirmed 유지, 재시도 가능 |
| 금지품목 발견 | inbound, consolidation, payment | 해당 건 제거, 부분 환불 |

# FAIL: 해결 방법 없음
| 결제 실패 | payment | 처리 필요 |
| 금지품목 | inbound | 대응 필요 |
(agent가 에러 처리를 구현할 수 없음)
```

```markdown
# PASS: Lifecycle에 도메인 간 상태 연결이 명확
inbound(stored) → consolidation(draft→confirmed)
→ payment(pending→paid) → consolidation(packing→packed)

# FAIL: 도메인만 나열
inbound → consolidation → payment → shipping
(어떤 상태에서 넘어가는지 알 수 없음)
```

```markdown
# PASS: Event Map에 실패 처리가 있음
| order.paid | payment | [consolidation, notification] | async | consolidation: 재시도 3회, notification: 무시 |

# FAIL: Event Map에 실패 처리 없음
| 결제 완료 | payment | 여러 도메인 | - | - |
```

```markdown
# PASS: Dependency Graph에 방향과 타입이 있음
order → payment (쓰기: order.paid 이벤트)
order → inbound (읽기: 상품 입고 상태 조회)
payment → order (읽기: 주문 금액 조회, 쓰기 금지 — 이벤트로)

# FAIL: 의존성이 모호
order ↔ payment (서로 연관)
```

---

## 6. PERMISSIONS — 자동 생성

별도 질문 불필요. Brief 작성 시 권한 정보를 수집하고, 도메인이 추가될 때마다 업데이트.

```markdown
# Permissions

## {domain}
| Action | user | {role2} | admin |
|--------|------|---------|-------|
```

---

## 7. _overview.md — 관계 맵

### 템플릿

```markdown
# Data Model Overview

## Entity Relationships
{EntityA} 1──N {EntityB}    ({entityb}.{entitya}_id → {entitya}.id)
{EntityB} N──1 {EntityC}    ({entityb}.{entityc}_id → {entityc}.id)

## Domain Model Index
| Domain | Entities | Primary Entity |
|--------|---------|---------------|

## Details
- [{domain}]({domain}.md)
```

FK 방향을 괄호 안에 명시. Agent가 _overview만 읽어도 전체 FK를 알 수 있어야 한다.

---

## 8. ADR (Architecture Decision Records) — 결정 기록

프로젝트의 주요 기술/설계 결정을 기록한다. "왜 이렇게 했는가?"에 대한 답.

### 언제 작성하는가

- 기술 스택 선택 (DB, 프레임워크, 인프라 등)
- 아키텍처 패턴 결정 (모노레포 vs 멀티레포, 인증 방식 등)
- 비즈니스 규칙 변경 사유 (한도 변경, 정책 변경 등)
- 2개 이상 대안을 비교한 결정
- "나중에 왜 이렇게 했는지" 물어볼 만한 결정

### 언제 작성하지 않는가

- 구현 디테일 (함수명, 변수명 등) — 코드가 답
- 프레임워크의 기본 패턴을 따르는 결정 — 당연한 것
- 임시 결정 (실험, 프로토타입) — 확정 후 작성

### ADR 템플릿

```markdown
# ADR-{NNN}: {제목}

- **상태**: proposed | accepted | superseded | deprecated
- **날짜**: {YYYY-MM-DD}
- **결정자**: {이름/역할}

## Context
{어떤 상황에서 이 결정이 필요했는가?}

## Decision
{무엇을 결정했는가?}

## Alternatives
| 대안 | 장점 | 단점 | 탈락 사유 |
|------|------|------|----------|

## Consequences
- **긍정**: {이 결정으로 얻는 것}
- **부정**: {이 결정으로 잃는 것/감수하는 것}
- **영향 범위**: {변경되는 문서/코드 목록}
```

### 파일 규칙

- 위치: `docs/decisions/`
- 파일명: `{NNN}-{kebab-case-제목}.md`
- 번호 순차 증가, 재사용 금지
- `README.md`에 목록 테이블 유지

### 상태 전이

```
proposed → accepted (확정)
accepted → superseded (새 ADR로 대체 — 대체 ADR 번호 명시)
accepted → deprecated (더 이상 유효하지 않음)
```

결정 변경 시 기존 ADR의 상태를 superseded로 바꾸고, 새 ADR에서 이전 ADR을 참조한다.

### PASS / FAIL 예시

```markdown
# PASS: Alternatives에 탈락 사유가 있음
| localStorage + Bearer | 구현 단순 | XSS 토큰 탈취 | 보안 위험 |
| Session 기반 | CSRF 방어 용이 | Redis 필요 | Phase 0에서 Redis 없음 |

# FAIL: Alternatives가 모호
| 방법 A | 좋음 | 나쁨 | 불편 |
| 방법 B | 괜찮음 | 별로 | 이유 없음 |
```

```markdown
# PASS: Consequences에 영향 범위가 명시됨
- **영향 범위**: ARCHITECTURE.md Security Architecture, specs/auth.md Login Flow

# FAIL: Consequences가 모호
- 좋은 결정이다.
```

### Quick Update 연동

기획자가 ADR 작성을 요청할 때:

```
기획자: "왜 JWT로 결정했는지 기록해줘"
AI:
1. 결정 배경 질문 (없으면 ARCHITECTURE.md에서 추론)
2. 대안 질문: "다른 방법도 검토했나요?"
3. ADR 초안 생성 → 확인 → 저장
4. README.md 목록 업데이트
```

---

## 9. 문서 업데이트 방법

Rule에 "언제" 업데이트할지는 정의되어 있다. 여기서는 "어떻게" 업데이트하는지 다룬다.

### Brief 업데이트 시

```
기획자: "합배송 최대 10개 → 20개로 변경해줘"
AI:
1. specs/consolidation.md 읽기
2. Business Rules에서 해당 항목 수정
3. 변경 전/후를 보여주기:
   - Before: 최소 1개, 최대 10개
   - After: 최소 1개, 최대 20개
4. 확인 후 저장
5. _cross-domain.md에 영향 있는지 확인 → 있으면 함께 수정
```

### Model 업데이트 시

```
구현 중 필드 추가가 필요할 때:
1. models/{domain}.md 읽기
2. 필드 추가 (type, required, description 포함)
3. FK면 _overview.md도 업데이트
4. Brief의 Status와 Model의 Status가 일치하는지 확인
```

### CLAUDE.md Status 업데이트 시

```
도메인 구현 시작: Status → in-progress
도메인 구현 완료: Status → done
도메인 brief만 있고 model 없음: Status → planned
```

### 새 도메인 추가 시

```
1. 기획자와 대화로 brief + model 생성 (기존 도메인과 동일 절차)
2. CLAUDE.md Domains 테이블에 행 추가
3. ARCHITECTURE.md Domain Boundaries에 행 추가
4. models/_overview.md에 관계 추가
5. PERMISSIONS.md에 권한 섹션 추가
6. _cross-domain.md에 도메인 간 규칙 추가 (해당 시)
```

---

## 10. UI 문서 — 화면 상세

Brief의 Screens는 목록일 뿐. 복잡한 화면은 `{domain}-ui.md`에 상세를 분리한다.

### 언제 만드는가

- 화면이 3개 이상인 도메인
- 폼 필드가 복잡한 화면
- 조건부 표시/상태가 많은 화면
- 기획자가 "화면 상세 정리해줘"라고 할 때

### 물어볼 질문 (화면별)

```
1. 이 화면에서 사용자가 가장 먼저 보는 것은?
2. 목록이면 — 카드형? 테이블형? 필터/정렬은?
3. 폼이면 — 필수 필드는? 유효성 검증은?
4. 로딩/빈 상태/에러 시 어떻게 보여야 하나?
5. 조건에 따라 다르게 보이는 부분이 있나?
```

### UI 문서 템플릿

```markdown
# {Domain} UI

## {화면명}
- Path: {route}
- Role: {role}

### Layout
{ASCII 레이아웃}

### Form Fields (폼이 있을 때)
| Field | Label | Type | Required | Validation | Placeholder |
|-------|-------|------|----------|------------|-------------|

### Actions
| Button | Condition | Action |
|--------|-----------|--------|

### States
| State | 표시 |
|-------|------|
| 로딩 | {how} |
| 빈 목록 | {message + action} |
| 에러 | {message + retry} |

### Conditional
- {조건} → {표시/숨김}
```

### PASS / FAIL 예시

```markdown
# PASS: Layout이 구조를 보여줌
[상단 필터 바]
  상태: 전체 | arriving | stored
[카드 리스트]
  ┌────────────────────┐
  │ 사진  쇼핑몰명      │
  │       상태 뱃지      │
  └────────────────────┘
[플로팅 버튼] + 등록

# FAIL: Layout 없이 텍스트만
"상단에 필터가 있고 아래에 목록이 있다"
```

```markdown
# PASS: Form Fields에 validation이 있음
| tracking_number | 운송장 | text | NO | 영숫자+하이픈 | "1Z999AA..." |

# FAIL: validation 없음
| tracking_number | 운송장 | text | NO | | |
```

```markdown
# PASS: States가 구체적
| 빈 목록 | "아직 입고된 상품이 없습니다" + 창고 주소 안내 링크 |

# FAIL: States가 모호
| 빈 목록 | 빈 화면 표시 |
```

---

## 서브도메인 분할 규칙

Brief 또는 Model이 200줄을 초과하면 서브도메인으로 분할한다.

### 분할 신호

- Brief의 Flow가 5개 이상이고 서로 독립적
- Model의 엔티티가 6개 이상
- 화면이 8개 이상
- 역할별 관심사가 명확히 다름 (예: 고객 vs 관리자)

### 분할 방법

```
auth (200줄 초과)
  → auth-account (회원가입, 로그인, 비밀번호, 탈퇴)
  → auth-permission (역할, 권한, RBAC)
  → auth-membership (등급, 계약, 포인트)
```

1. 기존 brief/model에서 관심사별로 분리
2. CLAUDE.md Domains 테이블에 서브도메인 행 추가
3. 원본 도메인 행은 유지하되, Brief/Model 링크를 서브도메인으로 변경
4. _cross-domain.md에 서브도메인 간 이벤트 규칙 추가

### 분할하지 않는 경우

- 단순히 줄 수가 많을 뿐 관심사가 하나일 때 (테이블 행이 많은 것 ≠ 복잡)
- 분할해도 서로 항상 함께 변경되는 경우 (높은 결합도)

---

## 대화 원칙

### 질문 규칙
- 한 번에 3~5개. 10개 쏟아내지 않는다.
- 선택지를 제시한다: "보관 기한은? (30일/60일/무제한)"
- 이전 답변에서 추론한 것을 확인한다: "상태가 이게 맞나요?"
- 모르면 TBD. 강요하지 않는다: "나중에 정해도 됩니다."

### 문서 생성 규칙
- 초안을 먼저 보여주고 확인받는다. 바로 저장하지 않는다.
- 수정 요청은 즉시 반영한다.
- 저장 시 파일 경로를 알려준다.
- 한 도메인씩 완성한다. 여러 도메인을 동시에 진행하지 않는다.

### 품질 체크리스트

문서 저장 전 확인:

**PRD**
- [ ] Problem이 구체적인가 (누가, 어떤 상황, 무슨 불편)
- [ ] Scope 제외 항목에 이유가 있는가
- [ ] Non-Functional Requirements가 구체적인가 (숫자 + 측정 기준)
- [ ] Open Questions가 비어있지 않은가

**Brief**
- [ ] 9개 섹션이 모두 있는가 (summary, flow, rules, status, error-scenarios, api-endpoints, domain-events, screens, out-of-scope)
- [ ] 200줄 이내인가 (초과 시 서브도메인 분할 검토)
- [ ] Business Rule이 구체적인가 (숫자, 조건 명시)
- [ ] Status에 분기가 표현되어 있는가
- [ ] Error Scenario에 시스템 응답과 사용자 메시지가 있는가
- [ ] API Endpoints에 Auth와 Notes가 명시되어 있는가
- [ ] Domain Events에 구독자가 명시되어 있는가
- [ ] Screens에 핵심 기능이 명시되어 있는가

**Model**
- [ ] enum 값이 나열되어 있는가
- [ ] FK 대상이 명시되어 있는가
- [ ] Status flow가 Brief와 일치하는가
- [ ] Scale & Access Pattern이 있는가 (예상 규모, 조회 패턴, 보존 기간)
- [ ] 200줄 이내인가 (초과 시 서브도메인 분할 검토)

**UI (있을 때)**
- [ ] 화면별 Layout(ASCII)이 있는가
- [ ] 폼 필드에 validation과 placeholder가 있는가
- [ ] States(로딩/빈/에러)가 정의되어 있는가
- [ ] Conditional(조건부 표시)이 명시되어 있는가
- [ ] 200줄 이내인가
