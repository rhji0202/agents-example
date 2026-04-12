# Return Brief

## Summary

배송 완료 후 상품에 문제가 있을 때 고객이 리턴을 신청하고, CS/QA가 검토·처리한 뒤 환불한다.

## Flow

1. 고객이 배송 완료 후 14일 이내 리턴 신청
2. 문제 사진/동영상 + 설명 첨부 필수
3. CS팀이 신청 검토 → 승인/반려
4. 승인 시 리턴 방법 안내 (택배 수거, 직접 반품, 지정 장소)
5. 물류센터에서 리턴 상품 수령
6. QA팀이 상품 확인 → 정상/이상 판별
7. 정상 → 환불 처리
8. 이상 → 추가 조사 → 과실 주체 판별
9. 고객 과실 → 부분 환불/보상
10. 배송사 과실 → 전액 환불 + 보상
11. 재무팀이 환불 실행 → 처리 완료

## Business Rules

- 리턴 신청 기한: 배송 완료 후 14일 이내
- 증빙 필수: 사진 최소 1장 + 설명
- 승인 기준: 명백한 하자, 오배송, 파손
- 리턴 수령 후 3영업일 내 환불/교환 처리
- 보상 금액은 과실 주체에 따라 차등
- 환불은 원 결제 수단으로 (예치금 결제 → 예치금 환불)

## Status

```
requested → reviewing → approved → returning → received → inspecting
                      ↘ rejected                        ↘ refunded → closed
                                                        ↘ investigating → partial_refund → closed
                                                                       ↘ full_refund → closed
```

## Screens

| Screen | Path | Key Features |
|--------|------|-------------|
| 리턴 신청 (고객) | /mypage/orders/:id/return | 사유 선택, 사진/동영상 첨부, 설명 입력 |
| 리턴 현황 (고객) | /mypage/orders/:id | 리턴 진행 상태, 환불 금액 |
| 리턴 관리 | /admin/returns | 상태 필터, 신청일 정렬, 긴급 우선 |
| 리턴 검토 | /admin/returns/:id | 증빙 확인, 승인/반려, 반려 사유 |
| 리턴 검수 | /admin/returns/:id/inspect | 상품 확인, 과실 판별, 환불 금액 결정 |

## Out of Scope

- 교환 처리 (동일 상품 재배송) — v2
- 자동 환불 (PG사 API 연동) — v2
