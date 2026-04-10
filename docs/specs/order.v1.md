# 대행신청 (Order) Specification v1

> **Status**: draft
> **Author**: 기획팀
> **Created**: 2026-04-10
> **Spec ID**: order
> **Version**: 1

## 1. Overview (개요)

HubNext 플랫폼의 대행신청(배송대행/구매대행) 서비스 기능 스펙. 사용자가 해외 상품을 구매·배송 대행 신청할 수 있는 One-Page 신청서 시스템을 정의한다.

배송대행과 구매대행은 동일한 신청서 구조를 공유하며, 신청유형(접근 경로)으로만 구분된다. LCL/쿠팡입고/재고신청은 별도 스펙으로 분리한다.

## 2. Problem Statement (문제 정의)

- **Current State**: 현재 대행신청 프로세스가 체계화되지 않아 수동 처리에 의존
- **Pain Points**:
  - 물류센터/운송방식/수입방식 선택이 직관적이지 않음
  - 통관유형 자동 판단 로직이 없어 사용자 실수 빈발
  - 상품정보 입력이 번거롭고 재사용이 어려움
  - 화물보험 가입 프로세스가 복잡
- **Impact**: 모든 배송대행/구매대행 이용 고객에게 영향. 잘못된 통관 정보 입력 시 세관 지연 및 비용 증가

## 3. Requirements (요구사항)

