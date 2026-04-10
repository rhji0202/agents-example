# RBAC (Role-Based Access Control) Specification v1

> **Status**: draft
> **Author**: 기획팀
> **Created**: 2026-04-10
> **Spec ID**: rbac
> **Version**: 1

## 1. Overview (개요)

HubNext 플랫폼의 역할 기반 접근 제어(RBAC) 시스템 스펙. 사용자 인증, 역할 관리, 권한 검사, 데이터 격리, 감사 로그를 정의한다.

5개 역할(customer, operator, warehouse, admin, super_admin)을 기반으로 주문·재고·통관·보험·보고서·시스템 설정 등 모든 도메인 리소스에 대한 접근을 제어한다.

**관련 스펙**: `order.v1.md` — RBAC User 모델이 order의 `mailbox_id` FK 대상을 제공한다.

## 2. Problem Statement (문제 정의)

- **Current State**: 인증/인가 시스템이 없음. 백엔드에 `GET /` 하나만 존재하며, 프론트엔드 `(admin)` 라우트가 비어있음
- **Pain Points**:
  - 사용자 인증 없이 주문 API를 보호할 수 없음
  - 고객/운영자/물류담당/관리자 간 데이터 격리가 불가능
  - 주문 상태 변경(approved/rejected) 권한이 정의되지 않음
  - 관리자 기능(사용자 관리, 시스템 설정)을 구현할 기반이 없음
- **Impact**: 모든 기능의 전제 조건. order.v1.md를 포함한 모든 도메인 스펙이 RBAC에 의존

## 3. Requirements (요구사항)

### 3.1 Functional Requirements (기능 요구사항)

#### 3.1.1 Role Management (역할 관리)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | 역할 정의 (5개: customer, operator, warehouse, admin, super_admin) | critical | DB 시드로 5개 역할 존재, 각 역할에 code/name/description/level 포함 |
| FR-002 | 역할 계층: super_admin(5) > admin(4) > operator(3) = warehouse(3) > customer(1) | critical | 상위 역할이 하위 역할의 권한을 암시적 상속, 계층 레벨 DB 저장 |
| FR-003 | 사용자에게 역할 할당 (1인 다역할) | critical | admin 이상만 할당 가능, 자기보다 높은 역할 할당 불가, audit log 기록 |
| FR-004 | 사용자 역할 해제 | critical | admin 이상만 해제 가능, 마지막 super_admin 해제 불가(잠금 방지), audit log 기록 |
| FR-005 | 역할 목록 조회 | high | admin 이상: 전체 역할 목록, customer: 자기 역할만 확인 |

#### 3.1.2 Permission Management (권한 관리)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-006 | 권한 정의 — `resource:action` 형식 | critical | `order:create`, `order:read` 등 패턴으로 DB 시드 |
| FR-007 | 역할-권한 매핑 테이블 | critical | role_permissions 조인 테이블에 매핑 저장, 시드 데이터로 초기 설정 |
| FR-008 | NestJS Guard 기반 권한 검사 | critical | 모든 보호 엔드포인트에서 JWT 역할로 권한 검증, 무권한 시 403 |
| FR-009 | 프론트엔드 권한 기반 UI 렌더링 | critical | 권한 없는 메뉴/버튼 숨김, 직접 URL 접근 시 403 페이지 |
| FR-010 | 동적 권한 변경 (super_admin만) | medium | 역할-권한 매핑을 런타임 변경 가능, 변경 후 캐시 무효화 |

#### 3.1.3 Order Access Control (주문 접근 제어)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-011 | customer: 자기 주문만 CRUD | critical | `mailbox_id`가 본인인 주문만 접근, 타인 주문 403 |
| FR-012 | operator: 자동 할당된 주문 읽기/수정 | critical | 물류센터별 자동 할당, 할당된 주문만 조회/상태 변경 |
| FR-013 | warehouse: 소속 물류센터 주문만 접근 | critical | `warehouse_code` 일치 주문만 조회/수정 |
| FR-014 | admin: 전체 주문 CRUD | critical | 모든 주문 생성/조회/수정/삭제, 필터/검색/정렬 |
| FR-015 | super_admin: 전체 주문 CRUD + soft-delete 복구 | high | admin 동일 + 삭제된 주문 복원 가능 |

