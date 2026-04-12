# Shipment Brief

## Summary

결제 완료된 주문을 포장·출고하고, 택배사를 통해 한국까지 배송한 뒤 완료를 확인한다.

## Flow

1. 결제 완료 → 출고 대기
2. 물류팀이 포장 작업 (재포장 서비스 포함 시 재포장)
3. 운송장 발행 + 통관 서류 준비
4. 택배사 인수 전달 → 배송 시작
5. 택배사 API 연동 실시간 추적
6. 고객에게 배송 현황 주기적 알림
7. 수취인 전달 완료 → 배송 완료
8. CS팀 완료 확인 → 처리 완료
9. 고객 후기 작성 안내 → 종료
10. 배송 오류 시 → 원인 분석 → 재배송/보관소 안내

## Business Rules

- 결제 완료 후 24시간 이내 출고 목표
- 운송장번호 시스템 등록 필수
- 배송 추적 택배사 API 연동
- 배송 오류 유형: 주소 오류, 수취인 부재, 거부
- 오류 발생 시 영업일 4시간 내 초기 대응
- 수취인 부재 시 재방문 → 실패 시 보관소 7일 보관 후 반송
- 재배송 비용은 오류 원인에 따라 부담 주체 결정
- 배송 기간 3~7일 (국가/지역별 차이)

## Status

```
packing → packed → shipped → in_transit → delivered → confirmed → closed
                                        ↘ error → reshipping → in_transit
                                                ↘ stored(보관소 7일) → returned
```

## Screens

| Screen | Path | Key Features |
|--------|------|-------------|
| 배송 추적 (고객) | /tracking/:orderNumber | 실시간 위치, 상태 타임라인, 예상 도착일 |
| 배송 현황 (마이페이지) | /mypage/orders/:id | 운송장번호, 택배사, 현재 상태 |
| 출고 관리 | /admin/shipments | 출고 대기/배송중/완료 필터, 택배사 필터 |
| 출고 처리 | /admin/shipments/:id | 포장 확인, 운송장 발행, 통관 서류, 출고 처리 |
| 배송 오류 관리 | /admin/shipments/:id/error | 오류 유형, 원인 기록, 재배송/보관소 처리 |
| 후기 작성 (고객) | /review/:orderId | 별점, 텍스트 후기, 사진 첨부 |

## Out of Scope

- 복수 택배사 비교 견적 — v2
- 자동 통관 시스템 연동 — v2
- 부분 출고 (일부 상품만 먼저) — v2