### 3.1 Functional Requirements (기능 요구사항)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | 배송대행 신청 페이지 접근 | critical | 메인 메뉴에서 배송대행 버튼 클릭 시 신청서 페이지로 이동, 신청유형=배송대행 자동 설정 |
| FR-002 | 구매대행 신청 페이지 접근 | critical | 메인 메뉴에서 구매대행 버튼 클릭 시 동일 신청서 페이지로 이동, 신청유형=구매대행 자동 설정 |
| FR-003 | 물류센터 선택 | critical | 위해/위해-인천1/위해-인천2/일본 중 하나 선택 가능, 라디오 버튼 |
| FR-004 | 운송방식 선택 | critical | 물류센터에 따라 동적 노출 — 위해-인천1,2 → 해운만, 위해/일본 → 항공만 |
| FR-005 | 수입방식 선택 | critical | 개인전자상거래/사업자 중 하나 선택, 통관유형 자동 설정 트리거 |
| FR-006 | 수취인정보 입력 | critical | 수취인명, 영문명, 연락처, 우편번호, 주소, 상세주소 입력 |
| FR-007 | 주소록 불러오기 | high | 저장된 배송지 목록에서 선택하여 자동 입력 |
| FR-008 | 기본배송지 사용 | high | 체크 시 저장된 기본 주소 자동 입력 |
| FR-009 | 개인통관고유부호 입력/조회 | critical | 개인전자상거래 선택 시 노출, 조회 버튼으로 유효성 검증 |
| FR-010 | 사업자등록번호 입력 | critical | 사업자 선택 시 노출, 사업자등록번호 + 마킹번호 입력 |
| FR-011 | 배송 요청사항 입력 | low | 택배함/경비실/직접수령/기타 중 선택, 기타 시 직접 기재 |
| FR-012 | 상품 추가/삭제/복사 | critical | 상품 카드 추가(최대 9999개), 삭제, 복사하기 기능 |
| FR-013 | 통관품목 검색 및 HS코드 자동 입력 | critical | 키워드 검색 팝업 → 선택 시 HS코드 자동 입력 |
| FR-014 | 상품명(영문/중문) 입력 | critical | 영문 필수, 중문 필수, 최대 200자 |
| FR-015 | 상품 옵션정보 입력 | medium | 모델명/재질/규격/사이즈/색상/상품단위 선택적 입력 |
| FR-016 | 상품 단가×수량 및 합계 자동 계산 | critical | 단가 입력 + 수량 입력 → 합계 실시간 자동 계산 |
| FR-017 | 순량(kg) 입력 | critical | 0.1 이상 숫자, kg 단위 |
| FR-018 | 이미지 업로드 | high | 파일선택/드래그앤드롭, 상품당 최대 5개 |
| FR-019 | 이미지 URL 입력 | low | URL 직접 입력으로 이미지 추가 |
| FR-020 | 리뷰이벤트 PDF 업로드 | low | PDF 파일만, 최대 10MB |
| FR-021 | 트래킹번호 멀티 입력 | high | 운송사 선택 + 번호 입력, 최대 5개, 추가/삭제 |
| FR-022 | 트래킹번호 추후 입력 옵션 | medium | 체크 시 트래킹번호 없이 제출 가능, 마이페이지에서 추후 입력 |
| FR-023 | 상품 총계 실시간 표시 | high | 총 수량, 총 금액(CNY), 통관유형 자동 표시 |
| FR-024 | 통관유형 자동 설정 | critical | 개인전자상거래 기본=목록통관, 조건 충족 시 자동 일반통관 변경 + 사용자 알림 |
| FR-025 | 검수사항 선택 | critical | 정밀검수(유료)/기본검수(무료)/검수안함/전기전자검수(₩3,000) 중 택 1 |
| FR-026 | 부가서비스 선택 | high | 빠른출고/맞춤서비스/표준SOP 중 택 1 |
| FR-027 | 부가서비스 상세옵션 | high | 빠른출고/맞춤서비스 선택 시 포장/제거/통관/기타/물류요청 상세옵션 노출, 다중 선택 |
| FR-028 | 화물보험 필수 가입 | critical | 가입하기&내용확인 체크 필수, 레이어팝업으로 상세 확인 후 자동 체크 |
| FR-029 | 화물보험 레이어팝업 | critical | 요약/보상내용/지급금액/보험기간/보험료/상세소개/약관동의 표시 |
| FR-030 | 예치금 자동결제 옵션 | critical | 자동결제처리/미처리 중 택 1 |
| FR-031 | 약관 동의 | critical | 필수 4개(서비스/개인정보/화물보험/안전거래) + 선택 1개(마케팅), 전체동의 체크 시 필수 약관 모두 체크 |
| FR-032 | 임시저장 | high | 입력 중 임시 저장, 저장 일시 표시 |
| FR-033 | 접수 신청 | critical | 필수 항목 검증 후 확인 팝업 → 접수 완료 |
| FR-034 | 재고 불러오기 | high | 배송대행만, 재고 목록에서 상품 선택 + 수량 입력 → 상품정보 자동 입력 |
| FR-035 | 기존 상품정보 불러오기 | medium | 최근 주문 상품/저장된 프로필에서 선택 → 상품정보 자동 입력 |
| FR-036 | 주문정보 복사 | low | 기존 주문 정보를 현재 신청서에 복사 |
| FR-037 | 고객사서함 저장 | high | 접수 완료 시 고객사서함에 자동 저장, 마이페이지에서 조회 |
| FR-038 | 물류센터-운송방식 연동 | critical | 위해-인천1,2 선택 → 해운만 노출, 위해/일본 선택 → 항공만 노출 |
| FR-039 | 수입방식-통관유형 연동 | critical | 개인전자상거래 → 목록통관(기본), 사업자 → 일반통관(고정) |
| FR-040 | 자체관리코드 입력 | low | 선택적 입력 필드 |
| FR-041 | 오픈마켓 주문번호 입력 | low | 선택적 입력 필드 |
| FR-042 | 상품URL 입력 | medium | 상품 페이지 URL 입력 |