#### 3.1.4 User Management (사용자 관리)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-016 | admin: 사용자 목록 조회 (역할별 필터) | critical | 전체 목록, 역할/상태별 필터, 페이지네이션 |
| FR-017 | admin: 내부 직원 계정 생성 (operator/warehouse) | high | 역할 즉시 할당, 초기 비밀번호 설정 |
| FR-018 | admin: 사용자 비활성화/활성화 | critical | 비활성화 시 즉시 로그인 불가, 기존 세션 무효화, audit log |
| FR-019 | customer: 자기 프로필 조회/수정 | high | 이름/연락처/주소 수정 가능, 역할/사서함번호 수정 불가 |
| FR-020 | super_admin: admin 계정 생성/관리 | high | admin 역할 할당/해제는 super_admin만 가능 |

#### 3.1.5 Data Domain Access (도메인별 접근 제어)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-021 | 재고관리 접근: warehouse=소속 센터 CRUD, operator=읽기, admin+=전체 | high | customer 접근 불가, warehouse는 소속 센터만 |
| FR-022 | 통관처리 접근: operator=할당 건 처리, customer=자기 건 상태 읽기 | high | admin: 전체, warehouse: 읽기만 |
| FR-023 | 보험관리 접근: customer=자기 건 조회, operator=할당 건 처리 | medium | admin: 전체 관리 |
| FR-024 | 보고서 접근: operator=담당 범위, warehouse=센터, admin+=전체 | medium | customer: 접근 불가 |
| FR-025 | 시스템 설정: super_admin만 접근 | critical | 물류센터 설정, 통관 기준금액, 보험료 설정 등 |

#### 3.1.6 Audit & Logging (감사 로그)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-026 | 권한 변경 감사 로그 | critical | 역할 할당/해제, 권한 변경 시 who/what/when/from/to 기록 |
| FR-027 | 주요 데이터 변경 감사 로그 | high | 주문 상태 변경, 사용자 비활성화 등 로그 |
| FR-028 | 감사 로그 조회: admin=주요 로그, super_admin=전체+필터+내보내기 | high | 검색, 날짜 필터, CSV 내보내기 |
| FR-029 | 감사 로그 불변성 (append-only) | critical | 수정/삭제 불가 |
| FR-030 | 로그인 이력 기록 | high | 모든 로그인/로그아웃 시도, IP/UA/시간/성공여부 |

#### 3.1.7 Authentication Integration (인증 연동)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-031 | JWT 토큰에 역할 정보 포함 | critical | access token payload에 `roles[]`, refresh 시 최신 역할 반영 |
| FR-032 | HttpOnly Cookie 기반 JWT 전달 | critical | HttpOnly/Secure/SameSite=Strict, CSRF 토큰 별도 발급 |
| FR-033 | 토큰 갱신 시 역할 동기화 | high | refresh 시 DB 최신 역할 재조회, 비활성 사용자 갱신 거부 |
| FR-034 | 다중 세션 관리 | medium | admin 이상: 타 사용자 활성 세션 강제 종료 가능 |
| FR-035 | 회원가입 시 customer 역할 자동 할당 | critical | 가입 완료 시 `customer` 역할 + `mailbox_id` 자동 생성 |

#### 3.1.8 Frontend Route Protection (프론트엔드 라우트 보호)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-036 | Route Group 접근 제어: `(user)/*`=customer 이상, `(admin)/*`=operator 이상 | critical | 미인증 시 /login 리다이렉트, 무권한 시 403 |
| FR-037 | Next.js Middleware JWT 검증 | critical | middleware.ts에서 쿠키 JWT 파싱 + 역할 검증 |
| FR-038 | 관리자 사이드바 메뉴 권한 필터링 | high | 역할에 따라 메뉴 항목 동적 표시/숨김 |

