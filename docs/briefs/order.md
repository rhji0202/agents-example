# Order Brief

## Summary

고객이 배송대행을 신청하고, Admin이 검토하여 승인/반려한다. 1건의 주문에 여러 상품을 포함할 수 있다.

## Flow

1. 고객이 주문 생성 (배송지 + 추가 서비스 선택)
2. 주문에 상품 추가 (쇼핑몰명, 상품명, 수량, 운송장번호) — 1건 이상
3. 주문 제출 → 시스템이 자동 접수 + 주문번호 발급
4. Admin이 신청서 검토 (필수 정보, 특이사항)
5. 승인 → 입고 대기 상태로 전환
6. 반려 → 고객에게 사유 안내, 수정 기한 72시간

## Business Rules

- 주문 1건에 상품 최소 1개 이상
- 주문번호는 시스템 자동 발급
- 반려 수정 기한 72시간, 초과 시 자동 취소
- 반려 건은 일반 주문보다 우선 검토
- 접수~검토 목표 24시간 이내
- 반려 후 수정/재제출 방식은 TBD

## Status

```
draft → submitted → reviewing → approved → (inbound 도메인으로)
                              ↘ rejected → resubmitted → reviewing
submitted(72h 초과) → cancelled
rejected(72h 초과) → cancelled
```

## Screens

| Screen | Path | Key Features |
|--------|------|-------------|
| 주문 신청 | /order | 배송지 입력, 상품 추가(N건), 추가 서비스 선택, 제출 |
| 내 주문 목록 | /mypage/orders | 상태 필터, 날짜 정렬, 상세 보기 |
| 주문 상세 | /mypage/orders/:id | 상품 목록, 상태, 반려 사유, 수정/재제출 |
| 주문 관리 | /admin/orders | 전체 주문 목록, 상태 필터, 검토 대기 우선 정렬 |
| 주문 검토 | /admin/orders/:id | 상세 확인, 승인/반려 버튼, 반려 사유 입력 |

## Out of Scope

- 임시저장 (draft 자동 저장) — v2
- 주문 복사 (이전 주문 기반 재신청) — v2
