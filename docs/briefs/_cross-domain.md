# Cross-Domain Rules

## Entity Lifecycle

```
order(approved) → inbound(waiting→measured)
→ payment(pending→paid) → shipment(packing→delivered→confirmed→closed)

예외 분기:
  order(submitted/rejected, 72h 초과) → order(cancelled)
  inbound(inspecting, 금지품목) → inbound(rejected)
  payment(pending, 72h 초과) → payment(cancelled) → order(cancelled)
  shipment(in_transit, 오류) → shipment(error→reshipping/stored)
  shipment(delivered, 14일 내) → return(requested→...→closed)
```

## Shared Business Rules

### 72시간 자동 취소

- **Domains**: order, payment
- **Rule**: 반려 수정 72시간 초과 또는 결제 유효기간 72시간 초과 시 자동 취소
- **On failure**: 주문 cancelled 상태 전환, 고객 알림

### 금지품목 차단

- **Domains**: inbound, order, payment
- **Rule**: 검수 단계에서 금지품목 발견 시 즉시 반려
- **On failure**: 해당 상품 제거, 나머지 상품으로 재계산, 고객/Admin 알림

### 환불 원결제 수단 복귀

- **Domains**: return, payment
- **Rule**: 환불은 원 결제 수단으로 처리 (카드→카드, 예치금→예치금)
- **On failure**: 재무팀이 수동 환불 처리

### 포인트 적립/차감

- **Domains**: auth, payment
- **Rule**: 결제 완료 시 결제 금액 1% 포인트 자동 적립, 환불 시 적립 포인트 차감
- **On failure**: 포인트 적립 실패 시 결제는 유지, 재적립 배치 처리

### 사업자 할인 적용

- **Domains**: auth, payment
- **Rule**: 사업자 CustomerContract.discount_rate를 배송비 계산 시 적용
- **On failure**: 할인율 0%으로 계산, Admin에게 알림

### 에스컬레이션 시간 기준

- **Domains**: all
- **Rule**: 상태별 최대 체류 시간 초과 시 단계적 에스컬레이션 (24h→48h→72h→96h)
- **On failure**: 운영 관리자 직접 개입

## Error Scenarios

| Scenario | Affected Domains | Resolution |
|----------|-----------------|------------|
| 결제 실패 | payment, order | 24h 내 3회 재시도, VIP 유예 가능, 72h 초과 시 취소 |
| 금지품목 발견 | inbound, payment | 해당 상품 반려, 나머지 상품으로 배송비 재계산 |
| 배송 오류 (주소) | shipment, notification | CS가 고객 연락 → 주소 수정 → 재배송 |
| 배송 오류 (부재) | shipment, notification | 재방문 → 실패 시 보관소 7일 → 반송 |
| 리턴 상품 이상 | return, payment | QA 조사 → 과실 판별 → 부분/전액 환불 |
| PG사 장애 | payment | 예치금/계좌이체로 대체, 장애 복구 후 재처리 |

## Notifications

| Event | Source Domain | Recipient | Channel |
|-------|-------------|-----------|---------|
| 사업자 서류 승인/반려 | auth | 고객 | 이메일, SMS |
| 고객 등급 변경 | auth | 고객 | 이메일 |
| 포인트 소멸 예정 (7일 전) | auth | 고객 | 이메일 |
| 휴면 전환 예정 (30일 전) | auth | 고객 | 이메일, SMS |
| 직원 비밀번호 만료 예정 | auth | 직원 | 이메일 |
| 주문 접수/승인/반려 | order | 고객 | 이메일, SMS |
| 상품 수령/측정 완료 | inbound | 고객 | 이메일 |
| 금지품목 발견 | inbound | 고객, Admin | 이메일, SMS |
| 결제 요청/완료/실패 | payment | 고객 | 이메일, SMS |
| 출고/배송/완료/오류 | shipment | 고객, CS | 이메일, SMS |
| 리턴 승인/환불 완료 | return | 고객 | 이메일, SMS |
| 에스컬레이션 | all | 단계별 관리자 | 이메일 |
