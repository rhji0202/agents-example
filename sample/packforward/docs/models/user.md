# User Model

## User
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| email | string | YES | 로그인 이메일 |
| name | string | YES | 이름 |
| phone | string | YES | 연락처 |
| role | enum(user,warehouse_staff,admin) | YES | 역할 |
| warehouse_code | string | YES | 개인 창고 코드 (US-00001) |
| customs_id | string | NO | 개인통관부호 (P + 12자리) |
| address_kr | jsonb | NO | 한국 배송지 {zipcode, address, detail} |
| created_at | timestamp | YES | 가입일 |
| updated_at | timestamp | YES | 수정일 |

### Notes
- warehouse_code는 가입 시 자동 발급 (US-{sequential 5 digits})
- customs_id는 배송 신청 시 필수 (가입 시 선택)
- customs_id 형식: P + 12자리 숫자, 관세청 API로 검증
- address_kr은 최근 배송지 저장 (다음 결제 시 자동 입력)

### Indexes
- email: unique, 로그인
- warehouse_code: unique, 입고 매칭
