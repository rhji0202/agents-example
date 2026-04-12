# Payment Brief

## Summary
합배송 묶음의 배송비를 계산하고 토스페이먼츠로 결제한다.

## Flow
1. 묶음 확정(confirmed) 시 배송비 자동 계산
2. 소비자가 결제 페이지에서 금액 확인
3. 토스페이먼츠 결제창 호출
4. 결제 성공 → paid 상태
5. 결제 실패 → 에러 표시, 재시도 가능

## Business Rules
- 과금중량 = max(실중량, 부피중량)
- 부피중량 = (가로 × 세로 × 높이) / 5000 (cm, kg)
- 배송비 구간:
  - 0~0.5kg: $15
  - 0.5~1kg: $20
  - 1~2kg: $28
  - 2~3kg: $36
  - 3kg 초과: $36 + kg당 $8
- 재포장 수수료: standard $0, repack $3, bubble_wrap $5
- 보관료: 30일 초과분 × $1/일/건
- 총액 = 배송비 + 재포장 수수료 + 보관료
- USD → KRW 환율: 결제 요청 시점 고정
- 결제 수단: 카드만 (v1)
- 환불: 발송 전 전액 환불, 발송 후 환불 불가
- 부분 환불: 금지품목 제외 시 해당 건 보관료만 환불

## Status
pending → paid → (refunded | partial_refund)

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|
| 결제 | /payment/[consolidation_id] | 배송비 내역, 총액, 결제 버튼 |
| 결제 완료 | /payment/[id]/complete | 결제 확인, 배송 신청으로 이동 |
| 결제 내역 | /my/payments | 결제 목록, 상태, 영수증 |
| [관리자] 환불 처리 | /admin/payments/[id] | 환불 사유 입력, 환불 실행 |

## Out of Scope
- 간편결제 (카카오페이, 네이버페이) — v2
- 포인트/쿠폰 — v2
- 정기결제/구독 — v2
- 자동 정산 (관리자 → 창고) — v2
