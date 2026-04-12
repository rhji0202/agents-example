# Consolidation Model

## Consolidation
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User |
| status | enum(draft,confirmed,paid,packing,packed,shipped) | YES | 상태 |
| repack_option | enum(standard,repack,bubble_wrap) | YES | 포장 옵션 |
| item_count | integer | YES | 포함 상품 수 |
| total_weight_kg | decimal | NO | 합산 실중량 |
| volume_weight_kg | decimal | NO | 부피중량 (가로×세로×높이/5000) |
| billing_weight_kg | decimal | NO | 과금중량 (실중량 vs 부피중량 중 큰 값) |
| width_cm | decimal | NO | 포장 후 가로 |
| height_cm | decimal | NO | 포장 후 세로 |
| depth_cm | decimal | NO | 포장 후 높이 |
| packed_by | uuid | NO | FK → User (포장 직원) |
| packed_at | timestamp | NO | 포장 완료일 |
| created_at | timestamp | YES | 생성일 |
| updated_at | timestamp | YES | 수정일 |

### Status
draft → confirmed → paid → packing → packed → shipped

- draft: 묶음 생성, 상품 추가/제거 가능
- confirmed: 묶음 확정, 배송비 계산 가능
- paid: 결제 완료
- packing: 창고 직원 포장 중
- packed: 포장 완료, 발송 대기
- shipped: 발송 완료 (shipping 도메인으로 이관)

### Relationships
- belongs to User (N:1)
- has many Inbound (1:N)
- has one Payment (1:1)
- has one Shipment (1:1)

### Business Rules
- 최소 1개, 최대 10개 상품
- draft 상태에서만 상품 추가/제거 가능
- confirmed 이후 변경 불가
- repack 선택 시 수수료 $3 추가

### Indexes
- user_id: 내 묶음 목록
- status: 상태별 필터
