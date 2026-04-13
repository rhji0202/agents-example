# Inbound Brief

## Summary

중국 물류센터에서 주문 상품을 수령하고, 무게/부피 측정 및 품질 검수를 수행한다.

## Flow

1. 주문 승인 후 → 입고 대기 상태 생성
2. 물류센터에서 상품 수령
   a. 중국내 트래킹번호 바코드 스캔 또는 수동 입력
   b. OrderItem.tracking_number 매칭 → InboundItem 식별
   c. 매칭 실패 시 주문번호/상품명으로 수동 검색
   d. 외관 검수, 수량 확인
3. 수령 시 사진 촬영 + 시스템 등록
4. QA팀이 무게/부피 측정 (소수점 2자리)
5. 위험물/금지품목 확인
6. 금지품목 발견 시 → 즉시 반려 처리
7. 측정 완료 → payment 도메인으로 (배송비 계산)

## Business Rules

- OrderItem 단위로 입고 관리 (1 OrderItem = 1 InboundItem)
- 수령 시 외관 사진 최소 1장 필수
- 무게는 소수점 2자리 정확도 (kg)
- 부피는 가로×세로×높이 cm 단위
- 위험물/금지품목 발견 시 즉시 반려, 고객에게 알림
- 검토~수령 목표 48시간 이내 (해외 물류 시간 제외)
- 모바일 카메라로 트래킹번호 바코드 스캔 지원
- 스캔 불가 시 트래킹번호 수동 입력으로 대체
- 스캔/입력된 번호로 OrderItem 매칭, 매칭 실패 시 수동 검색 제공
- tracking_number 없는 OrderItem은 수동 검색만 가능

## Status

```
waiting → received → inspecting → measured
                                ↘ rejected(금지품목)
```

## Screens

| Screen | Path | Key Features |
|--------|------|-------------|
| 입고 현황 (고객) | /mypage/orders/:id | 상품별 입고 상태, 사진 확인 |
| 입고 관리 | /admin/inbound | 입고 대기/수령/측정 필터, 날짜 정렬 |
| 입고 처리 | /admin/inbound/:id | 사진 업로드, 수량 확인, 수령 처리 |
| 측정/검수 | /admin/inbound/:id/inspect | 무게/부피 입력, 위험물 체크, 측정 완료 |
| 모바일 스캔 수령 | /admin/inbound/scan | 카메라 스캔, 수동 입력 전환, 매칭 결과 표시, 바로 수령 처리 |

## Out of Scope

- 자동 무게 측정 연동 (저울 API) — v2
- 자체 QR코드 생성/부착 시스템 — v2
