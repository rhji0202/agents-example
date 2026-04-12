# Cross-Domain Rules

## Entity Lifecycle
```
inbound(arriving→stored) → consolidation(draft→confirmed)
→ payment(pending→paid) → consolidation(packing→packed)
→ shipping(pending→shipped) → tracking(in_transit→delivered)
```

## Shared Business Rules

### Billing Weight
- 실중량: inbound에서 개별 측정, consolidation 포장 후 합산
- 부피중량: consolidation 포장 후 측정 (가로×세로×높이/5000)
- 과금중량 = max(실중량, 부피중량) → payment가 사용
- 포장 전 예상 배송비 ≠ 포장 후 확정 배송비 (차액은 v1에서 무시)

### Storage Fee
- 기산점: inbound.stored_at
- 무료 30일, 이후 $1/일/건
- 보관료는 consolidation 확정 시 payment에 합산
- 미결제 보관료가 있으면 합배송 신청 차단 안 함 (결제에 포함)

### Customs Declaration
- 합배송 묶음 전체의 신고가를 shipping에서 입력
- 건당 150 USD 이하 면세 (초과 시 경고만, 차단 안 함)
- 통관부호(customs_id)는 auth에서 등록, shipping에서 사용

### Prohibited Items
- inbound 검수 시 발견 → rejected 처리
- 이미 consolidation에 포함된 경우:
  - 해당 inbound만 제거
  - consolidation 무게 재계산
  - payment가 이미 paid면 해당 건 보관료만 부분 환불

## Error Scenarios
| Scenario | Affected Domains | Resolution |
|----------|-----------------|------------|
| 결제 실패 | payment, consolidation | 에러 표시, confirmed 상태 유지, 재시도 가능 |
| 배송사 API 장애 | shipping | 운송장 생성 재시도, 관리자에게 알림 |
| 통관 보류 | tracking | 소비자에게 SMS+이메일, 서류 안내 |
| 입고 매칭 실패 | inbound | 관리자 수동 매칭 큐에 추가 |
| 90일 보관 초과 | inbound | 60일에 경고, 90일에 폐기 처리 알림 |

## Notifications
| Event | Source | Recipient | Channel |
|-------|--------|-----------|---------|
| 입고 완료 | inbound | user | email + web |
| 보관 30일 경과 | inbound | user | email |
| 보관 60일 경고 | inbound | user | email |
| 합배송 포장 완료 | consolidation | user | web |
| 결제 요청 | payment | user | email + web |
| 결제 완료 | payment | user | email |
| 발송 완료 | shipping | user | email + web |
| 통관 보류 | tracking | user | email + sms |
| 배송 완료 | tracking | user | email + web |
| 입고 매칭 실패 | inbound | admin | web |