### 3.2 Non-Functional Requirements (비기능 요구사항)

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | 신청서 페이지 초기 로딩 | < 2.5s (LCP) |
| NFR-002 | Performance | 상품 추가/삭제 응답 | < 200ms (INP) |
| NFR-003 | Performance | 통관품목 검색 응답 | < 1s |
| NFR-004 | Performance | 이미지 업로드 처리 | < 3s (5MB 기준) |
| NFR-005 | Security | 개인통관번호/사업자등록번호 암호화 저장 | AES-256 이상 |
| NFR-006 | Security | 파일 업로드 바이러스 스캔 | 업로드 시 필수 |
| NFR-007 | Security | CSRF 토큰 | 모든 state-changing 요청 |
| NFR-008 | Security | XSS 방어 | 모든 사용자 입력 sanitize |
| NFR-009 | Security | HTTPS | 전체 서비스 필수 |
| NFR-010 | Availability | 서비스 가용성 | 99.5% uptime |
| NFR-011 | Compatibility | 브라우저 지원 | Chrome/Safari/Firefox 최신 2버전 |
| NFR-012 | Compatibility | 모바일 반응형 | 320px ~ 1920px 대응 |
| NFR-013 | Storage | 임시저장 보관 | TBD - needs clarification (30일 권장) |
| NFR-014 | Storage | 이미지 파일 크기 제한 | 5MB/파일 |
| NFR-015 | Storage | PDF 파일 크기 제한 | 10MB |
| NFR-016 | Compliance | 개인정보보호법 준수 | 수집 동의 필수 |
| NFR-017 | Compliance | 통관 규정 준수 | 세관청 규정 |
| NFR-018 | Usability | 실시간 자동 계산 | 금액/통관유형 즉시 반영 |

## 4. User Stories (사용자 스토리)

### US-001: 배송대행 신청
- **As a** 개인 사용자
- **I want** 해외에서 구매한 상품의 배송대행을 신청하고 싶다
- **So that** 중국/일본에서 구매한 상품을 한국 주소로 받을 수 있다
- **Acceptance Criteria**:
  - [ ] 메인 메뉴에서 배송대행 버튼 클릭 시 신청서 페이지 이동
  - [ ] 신청유형이 '배송대행'으로 자동 설정
  - [ ] 모든 필수 항목 입력 후 접수 가능
- **Related**: FR-001, FR-003, FR-004, FR-005, FR-006, FR-033

### US-002: 구매대행 신청
- **As a** 개인/사업자 사용자
- **I want** 해외 상품 구매대행을 신청하고 싶다
- **So that** 직접 구매가 어려운 해외 상품을 대행 구매할 수 있다
- **Acceptance Criteria**:
  - [ ] 메인 메뉴에서 구매대행 버튼 클릭 시 신청서 페이지 이동
  - [ ] 신청유형이 '구매대행'으로 자동 설정
  - [ ] 재고불러오기 버튼이 숨겨짐 (구매대행에서는 미노출)
- **Related**: FR-002, FR-034

### US-003: 물류센터/운송방식/수입방식 선택
- **As a** 신청자
- **I want** 물류센터와 운송방식을 선택하고 싶다
- **So that** 배송 경로와 소요 기간을 결정할 수 있다
- **Acceptance Criteria**:
  - [ ] 물류센터 4개 옵션 라디오 버튼 표시
  - [ ] 물류센터 선택에 따라 운송방식 옵션 동적 필터링
  - [ ] 수입방식 선택 시 통관유형 자동 설정
- **Related**: FR-003, FR-004, FR-005, FR-038, FR-039

### US-004: 수취인정보 입력
- **As a** 신청자
- **I want** 배송받을 수취인 정보를 입력하고 싶다
- **So that** 정확한 주소로 상품을 수령할 수 있다
- **Acceptance Criteria**:
  - [ ] 주소록에서 불러오기 가능
  - [ ] 기본배송지 체크 시 자동 입력
  - [ ] 개인통관 선택 → 개인통관고유부호 + 조회 버튼 노출
  - [ ] 사업자통관 선택 → 사업자등록번호 + 마킹번호 노출
  - [ ] 도로명 주소 입력 (지번 불가 안내)
  - [ ] 배송 요청사항 선택/직접 기재 가능
- **Related**: FR-006, FR-007, FR-008, FR-009, FR-010, FR-011

