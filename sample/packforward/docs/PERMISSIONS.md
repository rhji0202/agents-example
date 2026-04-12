# Permissions

## Role × Action Matrix

### auth
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 회원가입/로그인 | O | O | O |
| 내 창고주소 조회 | O (본인) | X | O (전체) |
| 통관부호 등록/수정 | O (본인) | X | O (전체) |

### inbound
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 입고 예정 등록 | O (본인) | X | O |
| 입고 처리 (검수/측정) | X | O | O |
| 내 입고 목록 조회 | O (본인) | X | O (전체) |
| 입고 상세 (사진/무게) | O (본인) | O (전체) | O (전체) |

### consolidation
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 합배송 묶음 생성 | O (본인) | X | O |
| 묶음 상품 추가/제거 | O (본인, 결제 전) | X | O |
| 재포장 옵션 선택 | O (본인) | X | O |
| 포장 처리 | X | O | O |

### shipping
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 배송 신청 | O (본인) | X | O |
| 배송사/방법 선택 | O (본인) | X | O |
| 운송장 생성 | X | O | O |
| 발송 처리 | X | O | O |

### payment
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 배송비 조회 | O (본인) | X | O |
| 결제 | O (본인) | X | X |
| 환불 처리 | X | X | O |
| 배송비 정책 변경 | X | X | O |

### tracking
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 내 배송 추적 | O (본인) | X | O (전체) |
| 전체 배송 현황 | X | O | O |

### system
| Action | user | warehouse_staff | admin |
|--------|----------|----------------|-------|
| 사용자 관리 | X | X | O |
| 보관료 정책 설정 | X | X | O |
| 정산 관리 | X | X | O |
