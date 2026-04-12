# Inbound Model

## Inbound
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | YES | PK |
| user_id | uuid | YES | FK → User |
| consolidation_id | uuid | NO | FK → Consolidation (묶인 후 할당) |
| tracking_number | string | NO | 해외 운송장 번호 |
| shop_name | string | NO | 구매 쇼핑몰 |
| description | string | NO | 예상 품목 설명 |
| memo | text | NO | 소비자 메모 |
| status | enum(arriving,received,inspected,stored,rejected,consolidated) | YES | 상태 |
| weight_kg | decimal | NO | 실중량 (검수 후 입력) |
| width_cm | decimal | NO | 가로 |
| height_cm | decimal | NO | 세로 |
| depth_cm | decimal | NO | 높이 |
| photo_urls | string[] | NO | 검수 사진 URL (최소 2장) |
| inspected_by | uuid | NO | FK → User (검수 직원) |
| inspected_at | timestamp | NO | 검수일시 |
| stored_at | timestamp | NO | 입고 확정일 (보관료 기산점) |
| rejection_reason | string | NO | 거부 사유 (금지품목 등) |
| created_at | timestamp | YES | 생성일 |
| updated_at | timestamp | YES | 수정일 |

### Status
arriving → received → inspected → stored → consolidated
                                 ↘ rejected

- arriving: 소비자가 사전등록 (운송장 입력)
- received: 택배가 창고 도착 (직원 확인)
- inspected: 검수 완료 (사진, 무게 입력)
- stored: 보관 중 (합배송 대기)
- rejected: 금지품목 등으로 거부
- consolidated: 합배송 묶음에 포함됨

### Relationships
- belongs to User (N:1)
- belongs to Consolidation (N:1, nullable)

### Indexes
- user_id: 내 입고 목록
- tracking_number: 운송장 매칭
- status: 상태별 필터링
- stored_at: 보관료 계산