### US-005: 상품정보 입력
- **As a** 신청자
- **I want** 배송할 상품 정보를 입력하고 싶다
- **So that** 통관에 필요한 정확한 상품 정보를 제출할 수 있다
- **Acceptance Criteria**:
  - [ ] 상품 추가/삭제/복사 가능
  - [ ] 통관품목 검색 → HS코드 자동 입력
  - [ ] 상품명(영문/중문), 옵션정보, 단가×수량 입력
  - [ ] 단가×수량 → 합계 실시간 계산
  - [ ] 순량(kg) 입력 (0.1 이상)
  - [ ] 이미지 업로드(드래그앤드롭, 최대 5개) 및 URL 입력
  - [ ] 리뷰이벤트 PDF 업로드 (PDF만, 10MB)
  - [ ] 트래킹번호 멀티 입력(최대 5개, 추후 입력 옵션)
  - [ ] 자체관리코드, 오픈마켓 주문번호, 상품URL 입력
  - [ ] 총계(수량/금액/통관유형) 실시간 갱신
- **Related**: FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-040, FR-041, FR-042

### US-006: 통관유형 자동 변경
- **As a** 개인전자상거래 신청자
- **I want** 통관유형이 상품 조건에 따라 자동 설정되길 원한다
- **So that** 통관 오류 없이 정확한 유형으로 신청할 수 있다
- **Acceptance Criteria**:
  - [ ] 기본값: 목록통관
  - [ ] 식품 HS코드 OR 총금액 기준 초과 OR 단가 기준 초과 → 자동 일반통관 변경
  - [ ] 변경 시 사용자에게 알림 표시
  - [ ] 상품 정보 변경 시 실시간 재계산
- **Related**: FR-024, FR-039

### US-007: 요청사항 및 부가서비스 선택
- **As a** 신청자
- **I want** 검수사항과 부가서비스를 선택하고 싶다
- **So that** 원하는 수준의 검수와 포장 서비스를 받을 수 있다
- **Acceptance Criteria**:
  - [ ] 검수사항 4개 중 1개 필수 선택
  - [ ] 부가서비스 3개 중 택 1
  - [ ] 부가서비스 선택 시 상세옵션 패널 노출
  - [ ] 포장/제거/통관/기타 옵션 다중 선택 가능
  - [ ] 물류요청사항 직접 입력 가능
- **Related**: FR-025, FR-026, FR-027

### US-008: 화물보험 가입
- **As a** 신청자
- **I want** 화물보험에 가입하고 싶다
- **So that** 배송 중 파손/분실 시 보상받을 수 있다
- **Acceptance Criteria**:
  - [ ] 가입하기&내용확인 체크 필수
  - [ ] 클릭 시 레이어팝업 노출 (보험 상세)
  - [ ] 팝업 내 약관 동의 후 확인 → 자동 체크
  - [ ] 보험료 자동 표시 (API 리턴값)
- **Related**: FR-028, FR-029

### US-009: 임시저장
- **As a** 신청자
- **I want** 작성 중인 신청서를 임시 저장하고 싶다
- **So that** 나중에 이어서 작성할 수 있다
- **Acceptance Criteria**:
  - [ ] 임시저장 버튼 클릭 시 현재 입력 상태 저장
  - [ ] 저장 완료 팝업(저장 일시 표시)
  - [ ] 마이페이지에서 임시저장본 조회/이어쓰기 가능
- **Related**: FR-032

### US-010: 결제 및 약관 동의
- **As a** 신청자
- **I want** 결제 방식을 선택하고 약관에 동의하고 싶다
- **So that** 신청서를 최종 접수할 수 있다
- **Acceptance Criteria**:
  - [ ] 예치금 자동결제/미처리 중 택 1
  - [ ] 필수 약관 4개 + 선택 약관 1개 개별 동의
  - [ ] 전체약관동의 체크 시 필수 약관 모두 자동 체크
  - [ ] 모든 필수 약관 동의 시에만 접수 가능
- **Related**: FR-030, FR-031

### US-011: 접수 신청
- **As a** 신청자
- **I want** 완성된 신청서를 접수하고 싶다
- **So that** 대행 서비스가 시작된다
- **Acceptance Criteria**:
  - [ ] 필수 항목 미입력 시 에러 표시 및 해당 필드로 스크롤
  - [ ] 확인 팝업에서 주요 정보 요약 표시
  - [ ] 접수 완료 시 고객사서함에 자동 저장
  - [ ] 접수 완료 후 확인 페이지/알림