#### 3.1.9 Operator Auto-Assignment (운영자 자동 할당)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-039 | 주문 접수 시 물류센터별 operator 자동 할당 | critical | 주문의 `warehouse_code`와 동일 센터 담당 operator 중 라운드 로빈 할당 |
| FR-040 | 할당 불가 시 admin에게 알림 | high | 해당 센터에 활성 operator가 없으면 admin에게 알림, 수동 할당 대기 |
| FR-041 | admin: 수동 재할당 | high | admin이 주문의 담당 operator를 변경 가능 |

### 3.2 Non-Functional Requirements (비기능 요구사항)

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | 권한 검사 응답 지연 (캐시) | < 5ms |
| NFR-002 | Performance | 권한 검사 응답 지연 (DB) | < 50ms |
| NFR-003 | Performance | JWT 파싱 + Guard 실행 | < 10ms/request |
| NFR-004 | Performance | 역할/권한 캐싱 TTL | 5분 (인메모리) |
| NFR-005 | Security | JWT access token 만료 | 15분 |
| NFR-006 | Security | JWT refresh token 만료 | 7일 |
| NFR-007 | Security | 권한 검사 기본 정책 | 화이트리스트 (기본 거부) |
| NFR-008 | Security | 역할 상승 공격 방지 | 자기보다 높은 역할 할당 API 차단 |
| NFR-009 | Security | 감사 로그 변조 방지 | append-only 테이블 |
| NFR-010 | Security | 비밀번호 해싱 | bcrypt (cost factor 12) |
| NFR-011 | Availability | 인증/권한 서비스 가용성 | 99.9% |
| NFR-012 | Scalability | 동시 세션 | 1,000+ |
| NFR-013 | Compliance | 감사 로그 보관 | 최소 1년, 통관/금융 5년 |
| NFR-014 | Compliance | 개인정보보호법 | 로그 내 개인정보 마스킹 |
| NFR-015 | Testability | Guard/권한 로직 테스트 커버리지 | 90%+ |
| NFR-016 | Maintainability | 새 권한 추가 | 시드 데이터 + 데코레이터만으로 가능 |

## 4. User Stories (사용자 스토리)

### US-001: 회원가입
- **As a** 신규 사용자
- **I want** 회원가입을 하고 싶다
- **So that** HubNext 서비스를 이용할 수 있다
- **Acceptance Criteria**:
  - [ ] 이메일/비밀번호/이름/연락처 입력 후 가입
  - [ ] 가입 완료 시 `customer` 역할 자동 할당
  - [ ] `mailbox_id` 자동 생성 (패턴: `MB{YYYYMMDD}{seq}`)
  - [ ] 개인/사업자 `user_type` 선택
- **Related**: FR-035

### US-002: 로그인/로그아웃
- **As a** 가입된 사용자
- **I want** 로그인하여 서비스를 이용하고 싶다
- **So that** 인증된 상태에서 주문 등 기능을 사용할 수 있다
- **Acceptance Criteria**:
  - [ ] 이메일 + 비밀번호로 로그인
  - [ ] JWT access token (HttpOnly Cookie) + refresh token 발급
  - [ ] CSRF 토큰 발급
  - [ ] 로그인 이력 기록 (IP, UA, 시간, 성공여부)
  - [ ] 로그아웃 시 쿠키 삭제 + 서버 세션 무효화
- **Related**: FR-030, FR-031, FR-032

### US-003: 고객 자기 데이터 접근
- **As a** customer
- **I want** 내 주문과 프로필만 보고 싶다
- **So that** 다른 사용자의 데이터에 접근할 수 없다
- **Acceptance Criteria**:
  - [ ] 주문 목록에서 자기 `mailbox_id` 주문만 표시
  - [ ] 타인 주문 ID로 직접 API 호출 시 403
  - [ ] 프로필 조회/수정은 자기 것만
- **Related**: FR-011, FR-019

### US-004: 운영자 주문 처리
- **As a** operator
- **I want** 자동 할당된 주문을 처리하고 싶다
- **So that** 담당 주문의 통관/처리를 진행할 수 있다
- **Acceptance Criteria**:
  - [ ] 대시보드에 할당된 주문 목록 표시
  - [ ] 주문 상태를 `submitted → approved/rejected`로 변경 가능
  - [ ] 미할당/타 operator 주문은 조회 불가
  - [ ] 통관 처리 기능 접근 가능
