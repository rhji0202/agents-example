# Auth Model

## User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| username | varchar(20) | YES | 로그인 아이디 (unique) |
| password_hash | varchar(255) | YES | bcrypt 해시 |
| name | varchar(50) | YES | 이름 |
| email | varchar(100) | NO | 이메일 |
| phone | varchar(20) | YES | 연락처 |
| user_type | enum(individual,business,staff) | YES | 개인/사업자/직원 |
| status | enum(pending,active,rejected,dormant,suspended,deactivated,inactive) | YES | 계정 상태 |
| vip_tier | enum(normal,silver,gold,vip) | NO | 고객 등급 (default normal) |
| point_balance | int | NO | 포인트 잔액 (default 0) |
| address | text | NO | 기본 주소 (고객) |
| employee_id | varchar(20) | NO | 사번 (직원, unique) |
| department | varchar(50) | NO | 부서 (직원) |
| position | varchar(50) | NO | 직급 (직원) |
| responsibilities | text | NO | 담당 업무 (직원) |
| last_login_at | timestamp | NO | 최근 로그인 |
| password_changed_at | timestamp | NO | 비밀번호 변경일 |
| created_at | timestamp | YES | 가입/등록일 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
pending(사업자 서류) → active / rejected → pending(재제출)
active → dormant(고객 180일) / inactive(직원 90일)
active → suspended → deactivated
```

### Indexes

- username: 로그인 조회
- user_type + status: 유형별 상태 필터
- email: 이메일 검색
- employee_id: 사번 조회
- department: 부서별 필터

## BusinessProfile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User (unique, 1:1) |
| business_name | varchar(100) | YES | 상호명 |
| business_number | varchar(20) | YES | 사업자번호 |
| representative | varchar(50) | YES | 대표자명 |
| business_type | varchar(50) | NO | 업태 |
| business_category | varchar(50) | NO | 업종 |
| contact_name | varchar(50) | NO | 담당자명 |
| contact_phone | varchar(20) | NO | 담당자 연락처 |
| contact_email | varchar(100) | NO | 담당자 이메일 |
| contact_department | varchar(50) | NO | 담당자 부서 |
| created_at | timestamp | YES | 등록일시 |
| updated_at | timestamp | YES | 수정일시 |

## BusinessDocument

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User |
| document_type | enum(business_registration,other) | YES | 서류 종류 |
| file_url | varchar(500) | YES | 업로드 파일 경로 |
| status | enum(pending,approved,rejected) | YES | 검토 상태 |
| reject_reason | text | NO | 반려 사유 |
| reviewed_by | uuid | NO | FK → User (Admin) |
| reviewed_at | timestamp | NO | 검토일시 |
| created_at | timestamp | YES | 제출일시 |

### Status

```
pending → approved / rejected
```

## CustomerContract

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User (unique, 1:1) |
| discount_rate | decimal(5,2) | NO | 할인율 (%) |
| settlement_cycle | enum(monthly,biweekly) | NO | 정산 주기 |
| dedicated_staff_id | uuid | NO | FK → User (전용 담당자) |
| free_storage_days | int | YES | 무료 보관일 (default 30, max 90) |
| special_services | text | NO | 특별 서비스 메모 |
| tax_invoice_enabled | boolean | YES | 세금계산서 발행 여부 |
| created_at | timestamp | YES | 계약일시 |
| updated_at | timestamp | YES | 수정일시 |

## PointTransaction

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User |
| type | enum(earn,use,expire,admin_add,admin_deduct) | YES | 유형 |
| amount | int | YES | 포인트 (양수) |
| balance_after | int | YES | 거래 후 잔액 |
| description | varchar(200) | YES | 사유 |
| reference_id | uuid | NO | 관련 주문/결제 ID |
| expires_at | timestamp | NO | 소멸 예정일 (earn 시) |
| created_at | timestamp | YES | 거래일시 |

### Indexes

- user_id + created_at: 사용자별 이력
- expires_at: 소멸 배치 대상 조회

## PermissionGroup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| name | varchar(50) | YES | 그룹명 (unique) |
| description | varchar(200) | NO | 설명 |
| permissions | jsonb | YES | 권한 목록 |
| created_at | timestamp | YES | 생성일시 |

### Seed Data

| name | 설명 |
|------|------|
| admin | 전체 권한 |
| logistics | 보관, 배송, 랙관리 |
| customer_service | 고객, 결제, 문의 |
| operations | 게시판, 통계, 로그 |
| reporting | 조회, 다운로드 |

## StaffPermission

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User (직원) |
| permission_group_id | uuid | YES | FK → PermissionGroup |
| granted_by | uuid | YES | FK → User (부여한 Admin) |
| created_at | timestamp | YES | 부여일시 |

### Unique Constraint

- user_id + permission_group_id

## Relationships

- User has one BusinessProfile (1:1, 사업자만)
- User has many BusinessDocument (1:N)
- User has one CustomerContract (1:1, 사업자만)
- User has many PointTransaction (1:N)
- User has many StaffPermission (1:N, 직원만)
- StaffPermission belongs to PermissionGroup (N:1)
- CustomerContract.dedicated_staff_id → User (N:1)
