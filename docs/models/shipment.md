# Shipment Model

## Shipment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| status | enum(packing,packed,shipped,in_transit,delivered,confirmed,closed,error,reshipping,stored,returned) | YES | 배송 상태 |
| carrier | varchar(50) | NO | 택배사명 |
| tracking_number | varchar(100) | NO | 한국행 운송장번호 |
| customs_doc_url | varchar(500) | NO | 통관 서류 파일 |
| packed_by | uuid | NO | FK → User (물류팀) |
| packed_at | timestamp | NO | 포장 완료일시 |
| shipped_at | timestamp | NO | 출고일시 |
| delivered_at | timestamp | NO | 배송 완료일시 |
| confirmed_by | uuid | NO | FK → User (CS) |
| confirmed_at | timestamp | NO | CS 확인일시 |
| estimated_arrival | date | NO | 예상 도착일 |
| created_at | timestamp | YES | 생성일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
packing → packed → shipped → in_transit → delivered → confirmed → closed
                                        ↘ error → reshipping → in_transit
                                                ↘ stored(7일) → returned
```

### Indexes

- order_id: 주문별 배송
- tracking_number: 운송장번호 조회
- status: 상태별 필터
- shipped_at: 출고일 정렬

## ShipmentError

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| shipment_id | uuid | YES | FK → Shipment |
| error_type | enum(wrong_address,absent,refused,damaged,other) | YES | 오류 유형 |
| description | text | YES | 오류 상세 |
| resolution | enum(reship,store,return) | NO | 처리 방법 |
| cost_bearer | enum(customer,company,carrier) | NO | 비용 부담 주체 |
| resolved_by | uuid | NO | FK → User (CS) |
| resolved_at | timestamp | NO | 처리일시 |
| created_at | timestamp | YES | 발생일시 |

### Relationships

- Shipment belongs to Order (N:1)
- Shipment has many ShipmentError (1:N)

## Review

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| user_id | uuid | YES | FK → User |
| rating | int | YES | 별점 (1~5) |
| content | text | NO | 후기 내용 |
| created_at | timestamp | YES | 작성일시 |

### Relationships

- Review belongs to Order (1:1)
- Review belongs to User (N:1)