- **Related**: FR-012, FR-022, FR-039

### US-005: 물류센터 담당자 재고 관리
- **As a** warehouse
- **I want** 소속 물류센터의 재고와 주문을 관리하고 싶다
- **So that** 센터 내 입출고 처리를 할 수 있다
- **Acceptance Criteria**:
  - [ ] 소속 `warehouse_code` 주문만 조회
  - [ ] 소속 센터 재고 CRUD 가능
  - [ ] 타 센터 데이터 접근 시 403
  - [ ] 주문 상태 변경은 물류 관련 필드만
- **Related**: FR-013, FR-021

### US-006: 관리자 사용자 관리
- **As a** admin
- **I want** 사용자 계정을 관리하고 싶다
- **So that** 운영자/물류담당 계정을 생성하고 역할을 할당할 수 있다
- **Acceptance Criteria**:
  - [ ] 사용자 목록 조회 (역할/상태 필터)
  - [ ] operator/warehouse 계정 생성 + 역할 할당
  - [ ] 사용자 비활성화 시 즉시 로그인 차단
  - [ ] admin 역할은 할당 불가 (super_admin만)
  - [ ] 모든 변경사항 audit log 기록
- **Related**: FR-003, FR-004, FR-016, FR-017, FR-018, FR-020

### US-007: 슈퍼관리자 시스템 설정
- **As a** super_admin
- **I want** 시스템 설정과 전체 감사 로그를 관리하고 싶다
- **So that** 플랫폼 운영 규칙을 변경하고 보안을 감시할 수 있다
- **Acceptance Criteria**:
  - [ ] 물류센터 추가/수정/비활성화
  - [ ] 통관 기준금액, 보험료 설정 변경
  - [ ] 역할-권한 매핑 동적 변경
  - [ ] 전체 감사 로그 조회 + 필터 + CSV 내보내기
  - [ ] admin 계정 생성/관리
- **Related**: FR-010, FR-020, FR-025, FR-028

### US-008: 권한 시스템 인프라
- **As a** 개발자
- **I want** Guard 기반 권한 검사 시스템이 모든 엔드포인트에 일관되게 적용되길 원한다
- **So that** 새 API 추가 시 데코레이터만으로 권한을 선언할 수 있다
- **Acceptance Criteria**:
  - [ ] `resource:action` 형식 권한이 DB에 정의됨
  - [ ] 역할-권한 매핑 테이블로 유연한 매핑
  - [ ] NestJS Guard가 모든 보호 엔드포인트에서 JWT 역할로 권한 검증
  - [ ] 무권한 요청 시 403 반환
  - [ ] 새 권한 추가 시 시드 데이터 + 데코레이터만으로 가능
- **Related**: FR-006, FR-007, FR-008

### US-009: 주문 자동 할당
- **As a** 시스템
- **I want** 접수된 주문을 자동으로 operator에게 할당하고 싶다
- **So that** 수동 할당 없이 즉시 처리가 시작된다
- **Acceptance Criteria**:
  - [ ] 주문 `submitted` 시 `warehouse_code` 기준 operator 자동 할당
  - [ ] 라운드 로빈 방식 (동일 센터 operator 간 순차)
  - [ ] 활성 operator가 없으면 admin 알림 + 미할당 상태 유지
  - [ ] admin이 수동 재할당 가능
- **Related**: FR-039, FR-040, FR-041

## 5. Data Model (데이터 모델)

### User (사용자)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| email | string | UNIQUE, NOT NULL, max 255 | 로그인 이메일 |
| password_hash | string | NOT NULL | bcrypt 해시 |
| name | string | NOT NULL, max 50 | 이름 |
| phone | string | NOT NULL, pattern: `01X-XXXX-XXXX` | 연락처 |
| mailbox_id | string | UNIQUE, NOT NULL, pattern: `MB{YYYYMMDD}{seq}` | 사서함번호 |
| user_type | enum | NOT NULL, `individual`/`business` | 개인/사업자 |
| warehouse_code | enum | NULLABLE, `WH001`/`WH002`/`WH003`/`WH004` | warehouse 역할 시 소속 센터 (1:1) |
| is_active | boolean | NOT NULL, DEFAULT true | 활성 상태 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamp | NOT NULL | |
| last_login_at | timestamp | NULLABLE | 마지막 로그인 |

