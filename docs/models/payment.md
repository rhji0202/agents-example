# Payment Model

## PaymentRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| user_id | uuid | YES | FK → User |
| status | enum(pending,paid,failed,retrying,cancelled) | YES | 결제 상태 |
| base_fee | decimal(12,2) | YES | 기본 배송비 |
| repackaging_fee | decimal(12,2) | YES | 재포장 수수료 |
| insurance_fee | decimal(12,2) | YES | 보험료 |
| photo_fee | decimal(12,2) | YES | 사진촬영 수수료 |
| tax | decimal(12,2) | YES | 세금 |
| total_amount | decimal(12,2) | YES | 총 결제 금액 |
| pricing_type | enum(individual,seller) | YES | 적용 요금제 |
| payment_method | enum(card,bank_transfer,deposit) | NO | 결제 수단 |
| pg_transaction_id | varchar(100) | NO | PG사 거래 ID |
| retry_count | int | YES | 재시도 횟수 (max 3) |
| vip_deferred | boolean | YES | VIP 유예 여부 |
| vip_deferred_by | uuid | NO | FK → User (재무팀 승인자) |
| expires_at | timestamp | YES | 결제 유효기한 (72h) |
| paid_at | timestamp | NO | 결제 완료일시 |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
pending → paid
       ↘ failed → retrying(3회) → paid
                                 ↘ failed → cancelled(72h 초과)
```

### Indexes

- order_id: 주문별 결제
- user_id + status: 내 결제 목록
- status + expires_at: 만료 임박 결제 조회

## Deposit

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User |
| balance | decimal(12,2) | YES | 현재 잔액 |
| updated_at | timestamp | YES | 최종 변동일시 |

### Indexes

- user_id: unique, 사용자별 잔액

## DepositTransaction

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| deposit_id | uuid | YES | FK → Deposit |
| type | enum(charge,use,refund) | YES | 거래 유형 |
| amount | decimal(12,2) | YES | 금액 |
| balance_after | decimal(12,2) | YES | 거래 후 잔액 |
| reference_id | uuid | NO | 관련 결제 ID (use/refund 시) |
| description | varchar(200) | NO | 설명 |
| created_at | timestamp | YES | 거래일시 |

### Relationships

- PaymentRequest belongs to Order (N:1)
- PaymentRequest belongs to User (N:1)
- Deposit belongs to User (1:1)
- Deposit has many DepositTransaction (1:N)

## PricingRule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_type | enum(individual,seller) | YES | 적용 대상 |
| min_weight_kg | decimal(8,2) | YES | 구간 시작 무게 |
| max_weight_kg | decimal(8,2) | YES | 구간 종료 무게 |
| price_per_kg | decimal(12,2) | YES | kg당 단가 |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Indexes

- user_type + min_weight_kg: 요금 구간 조회
