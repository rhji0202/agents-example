# Tracking Brief

## Summary
발송된 배송의 추적 정보를 배송사 API에서 가져와 소비자에게 보여준다.

## Flow
1. 발송 완료 → 운송장 번호로 배송사 API 폴링 시작
2. 새 추적 이벤트 발생 → TrackingEvent 저장
3. 주요 상태 변경 시 소비자에게 알림
4. 통관 보류 시 별도 알림 (서류 안내)
5. 국내 택배 인수 → 국내 택배사 추적 링크 제공
6. 배송 완료 → 최종 알림

## Business Rules
- 배송사 API 폴링 주기: 6시간 (운송 중), 3시간 (통관 중)
- 배송 완료 후 폴링 중지
- 통관 보류(customs_hold) 시 SMS + 이메일 알림
- 국내 택배사 추적은 직접 구현하지 않고 택배사 추적 페이지 링크
- 추적 이벤트는 삭제하지 않음 (이력 유지)
- 소비자에게 보여주는 상태는 단순화:
  - 발송됨 → 운송중 → 통관중 → 국내배송중 → 배송완료

## Status
(Shipment의 상태를 사용)
shipped → in_transit → in_customs → domestic → delivered
                       ↘ customs_hold

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|
| 배송 추적 | /tracking/[shipment_id] | 타임라인 UI, 현재 상태, 이벤트 목록 |
| [관리자] 전체 배송 현황 | /admin/tracking | 상태별 카운트, 통관보류 건 하이라이트 |

## Out of Scope
- 실시간 위치 지도 — v2
- 배송 예정일 예측 — v2
- 자동 통관 서류 제출 — v2
- 푸시 알림 — v2 (이메일 + SMS만)
