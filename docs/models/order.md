# Order Model

## Order

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_number | varchar(20) | YES | 주문번호 (unique, 시스템 발급) |
| user_id | uuid | YES | FK → User |
| status | enum(draft,submitted,reviewing,approved,rejected,resubmitted,cancelled) | YES | 주문 상태 |
| recipient_name | varchar(50) | YES | 수취인 이름 |
| recipient_phone | varchar(20) | YES | 수취인 연락처 |
| recipient_address | text | YES | 수취인 주소 |
| recipient_zip | varchar(10) | YES | 우편번호 |
| extra_repackaging | boolean | YES | 추가서비스: 재포장 |
| extra_insurance | boolean | YES | 추가서비스: 보험 |
| extra_photo | boolean | YES | 추가서비스: 사진촬영 |
| reject_reason | text | NO | 반려 사유 |
| reviewed_by | uuid | NO | FK → User (Admin) |
| reviewed_at | timestamp | NO | 검토일시 |
| submitted_at | timestamp | NO | 제출일시 |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
draft → submitted → reviewing → approved
                              ↘ rejected → resubmitted → reviewing
submitted(72h) → cancelled
rejected(72h) → cancelled
```

### Indexes

- order_number: 주문번호 조회
- user_id + status: 내 주문 목록
- status + submitted_at: 검토 대기 목록 (반려 건 우선)

## OrderItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| shop_name | varchar(100) | YES | 쇼핑몰명 |
| product_name | varchar(200) | YES | 상품명 |
| quantity | int | YES | 수량 |
| tracking_number | varchar(50) | NO | 중국 내 운송장번호 |
| memo | text | NO | 메모 |
| created_at | timestamp | YES | 생성일시 |

### Relationships

- Order belongs to User (N:1)
- Order has many OrderItem (1:N)
- OrderItem belongs to Order (N:1)
