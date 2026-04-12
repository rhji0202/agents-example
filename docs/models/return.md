# Return Model

## ReturnRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| order_id | uuid | YES | FK → Order |
| user_id | uuid | YES | FK → User |
| status | enum(requested,reviewing,approved,rejected,returning,received,inspecting,investigating,partial_refund,full_refund,refunded,closed) | YES | 리턴 상태 |
| reason | enum(defect,wrong_item,damaged,other) | YES | 리턴 사유 |
| description | text | YES | 상세 설명 |
| return_method | enum(pickup,drop_off,designated) | NO | 리턴 방법 |
| reject_reason | text | NO | 반려 사유 |
| fault | enum(customer,company,carrier) | NO | 과실 주체 |
| refund_amount | decimal(12,2) | NO | 환불 금액 |
| refund_method | enum(card,bank_transfer,deposit) | NO | 환불 수단 |
| reviewed_by | uuid | NO | FK → User (CS) |
| reviewed_at | timestamp | NO | 검토일시 |
| inspected_by | uuid | NO | FK → User (QA) |
| inspected_at | timestamp | NO | 검수일시 |
| refunded_by | uuid | NO | FK → User (재무) |
| refunded_at | timestamp | NO | 환불일시 |
| created_at | timestamp | YES | 신청일시 |
| updated_at | timestamp | YES | 수정일시 |

### Status

```
requested → reviewing → approved → returning → received → inspecting
                      ↘ rejected                        ↘ refunded → closed
                                                        ↘ investigating → partial_refund → closed
                                                                       ↘ full_refund → closed
```

### Indexes

- order_id: 주문별 리턴
- user_id + status: 내 리턴 목록
- status + created_at: 리턴 관리 목록

## ReturnEvidence

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| return_request_id | uuid | YES | FK → ReturnRequest |
| file_url | varchar(500) | YES | 파일 경로 |
| file_type | enum(photo,video) | YES | 파일 유형 |
| created_at | timestamp | YES | 업로드일시 |

### Relationships

- ReturnRequest belongs to Order (N:1)
- ReturnRequest belongs to User (N:1)
- ReturnRequest has many ReturnEvidence (1:N)
