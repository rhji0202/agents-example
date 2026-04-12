# Payment Model

## Payment
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| consolidation_id | uuid | YES | FK → Consolidation |
| user_id | uuid | YES | FK → User |
| status | enum(pending,paid,refunded,partial_refund) | YES | 상태 |
| shipping_fee_krw | integer | YES | 배송비 (원) |
| repack_fee_krw | integer | YES | 재포장 수수료 (원, 0 가능) |
| storage_fee_krw | integer | YES | 보관료 (원, 0 가능) |
| total_krw | integer | YES | 총 결제 금액 (원) |
| exchange_rate | decimal | YES | 적용 환율 (USD→KRW) |
| billing_weight_kg | decimal | YES | 과금중량 |
| pg_transaction_id | string | NO | 토스페이먼츠 거래 ID |
| pg_payment_key | string | NO | 토스페이먼츠 결제 키 |
| paid_at | timestamp | NO | 결제일시 |
| refunded_at | timestamp | NO | 환불일시 |
| refund_amount_krw | integer | NO | 환불 금액 |
| refund_reason | string | NO | 환불 사유 |
| created_at | timestamp | YES | 생성일 |
| updated_at | timestamp | YES | 수정일 |

### Status
pending → paid → (refunded | partial_refund)

- pending: 결제 대기 (배송비 계산 완료)
- paid: 결제 완료
- refunded: 전액 환불
- partial_refund: 부분 환불 (금지품목 제외 등)

### Relationships
- belongs to Consolidation (1:1)
- belongs to User (N:1)

### Indexes
- consolidation_id: unique, 묶음당 1결제
- user_id: 결제 내역 조회
- pg_transaction_id: PG 연동 조회