- **Related**: FR-033, FR-037

### US-012: 상품정보 재사용
- **As a** 반복 신청자
- **I want** 이전에 입력한 상품정보를 불러오고 싶다
- **So that** 매번 동일한 정보를 다시 입력하지 않아도 된다
- **Acceptance Criteria**:
  - [ ] 재고 불러오기 팝업에서 상품 선택 + 수량 입력 (배송대행만)
  - [ ] 기존 상품정보 불러오기 (최근 주문/저장된 프로필)
  - [ ] 주문정보 복사로 기존 신청서 정보 재사용
  - [ ] 불러온 정보가 상품 입력 필드에 자동 반영
- **Related**: FR-034, FR-035, FR-036

## 5. Data Model (데이터 모델)

### Application (신청서)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, pattern: `FD{YYYYMMDD}{seq}` or `PA{YYYYMMDD}{seq}` | 배송대행=FD, 구매대행=PA |
| mailbox_id | string | FK, NOT NULL | 회원 사서함번호 |
| order_type | enum | NOT NULL, `shipping` or `purchasing` | 신청유형 |
| warehouse_code | enum | NOT NULL, `WH001`/`WH002`/`WH003`/`WH004` | 물류센터 |
| transport_method | enum | NOT NULL, `SEA`/`AIR` | 운송방식 |
| import_method | enum | NOT NULL, `PCE`/`BS` | 수입방식 |
| customs_type | enum | NOT NULL, `list`/`general` | 통관유형 (자동 설정) |
| status | enum | NOT NULL, default `draft` | draft/saved/submitted/approved/rejected |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | timestamp | NOT NULL | 수정일시 |
| submitted_at | timestamp | NULLABLE | 접수일시 |

### Recipient (수취인)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL, UNIQUE | 신청서 1:1 |
| name_ko | string | NOT NULL, max 50 | 수취인명 (한글) |
| name_en | string | NULLABLE, max 100 | 수취인명 (영문) |
| phone | string | NOT NULL, pattern: `01X-XXXX-XXXX` | 연락처 |
| customs_type | enum | NOT NULL, `personal`/`business` | 통관유형 |
| personal_customs_code | string | NULLABLE, encrypted | 개인통관고유부호 |
| business_reg_number | string | NULLABLE, encrypted | 사업자등록번호 |
| marking_number | string | NULLABLE | 마킹번호 |
| postal_code | string | NOT NULL, 5 digits | 우편번호 |
| address | string | NOT NULL, max 200 | 도로명 주소 |
| address_detail | string | NOT NULL, max 200 | 상세주소 |
| delivery_request | enum | NULLABLE | 택배함/경비실/직접수령/기타 |
| delivery_note | string | NULLABLE, max 200 | 배송 요청사항 직접 기재 |

### Product (상품)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL | |
| seq | integer | NOT NULL | 상품 순번 |
| hs_code | string | NOT NULL | HS코드 |
| name_en | string | NOT NULL, max 200 | 상품명 (영문) |
| name_cn | string | NOT NULL, max 200 | 상품명 (중문) |
| model_name | string | NULLABLE | 모델명 |
| material | string | NULLABLE | 재질 |
| spec | string | NULLABLE | 규격 |
| size | string | NULLABLE | 사이즈 |
| color | string | NULLABLE | 옵션 색상 |
| unit | string | NULLABLE | 상품 단위 |
| unit_price | decimal | NOT NULL, > 0 | 단가 (CNY) |
| quantity | integer | NOT NULL, > 0 | 수량 |
| net_weight | decimal | NOT NULL, >= 0.1 | 순량 (kg) |
| internal_code | string | NULLABLE | 자체관리코드 |
| marketplace_order_no | string | NULLABLE | 오픈마켓 주문번호 |
| product_url | string | NULLABLE | 상품 URL |
| review_pdf_url | string | NULLABLE | 리뷰이벤트 PDF |

