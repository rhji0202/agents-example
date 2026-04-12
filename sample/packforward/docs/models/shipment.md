# Shipment Model

## Shipment
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| consolidation_id | uuid | YES | FK → Consolidation |
| carrier | enum(ups,fedex,ems,dhl) | YES | 배송사 |
| waybill_number | string | NO | 운송장 번호 (발송 후) |
| status | enum(pending,shipped,in_transit,in_customs,customs_hold,domestic,delivered) | YES | 상태 |
| receiver_name | string | YES | 수취인 |
| receiver_phone | string | YES | 수취인 연락처 |
| receiver_address | jsonb | YES | 한국 배송지 |
| customs_id | string | YES | 개인통관부호 |
| declared_value_usd | decimal | YES | 신고가 (USD) |
| shipped_at | timestamp | NO | 발송일 |
| delivered_at | timestamp | NO | 배송 완료일 |
| created_at | timestamp | YES | 생성일 |
| updated_at | timestamp | YES | 수정일 |

### Status
pending → shipped → in_transit → in_customs → domestic → delivered
                                 ↘ customs_hold → in_customs (재진행)

- pending: 발송 대기 (결제 완료, 포장 완료)
- shipped: 미국 출발
- in_transit: 운송 중
- in_customs: 한국 세관 통관 중
- customs_hold: 통관 보류 (서류 추가 필요)
- domestic: 국내 택배 배송 중
- delivered: 배송 완료

### Relationships
- belongs to Consolidation (1:1)
- has many TrackingEvent (1:N)

---

## TrackingEvent
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| shipment_id | uuid | YES | FK → Shipment |
| status | string | YES | 이벤트 상태 코드 |
| description | string | YES | 상태 설명 |
| location | string | NO | 위치 |
| source | enum(carrier_api,manual,customs_api) | YES | 이벤트 출처 |
| occurred_at | timestamp | YES | 이벤트 발생일시 |
| created_at | timestamp | YES | 생성일 |

### Relationships
- belongs to Shipment (N:1)

### Indexes
- shipment_id + occurred_at: 추적 이벤트 시간순 조회
