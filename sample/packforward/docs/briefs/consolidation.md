# Consolidation Brief

## Summary
소비자가 보관 중인 입고 상품을 선택하여 하나의 합배송 묶음으로 만든다.

## Flow
1. 소비자가 stored 상태 입고건 중 원하는 것 선택
2. 합배송 묶음 생성 (draft)
3. 재포장 옵션 선택 (기본포장/재포장/에어캡)
4. 예상 무게 + 배송비 미리보기
5. 묶음 확정 (confirmed)
6. 결제 페이지로 이동

## Business Rules
- 최소 1개, 최대 10개 상품
- 합배송 안 하고 단건 배송도 가능 (1개만 선택)
- draft 상태에서만 상품 추가/제거 가능
- confirmed 이후 묶음 변경 불가
- 재포장 옵션:
  - standard: 원래 포장 그대로 ($0)
  - repack: 불필요한 포장 제거 후 재포장 ($3)
  - bubble_wrap: 에어캡 추가 ($5)
- 예상 배송비 = 포함 상품 무게 합산 기준 (포장 후 변동 가능)
- 결제 완료 후 포장 상품 무게 변경 시 차액은 무시 (재결제 없음)

## Status
draft → confirmed → paid → packing → packed → shipped

## Screens
| Screen | Path | Key Features |
|--------|------|-------------|
| 합배송 신청 | /consolidation/new | 입고건 체크박스, 재포장 옵션 라디오, 예상 비용 |
| 묶음 상세 | /consolidation/[id] | 포함 상품 목록, 상태, 무게, 비용 |
| 묶음 목록 | /consolidation | 상태별 필터, 생성일 정렬 |
| [관리자] 포장 처리 | /admin/consolidation/[id] | 포장 후 실측 무게/크기 입력, 사진 |

## Out of Scope
- 상품 나누기 (한 입고건을 두 묶음으로) — v2
- 사진 촬영 요청 서비스 — v2
- 묶음 간 상품 이동 — v2
