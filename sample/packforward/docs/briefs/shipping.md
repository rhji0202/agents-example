# Shipping Brief

## Summary
결제 완료된 합배송 묶음을 한국으로 발송하고 운송장을 생성한다.

## Flow
1. 결제 완료 → 배송 신청 자동 생성 (pending)
2. 소비자가 배송사 선택 (UPS/FedEx/EMS)
3. 수취인 정보 확인 (이름, 연락처, 한국 주소, 통관부호)
4. 신고가 입력 (건당 150 USD 이하 권장)
5. 창고 직원이 운송장 생성 (배송사 API)
6. 발송 처리 → 추적번호 소비자에게 알림

## Business Rules
- 배송사별 요금 다름 (배송비는 payment에서 계산)
- 수취인 정보는 User의 기본 정보에서 가져옴 (수정 가능)
- 통관부호 미등록 시 배송 신청 불가
- 신고가 150 USD 초과 시 관세 발생 경고 표시
- 운송장 생성은 배송사 API 호출 (UPS/FedEx/EMS 각각)
- 발송 후 취소 불가

## Status
pending → shipped → (tracking 도메인으로 이관)

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|
| 배송 신청 | /shipping/[id] | 배송사 선택, 수취인 정보, 신고가 입력 |
| 내 배송 목록 | /shipping | 상태별 필터, 운송장 번호 |
| [관리자] 발송 처리 | /admin/shipping | 대기 목록, 운송장 생성 버튼, 발송 처리 |

## Out of Scope
- 배송사 자동 추천 (가격/속도 비교) — v2
- 묶음 분할 발송 — v2
- 반품/반송 처리 — v2