### ProductImage (상품 이미지)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| product_id | UUID | FK, NOT NULL | |
| type | enum | NOT NULL, `upload`/`url` | 업로드 or URL |
| url | string | NOT NULL | 이미지 URL |
| sort_order | integer | NOT NULL | 정렬순서 |

Constraint: 상품당 최대 5개

### TrackingNumber (트래킹번호)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| product_id | UUID | FK, NOT NULL | |
| carrier | string | NOT NULL | 운송사 |
| tracking_no | string | NULLABLE | 트래킹번호 |
| deferred | boolean | NOT NULL, default false | 추후 입력 여부 |

Constraint: 상품당 최대 5개

### ServiceRequest (요청사항)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL, UNIQUE | |
| inspection_type | enum | NOT NULL | 정밀/기본/안함/전기전자 |
| service_type | enum | NULLABLE | 빠른출고/맞춤/표준SOP |
| packaging_options | jsonb | NULLABLE | 선택한 포장 옵션 배열 |
| removal_options | jsonb | NULLABLE | 선택한 제거 옵션 배열 |
| customs_options | jsonb | NULLABLE | 선택한 통관 옵션 배열 |
| etc_options | jsonb | NULLABLE | 선택한 기타 옵션 배열 |
| logistics_note | string | NULLABLE, max 500 | 물류요청사항 |

### Insurance (화물보험)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL, UNIQUE | |
| agreed | boolean | NOT NULL | 가입 동의 |
| premium | decimal | NULLABLE | 보험료 (KRW, API 리턴값) |
| terms_agreed | boolean | NOT NULL | 약관 동의 |

### Payment (결제)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL, UNIQUE | |
| auto_deposit | boolean | NOT NULL | 예치금 자동결제 여부 |

### TermsAgreement (약관동의)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| application_id | string | FK, NOT NULL, UNIQUE | |
| service_terms | boolean | NOT NULL | 서비스 이용약관 (필수) |
| privacy_terms | boolean | NOT NULL | 개인정보 수집 (필수) |
| insurance_terms | boolean | NOT NULL | 화물보험 약관 (필수) |
| safe_trade_terms | boolean | NOT NULL | 안전거래 약관 (필수) |
| marketing_terms | boolean | NOT NULL, default false | 마케팅 동의 (선택) |

### Relationships

- Application 1:1 Recipient
- Application 1:N Product (max 9999)
- Application 1:1 ServiceRequest
- Application 1:1 Insurance
- Application 1:1 Payment
- Application 1:1 TermsAgreement
- Product 1:N ProductImage (max 5)
- Product 1:N TrackingNumber (max 5)

## 6. API Contracts (API 계약)

### POST /api/v1/orders

신청서 접수