### Role (역할)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| code | string | UNIQUE, NOT NULL | `customer`, `operator`, `warehouse`, `admin`, `super_admin` |
| name | string | NOT NULL | 표시명 (한글) |
| description | string | NULLABLE | 역할 설명 |
| level | integer | NOT NULL | 계층 레벨 (1, 3, 4, 5) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Permission (권한)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| code | string | UNIQUE, NOT NULL | `resource:action` 형식 |
| description | string | NULLABLE | 권한 설명 |
| resource | string | NOT NULL | 리소스명 (order, user, role 등) |
| action | string | NOT NULL | 액션 (create, read, update, delete 등) |

### UserRole (사용자-역할 매핑)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → User, NOT NULL | |
| role_id | UUID | FK → Role, NOT NULL | |
| assigned_by | UUID | FK → User, NOT NULL | 할당한 관리자 |
| assigned_at | timestamp | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, role_id) | | | 동일 역할 중복 할당 방지 |

### RolePermission (역할-권한 매핑)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| role_id | UUID | FK → Role, NOT NULL | |
| permission_id | UUID | FK → Permission, NOT NULL | |
| UNIQUE(role_id, permission_id) | | | 중복 방지 |

### AuditLog (감사 로그)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| actor_id | UUID | FK → User, NULLABLE | 수행자 (시스템 액션 시 NULL) |
| action | string | NOT NULL | 수행 액션 |
| resource_type | string | NOT NULL | 대상 리소스 타입 |
| resource_id | string | NOT NULL | 대상 리소스 ID |
| changes | JSON | NULLABLE | `{ from: {...}, to: {...} }` |
| ip_address | string | NULLABLE | |
| user_agent | string | NULLABLE | |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### LoginHistory (로그인 이력)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → User, NOT NULL | |
| success | boolean | NOT NULL | 성공 여부 |
| ip_address | string | NOT NULL | |
| user_agent | string | NULLABLE | |
| failure_reason | string | NULLABLE | 실패 사유 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### OrderAssignment (주문 할당)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK → Application, NOT NULL | 주문 ID |
| operator_id | UUID | FK → User, NOT NULL | 할당된 operator |
| assigned_by | UUID | FK → User, NULLABLE | 할당자 (NULL=자동) |
| assignment_type | enum | NOT NULL, `auto`/`manual` | 할당 방식 |
| assigned_at | timestamp | NOT NULL, DEFAULT NOW() | |

### RefreshToken (리프레시 토큰)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → User, NOT NULL | |
| token_hash | string | NOT NULL | 토큰 해시 |
| expires_at | timestamp | NOT NULL | 만료일시 |
| is_revoked | boolean | NOT NULL, DEFAULT false | 무효화 여부 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

## 6. API Contracts (API 계약)

### 6.1 Authentication

