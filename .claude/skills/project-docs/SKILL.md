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

### 도메인 추가/변경
- "도메인 추가해줘", "brief 만들어줘", "모델 정리해줘"
- "inbound 도메인 기획하자", "결제 플로우 정리해줘"
- "합배송 최대 10개에서 20개로 바꿔줘" (brief 업데이트)
- "새 필드 추가해야 해" (model 업데이트)

### 프로젝트 진행 중 문서 동기화
- 구현 시작/완료 시 → CLAUDE.md Status 업데이트
- 스키마 변경 시 → model 업데이트
- 요구사항 변경 시 → brief 업데이트
- 새 역할 추가 시 → PERMISSIONS.md 업데이트

### 프로젝트 현황 파악
- "지금 어디까지 됐어?", "남은 도메인이 뭐야?"
- "이 도메인 brief 있어?", "모델 정리된 거 맞아?"
- → CLAUDE.md Domains 테이블 Status 기준으로 답변

## Scope Boundaries

**Activate for:** 프로젝트 문서 생성 및 유지 (PRD, ARCHITECTURE, CLAUDE.md, briefs, models, PERMISSIONS, UI)

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
- Data models: docs/models/_overview.md
- Cross-domain rules: docs/briefs/_cross-domain.md
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
| auth | 인증 | docs/briefs/auth.md | docs/models/user.md | done |

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

### 물어볼 질문 (도메인별, 3단계)

**Step 1: 플로우**
```
1. 핵심 흐름은? (사용자가 → 뭘 하면 → 무슨 일이 → 결과)
2. 분기점이 있나요? (조건에 따라 다른 경로)
3. 예외 상황은? (실패, 거부, 취소)
```

**Step 2: 비즈니스 규칙**
```
1. {플로우에서 파생된 구체적 질문}
2. 상태는 이게 맞나요? {추론한 상태 흐름}
3. 누가 어떤 권한을 가지나요?
```

**Step 3: 화면**
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

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|

## Out of Scope
- {Feature} — {이유 또는 v2}
```

### PASS / FAIL 예시

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

## 8. 문서 업데이트 방법

Rule에 "언제" 업데이트할지는 정의되어 있다. 여기서는 "어떻게" 업데이트하는지 다룬다.

### Brief 업데이트 시

```
기획자: "합배송 최대 10개 → 20개로 변경해줘"
AI:
1. briefs/consolidation.md 읽기
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

## 9. UI 문서 — 화면 상세

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
- [ ] Open Questions가 비어있지 않은가

**Brief**
- [ ] 6개 섹션이 모두 있는가 (summary, flow, rules, status, screens, out-of-scope)
- [ ] 200줄 이내인가
- [ ] Business Rule이 구체적인가 (숫자, 조건 명시)
- [ ] Status에 분기가 표현되어 있는가
- [ ] Screens에 핵심 기능이 명시되어 있는가

**Model**
- [ ] enum 값이 나열되어 있는가
- [ ] FK 대상이 명시되어 있는가
- [ ] Status flow가 Brief와 일치하는가
- [ ] 200줄 이내인가

**UI (있을 때)**
- [ ] 화면별 Layout(ASCII)이 있는가
- [ ] 폼 필드에 validation과 placeholder가 있는가
- [ ] States(로딩/빈/에러)가 정의되어 있는가
- [ ] Conditional(조건부 표시)이 명시되어 있는가
- [ ] 200줄 이내인가