**Request:**
```json
{
  "order_type": "shipping",
  "warehouse_code": "WH001",
  "transport_method": "AIR",
  "import_method": "PCE",
  "recipient": { ... },
  "products": [ ... ],
  "service_request": { ... },
  "insurance": { "agreed": true, "terms_agreed": true },
  "payment": { "auto_deposit": true },
  "terms": { ... }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "FD202604100001",
    "status": "submitted",
    "customs_type": "list",
    "total_quantity": 1,
    "total_amount": 17999,
    "insurance_premium": 5000,
    "submitted_at": "2026-04-10T12:00:00Z"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 400 | 필수 항목 누락 / 유효성 검증 실패 |
| 401 | 미인증 |
| 422 | 비즈니스 규칙 위반 (예: 사업자 아닌 사용자의 LCL 접근) |

### POST /api/v1/orders/draft

임시저장

### GET /api/v1/orders/drafts

임시저장 목록 조회

### GET /api/v1/customs/search?q={keyword}

통관품목 검색

### GET /api/v1/insurance/premium?amount={totalAmount}

보험료 조회 (API 리턴값)

### GET /api/v1/addresses

주소록 목록 조회

### GET /api/v1/inventory

재고 목록 조회

### GET /api/v1/products/recent

기존 상품정보 조회

## 7. UI/UX Requirements (UI/UX 요구사항)

### Layout
- **One-Page 스크롤 방식**: 모든 입력 항목이 하나의 페이지에 표시
- **그룹 분리**: 물류/수취인/상품/요청사항/보험/결제/약관 구역별 분리
- **상단 고정**: 뒤로 버튼 + 제목 + 임시저장 버튼

### Screens
1. **메인 메뉴**: 5개 접근 버튼 (배송/구매/LCL/쿠팡/재고)
2. **신청서 작성**: One-Page (6개 섹션)
3. **접수 확인 팝업**: 주요 정보 요약

### Popups/Layers
1. 화물보험 레이어팝업 (요약/보상/보험료/약관)
2. 주소록 불러오기
3. 통관품목 검색
4. 재고 불러오기 (이미지 포함, 수량 선택)
5. 기존 상품정보 불러오기 (이미지 포함)
6. 트래킹번호 멀티 입력
7. 리뷰이벤트 PDF 업로드
8. 임시저장 완료 확인
9. 접수신청 확인

### Key Interactions
- 물류센터 선택 → 운송방식 옵션 동적 필터링
- 수입방식 선택 → 통관유형 자동 설정
- 상품정보 변경 → 총계/통관유형 실시간 재계산
- 화물보험 팝업 확인 → 체크박스 자동 체크
- 전체약관동의 → 개별 약관 모두 체크

## 8. Dependencies (의존성)

| Dependency | Type | Status |
|------------|------|--------|
| 회원 인증 시스템 | Internal | TBD - needs clarification |
| 통관품목 DB (HS코드) | Internal | Available |
| 화물보험 보험료 API | External | TBD - API 스펙 필요 |
| 주소 검색 API (도로명) | External | Available (우체국 등) |
| 개인통관고유부호 조회 API | External | Available (관세청) |
| 재고 관리 시스템 | Internal | TBD |
| 고객사서함 시스템 | Internal | TBD |
| 파일 저장소 (S3 등) | Infrastructure | TBD |

## 9. Constraints & Assumptions (제약사항 및 가정)

### Constraints
- 배송대행/구매대행만 이 스펙 범위. LCL/쿠팡입고/재고신청은 별도 스펙
- 상품 최대 9999개, 이미지 상품당 최대 5개, 트래킹번호 최대 5개
- PDF 파일만 10MB 제한, 이미지 5MB 제한
- 도로명 주소만 허용 (지번 불가)
- 화물보험 필수 가입 (선택 불가)

### Assumptions
- 사용자는 로그인된 회원 (사서함번호 보유)
- 통관유형 자동변경 금액 기준: TBD - 기획서에 $150 vs ¥1,000 혼용, 확인 필요
- 보험료는 외부 API에서 실시간 조회
- 물류센터별 운송방식 매핑은 하드코딩 가능 (4개 센터 고정)

## 10. Glossary (용어집)

| Term | Definition |
|------|------------|
| 배송대행 | 해외에서 구매한 상품의 국내 배송을 대행하는 서비스 |
| 구매대행 | 해외 상품의 구매와 배송을 모두 대행하는 서비스 |
| 목록통관 | 150달러 이하 개인 물품에 대한 간소화된 통관 절차 |
| 일반통관 | 세관 신고가 필요한 일반적인 통관 절차 |
| HS코드 | 국제통일상품분류체계(Harmonized System) 코드 |
| 개인통관고유부호 | 관세청에서 발급하는 개인 통관용 고유 식별번호 |
| 사서함번호 | HubNext 회원 고유 식별번호 |
| 순량 | 포장 제외 상품의 순수 중량 (kg) |
| LCL | Less than Container Load, 혼적 화물 |
| FCL | Full Container Load, 전체 컨테이너 화물 |
| 마킹번호 | 사업자 통관 시 화물에 부착하는 식별 번호 |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-04-10 | Initial spec — 기획서 대행신청.md (v11.0.0) 기반 생성 |
