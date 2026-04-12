# Inbound UI

## 입고 목록
- Path: `/inbound`
- Role: user

### Layout
```
[상단 필터 바]
  상태: 전체 | arriving | stored | rejected  (탭 또는 셀렉트)
  정렬: 입고일순(기본) | 보관일수순

[입고 카드 리스트]
  ┌─────────────────────────────┐
  │ [사진 썸네일]  쇼핑몰명      │
  │               예상 품목       │
  │               상태 뱃지       │
  │               보관 D+{N}일    │
  │               입고일 2026-04-10│
  └─────────────────────────────┘

[페이지네이션] 20건씩

[플로팅 버튼] + 입고 예정 등록
```

### States
| State | 표시 |
|-------|------|
| 로딩 | 스켈레톤 카드 3개 |
| 빈 목록 | "아직 입고된 상품이 없습니다" + 창고 주소 안내 링크 |
| 에러 | "목록을 불러올 수 없습니다" + 재시도 버튼 |

### 상태 뱃지 색상
| Status | Color | Label |
|--------|-------|-------|
| arriving | blue | 배송중 |
| received | yellow | 도착 |
| inspected | orange | 검수완료 |
| stored | green | 보관중 |
| rejected | red | 반려 |
| consolidated | gray | 합배송됨 |

---

## 입고 상세
- Path: `/inbound/[id]`
- Role: user

### Layout
```
[뒤로가기]

[상태 뱃지 + 보관일수]

[검수 사진 갤러리]
  좌우 스와이프, 확대 가능, 최소 2장

[정보 테이블]
  | 쇼핑몰    | {shop_name}     |
  | 운송장    | {tracking_number}|
  | 예상 품목  | {description}   |
  | 무게      | {weight_kg} kg  |
  | 크기      | {w}×{h}×{d} cm  |
  | 입고일    | {stored_at}     |
  | 보관일수   | D+{N}일         |

[메모] {memo} (있을 때만 표시)

[하단 버튼]
  stored 상태 → "합배송에 추가" (primary)
  rejected 상태 → "반송 신청" | "폐기 동의"
```

### Conditional
- 사진: inspected 이후에만 표시
- 무게/크기: inspected 이후에만 표시
- "합배송에 추가": stored 상태에서만 활성
- 보관료 경고: 30일 초과 시 "보관료 발생 중 ($1/일)" 빨간 텍스트

---

## 입고 예정 등록
- Path: `/inbound/new`
- Role: user

### Form Fields
| Field | Label | Type | Required | Validation | Placeholder |
|-------|-------|------|----------|------------|-------------|
| shop_name | 쇼핑몰 | text | NO | max 100자 | "Amazon, eBay 등" |
| tracking_number | 운송장 번호 | text | NO | 영숫자+하이픈 | "1Z999AA..." |
| description | 예상 품목 | text | YES | max 200자 | "운동화 1켤레" |
| memo | 메모 | textarea | NO | max 500자 | "취급 주의 등" |

### Actions
| Button | Condition | Action |
|--------|-----------|--------|
| 등록 | description 입력됨 | POST → 목록으로 이동 |
| 취소 | 항상 | 목록으로 이동 (변경사항 있으면 confirm) |

### States
| State | 표시 |
|-------|------|
| 제출 중 | 버튼 disabled + 스피너 |
| 성공 | 토스트 "입고 예정이 등록되었습니다" + 목록 이동 |
| 실패 | 토스트 "등록에 실패했습니다" + 재시도 |

---

## [관리자] 입고 처리
- Path: `/admin/inbound`
- Role: warehouse_staff, admin

### Layout
```
[운송장 입력 바]
  운송장 번호 입력 → 자동 매칭 → 회원 정보 표시

[매칭 결과]
  ┌──────────────────────────┐
  │ 회원: {name} ({warehouse_code}) │
  │ 사전등록: 있음/없음              │
  └──────────────────────────┘

[검수 폼]
  사진 업로드 (최소 2장, 드래그앤드롭)
  무게: {weight_kg} kg (숫자 입력)
  크기: {w} × {h} × {d} cm
  상태: inspected (정상) | rejected (반려)
  반려 사유: (rejected 선택 시만 표시)

[입고 완료 버튼]
```

### 매칭 실패 시
- Suite 번호로 매칭 시도
- 실패 시 "수동 매칭" 모드 → 회원 검색 (이름, 이메일)
- 그래도 매칭 안 되면 "미매칭 큐"에 추가