#### POST /api/v1/auth/register
- **Description**: 회원가입
- **Auth**: 없음 (public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecureP@ss1",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "user_type": "individual"
  }
  ```
- **Response**: `201 Created`
  ```json
  { "success": true, "data": { "id": "uuid", "email": "...", "mailbox_id": "MB20260410001" } }
  ```
- **Errors**: `409 Conflict` (이메일 중복), `400 Bad Request` (유효성 실패)

#### POST /api/v1/auth/login
- **Description**: 로그인
- **Auth**: 없음 (public)
- **Request Body**:
  ```json
  { "email": "user@example.com", "password": "SecureP@ss1" }
  ```
- **Response**: `200 OK` — Set-Cookie: `access_token` (HttpOnly), `csrf_token`
  ```json
  { "success": true, "data": { "user": { "id": "...", "roles": ["customer"] } } }
  ```
- **Errors**: `401 Unauthorized` (잘못된 자격증명), `403 Forbidden` (비활성 계정)

#### POST /api/v1/auth/refresh
- **Description**: 토큰 갱신
- **Auth**: refresh token (Cookie)
- **Response**: 새 access_token + csrf_token 발급

#### POST /api/v1/auth/logout
- **Description**: 로그아웃
- **Auth**: access token
- **Response**: `200 OK` — Cookie 삭제 + refresh token 무효화

### 6.2 Users

#### GET /api/v1/users
- **Description**: 사용자 목록 조회
- **Auth**: `user:read` (admin+)
- **Query**: `?role=operator&status=active&page=1&limit=20`
- **Response**: 페이지네이션된 사용자 목록

#### GET /api/v1/users/me
- **Description**: 내 프로필 조회
- **Auth**: 인증된 사용자
- **Response**: 현재 사용자 정보 + 역할 + 권한 목록

#### PATCH /api/v1/users/me
- **Description**: 내 프로필 수정
- **Auth**: 인증된 사용자
- **Request Body**: `{ "name": "...", "phone": "..." }`

#### POST /api/v1/users
- **Description**: 내부 직원 계정 생성
- **Auth**: `user:create` (admin+)
- **Request Body**: 사용자 정보 + 초기 역할

#### PATCH /api/v1/users/:id/status
- **Description**: 사용자 활성화/비활성화
- **Auth**: `user:deactivate` (admin+)
- **Request Body**: `{ "is_active": false }`

### 6.3 Roles

#### GET /api/v1/roles
- **Description**: 역할 목록
- **Auth**: `role:read` (admin+)

#### POST /api/v1/users/:id/roles
- **Description**: 역할 할당
- **Auth**: `role:assign` (admin+, 자기보다 낮은 역할만)
- **Request Body**: `{ "role_code": "operator" }`

#### DELETE /api/v1/users/:id/roles/:roleCode
- **Description**: 역할 해제
- **Auth**: `role:assign` (admin+)

### 6.4 Permissions

#### GET /api/v1/permissions
- **Description**: 전체 권한 목록
- **Auth**: `role:read` (super_admin)

#### PUT /api/v1/roles/:roleCode/permissions
- **Description**: 역할-권한 매핑 변경
- **Auth**: `config:write` (super_admin)
- **Request Body**: `{ "permissions": ["order:create", "order:read", ...] }`

### 6.5 Audit Logs

#### GET /api/v1/audit-logs
- **Description**: 감사 로그 조회
- **Auth**: `audit:read` (admin+)
- **Query**: `?resource_type=user&from=2026-04-01&to=2026-04-10&page=1`

#### GET /api/v1/audit-logs/export
- **Description**: 감사 로그 CSV 내보내기
- **Auth**: `audit:read` (super_admin)

### 6.6 Order Assignment

#### GET /api/v1/order-assignments
- **Description**: 주문 할당 목록 (operator 대시보드)
- **Auth**: operator+
- **Query**: `?status=pending&page=1`

#### PATCH /api/v1/order-assignments/:id
- **Description**: 주문 재할당 (admin 수동)
- **Auth**: `order:assign` (admin+)
- **Request Body**: `{ "operator_id": "uuid" }`

## 7. UI/UX Requirements (UI/UX 요구사항)

### 7.1 인증 페이지

- **로그인 페이지** (`/login`): 이메일/비밀번호 폼, 회원가입 링크
- **회원가입 페이지** (`/register`): 이메일/비밀번호/이름/연락처/개인·사업자 선택
- **403 페이지**: 권한 부족 안내 + 홈 또는 로그인 리다이렉트

### 7.2 관리자 레이아웃 (`(admin)`)

- **사이드바**: 역할에 따라 메뉴 항목 동적 표시
  - operator: 할당된 주문, 통관 처리
  - warehouse: 재고 관리, 센터 주문
  - admin: 전체 주문, 사용자 관리, 보고서
  - super_admin: admin 전체 + 시스템 설정, 감사 로그

### 7.3 권한 기반 컴포넌트

- `<PermissionGate permission="order:create">`: 권한 있을 때만 children 렌더
- `usePermissions()` hook: 현재 사용자 권한 목록 반환
- `useAuth()` hook: 인증 상태, 로그인/로그아웃, 사용자 정보

## 8. Dependencies (의존성)

### Backend Packages (신규 설치 필요)

| Package | Purpose |
|---------|---------|
| `@nestjs/jwt` | JWT 토큰 발급/검증 |
| `@nestjs/passport` | Passport 인증 전략 |
| `passport-jwt` | JWT Passport 전략 |
| `bcrypt` | 비밀번호 해싱 |
| `prisma` + `@prisma/client` | DB ORM |

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| MariaDB | 데이터베이스 | 설정 필요 |
| 도로명 주소 API | 회원가입 주소 | TBD |

### Internal Dependencies

| Spec | Dependency |
|------|-----------|
| `order.v1.md` | User.mailbox_id → Application.mailbox_id FK, OrderAssignment 테이블 추가 |

## 9. Constraints & Assumptions (제약사항 및 가정)

### Constraints (제약사항)
- JWT access token은 stateless, refresh token은 DB 저장
- 감사 로그 테이블은 DELETE/UPDATE 불가 (DB 레벨 제한)
- warehouse 역할은 1인 1센터 (1:1 매핑)
- operator 주문 할당은 물류센터별 라운드 로빈

### Assumptions (가정)
- 사용자는 이메일로 가입 (소셜 로그인은 미래 스펙)
- 2FA는 초기 범위에 포함하지 않음 (미래 스펙)
- IP 제한은 초기 범위에 포함하지 않음 (미래 스펙)
- Redis 캐싱은 필요 시 도입, 초기엔 인메모리 캐시 사용
- customer 역할 내 개인/사업자는 `user_type` 속성으로 구분 (별도 역할 아님)

## 10. Permission Matrix (권한 매트릭스)

| Resource:Action | customer | operator | warehouse | admin | super_admin |
|----------------|----------|----------|-----------|-------|-------------|
| order:create | own | - | - | all | all |
| order:read | own | assigned | center | all | all |
| order:update | own (draft) | assigned | center (status) | all | all |
| order:delete | own (draft) | - | - | all | all |
| order:approve | - | assigned | - | all | all |
| order:assign | - | - | - | all | all |
| user:read | self | - | - | all | all |
| user:create | - | - | - | staff | all |
| user:update | self | - | - | all (not admin+) | all |
| user:deactivate | - | - | - | staff | all |
| role:read | self | - | - | all | all |
| role:assign | - | - | - | below-self | all |
| inventory:read | - | all | center | all | all |
| inventory:write | - | - | center | all | all |
| customs:read | own (status) | assigned | center | all | all |
| customs:process | - | assigned | - | all | all |
| insurance:read | own | assigned | - | all | all |
| report:read | - | scope | center | all | all |
| config:read | - | - | - | - | all |
| config:write | - | - | - | - | all |
| audit:read | - | - | - | limited | all |
| audit:export | - | - | - | - | all |

> **Legend**: `own`=자기 데이터만, `assigned`=할당된 건, `center`=소속 센터, `all`=전체, `self`=자기 정보만, `staff`=operator/warehouse만 생성, `below-self`=자기보다 낮은 역할만, `scope`=담당 범위, `limited`=주요 로그만

## 11. Glossary (용어집)

| Term | Definition |
|------|-----------|
| RBAC | Role-Based Access Control, 역할 기반 접근 제어 |
| Guard | NestJS 미들웨어. 요청의 인증/인가를 검증하여 통과/차단 결정 |
| Permission | `resource:action` 형식의 세분화된 권한 단위 |
| Role Hierarchy | 상위 역할이 하위 역할의 권한을 암시적으로 상속하는 구조 |
| mailbox_id | 사서함번호. HubNext 회원 고유 식별자, 주문과 연결 |
| warehouse_code | 물류센터 코드 (WH001=위해, WH002=위해-인천1, WH003=위해-인천2, WH004=일본) |
| Round Robin | 순차 할당 방식. 동일 센터 operator들에게 번갈아 할당 |
| HttpOnly Cookie | JavaScript에서 접근 불가한 쿠키. XSS 방어용 |
| CSRF | Cross-Site Request Forgery. HttpOnly Cookie 사용 시 별도 방어 필요 |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-04-10 | Initial spec — 5 roles, permission matrix, auth integration, auto-assignment |
