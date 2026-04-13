# Inbound Model

## InboundItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| order_item_id | uuid | YES | FK → OrderItem |
| status | enum(waiting,received,inspecting,measured,rejected) | YES | 입고 상태 |
| weight_kg | decimal(8,2) | NO | 무게 (kg) |
| width_cm | decimal(8,2) | NO | 가로 (cm) |
| height_cm | decimal(8,2) | NO | 세로 (cm) |
| depth_cm | decimal(8,2) | NO | 높이 (cm) |
| volume_weight_kg | decimal(8,2) | NO | 부피 무게 (계산값) |
| is_prohibited | boolean | YES | 금지품목 여부 |
| reject_reason | text | NO | 반려 사유 (금지품목 등) |
| scan_method | enum(barcode_scan,manual_input,manual_search) | NO | 수령 시 식별 방법 |
| received_by | uuid | NO | FK → User (물류센터) |
| received_at | timestamp | NO | 수령일시 |
| inspected_by | uuid | NO | FK → User (QA) |
| inspected_at | timestamp | NO | 측정/검수 완료일시 |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
waiting → received → inspecting → measured
                                ↘ rejected(금지품목)
```

### Indexes

- order_id: 주문별 입고 목록
- status: 상태별 필터
- received_at: 날짜 정렬

## InboundPhoto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| inbound_item_id | uuid | YES | FK → InboundItem |
| file_url | varchar(500) | YES | 사진 파일 경로 |
| photo_type | enum(exterior,detail,damage) | YES | 사진 유형 |
| created_at | timestamp | YES | 촬영일시 |

### Relationships

- InboundItem belongs to Order (N:1)
- InboundItem belongs to OrderItem (N:1)
- InboundItem has many InboundPhoto (1:N)
