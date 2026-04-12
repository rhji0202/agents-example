# Notification Model

## Notification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User (수신자) |
| event_type | varchar(50) | YES | 이벤트 유형 (order_submitted, payment_requested 등) |
| channel | enum(email,sms) | YES | 발송 채널 |
| status | enum(created,sent,failed,retrying,read) | YES | 발송 상태 |
| title | varchar(200) | YES | 알림 제목 |
| content | text | YES | 알림 내용 |
| reference_type | varchar(50) | NO | 관련 엔티티 (order, shipment 등) |
| reference_id | uuid | NO | 관련 엔티티 ID |
| retry_count | int | YES | 재시도 횟수 |
| sent_at | timestamp | NO | 발송일시 |
| read_at | timestamp | NO | 읽음일시 |
| created_at | timestamp | YES | 생성일시 |

### Status

```
created → sent → read
              ↘ failed → retrying → sent
```

### Indexes

- user_id + status: 사용자 알림 목록
- event_type: 이벤트별 조회
- reference_type + reference_id: 관련 엔티티별 조회

## Escalation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| reference_type | varchar(50) | YES | 대상 엔티티 (order, shipment 등) |
| reference_id | uuid | YES | 대상 엔티티 ID |
| level | int | YES | 에스컬레이션 단계 (1~4) |
| assignee_id | uuid | YES | FK → User (담당자) |
| status | enum(open,acknowledged,resolved) | YES | 처리 상태 |
| escalated_at | timestamp | YES | 에스컬레이션 발생일시 |
| resolved_at | timestamp | NO | 해결일시 |
| created_at | timestamp | YES | 생성일시 |

### Indexes

- reference_type + reference_id: 대상별 조회
- level + status: 단계별 미처리 목록
- assignee_id + status: 담당자별 목록

### Relationships

- Notification belongs to User (N:1)
- Escalation belongs to User (N:1, assignee)
