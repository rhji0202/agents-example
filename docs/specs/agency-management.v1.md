# 대행종합관리 (Agency Management) Specification v1

> **Status**: draft
> **Author**: 기획팀
> **Created**: 2026-04-11
> **Spec ID**: agency-management
> **Version**: 1

## 1. Overview (개요)

HubNext 플랫폼의 관리자 통합 대행 관리 대시보드 스펙. 운영관리자·물류담당자·CS담당자·창고작업자가 한 페이지에서 배송대행/구매대행/특송/LCL/쿠팡/오류/리턴/재고 등 모든 대행 주문을 조회·처리·관리하고, 창고 현장 작업자와의 협업까지 지원하는 통합 관리 화면을 정의한다.

**관련 스펙**:
- `order.v1.md` — Application(주문), Product, Recipient 엔티티 및 사용자 주문 신청 플로우
- `rbac.v1.md` — 역할(role) 코드, 권한 검사 Guard, 프론트엔드 UI 숨김 규칙

**기획서 참조**: 대행종합관리.md v5.1.1

## 2. Problem Statement (문제 정의)

- **Current State**: 대행 주문 관리가 구분별로 분산되어 있고, 주문 상태 변경·담당자 배정·라벨 인쇄 등이 개별 화면에 흩어져 있음. 창고 현장 작업자가 별도 디바이스 없이 스캔 작업을 수행할 수단이 없음
- **Pain Points**:
  - 60여 종의 주문 상태를 8개 구분에 걸쳐 단일 화면에서 파악하기 어려움
  - 다수 주문의 상태를 한 번에 변경하거나 담당자를 배정할 수 없음
  - 현황 카드(주문 수 집계)와 검색 필터가 분리되어 있어 구분→상태→목록 흐름이 끊김
  - 트래킹번호 입력, 실사 이미지 관리, 엑셀 다운로드 등 물류 작업이 분산됨
  - RBAC 역할별로 노출 버튼이 다른데 이를 일관성 있게 제어하는 구조가 없음
- **Impact**: 운영관리자·물류담당자·CS담당자·창고작업자 전원에게 영향. 주문 처리 지연과 오류 발생 빈도를 높임

## 3. Requirements (요구사항)

### 3.1 Functional Requirements (기능 요구사항)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | 8개 구분별 현황 카드 표시 (배송대행/구매대행/특송/LCL/쿠팡/오류/리턴/재고) | critical | 각 카드에 해당 구분의 전체 주문 수가 숫자로 표시됨; 데이터 없음 시 0 표시 |
| FR-002 | 센터 필터 셀렉트 (전체/위해/일본) — 현황 카드 전체 동시 필터링 | critical | 센터 선택 변경 시 8개 카드 수치가 모두 해당 센터 기준으로 즉시 갱신됨 |
| FR-003 | 구분 카드 클릭 시 상태별 드릴다운 (카드 높이 확장 + 상태 목록 노출) | high | 카드 클릭 시 해당 구분의 상태별 주문 수 목록이 카드 아래로 펼쳐짐; 재클릭 시 접힘 |
| FR-004 | 구분 내 상태 클릭 → 검색 필터에 해당 구분+상태 자동 적용 | high | 상태 클릭 시 검색 필터 영역의 구분·상태 값이 자동 설정되고 목록이 즉시 갱신됨 |
| FR-005 | 기본 검색 필터 1줄 (주문번호/사서함번호/운송장번호/트래킹번호) | critical | 검색 버튼 클릭 또는 Enter 시 해당 필드 기준 주문 목록 필터링; 빈 값이면 전체 조회 |
| FR-006 | 검색 필터 확장/접기 (수취인명/상품코드/운송방식/통관구분/담당자/기간검색) | high | '상세검색' 토글 클릭 시 추가 필터 행이 슬라이드 다운; 재클릭 시 접힘 |
| FR-007 | 기간검색 프리셋 버튼 (1일/3일/7일/직접선택) + 날짜 범위 피커 | high | 프리셋 클릭 시 오늘 기준 해당 일수 범위로 날짜 자동 설정; 직접선택 클릭 시 DateRangePicker 열림 |
| FR-008 | 검색 초기화 버튼 | medium | 클릭 시 모든 검색 필터 값이 초기 상태로 리셋되고 전체 목록이 재조회됨 |
| FR-009 | 주문 체크박스 다중 선택 + 헤더 전체 선택 | critical | 헤더 체크박스 클릭 시 현재 페이지 전체 선택/해제; 선택된 주문 수가 액션 버튼 영역에 표시됨 |
| FR-010 | 상태 일괄 변경 (선택 주문 대상) — 팝업 처리 | critical | 1개 이상 선택 후 '상태 변경' 버튼 클릭 시 일괄 변경 팝업 열림; 0건 선택 시 버튼 비활성화 |
| FR-011 | 담당자 일괄 배정 — 팝업으로 처리, 업무량 추천 표시 | high | 1개 이상 선택 후 '담당자 배정' 버튼 클릭 시 배정 팝업 열림; 팝업에서 담당자별 현재 업무량 표시 |
| FR-012 | 엑셀 다운로드 8종 (매니페스트/패킹/인보이스/3PL/제이매니페스트-KR/CN/일본항공/HB매니페스트/HB멀티정보) | high | 드롭다운에서 종류 선택 후 다운로드 클릭 시 해당 형식 xlsx 파일이 브라우저에 다운로드됨 |
| FR-013 | 운송장 대량 등록 | high | '운송장 대량 등록' 버튼 클릭 시 파일 선택 또는 텍스트 입력 방식으로 운송장번호 일괄 등록 가능 |
| FR-014 | 라벨 인쇄 3종 (택배/국제운송장/주소라벨) | high | 선택된 주문에 대해 종류별 라벨 PDF가 새 탭으로 열리거나 인쇄 미리보기 실행됨 |
| FR-015 | 엑셀 업로드 (주문 일괄 업로드) | medium | xlsx/csv 파일 선택 시 서버에서 파싱 결과(성공/오류 건수) 팝업으로 안내 |
| FR-016 | 묶음 출고 처리 | medium | 2개 이상 주문 선택 후 '묶음 출고' 클릭 시 묶음 출고 처리 확인 팝업 표시 후 일괄 처리 |
| FR-017 | 신규 주문 생성 (관리자 직접 생성) | medium | '신규 주문' 버튼 클릭 시 주문 생성 폼 팝업 또는 신규 탭 열림 |
| FR-018 | 대량 메시지 발송 (SMS/앱푸시) | medium | 선택 주문의 수취인에게 SMS 또는 앱푸시 메시지 발송; 발송 전 수신자 목록 확인 팝업 표시 |
| FR-019 | 주문 목록 복합 행 테이블 렌더링 (헤더행+정보행+부가정보 3레이어) | critical | 주문 1건당 체크박스·주문번호·구분·상태·센터·수취인·상품요약·담당자·등록일·처리버튼이 포함된 3줄 구조로 렌더링됨 |
| FR-020 | 주문 행 펼침/접기 → 상품 테이블 노출 | high | 주문 행의 펼침 아이콘 클릭 시 해당 주문의 상품 목록 테이블이 주문 행 아래에 인라인으로 노출됨 |
| FR-021 | 주문 상태 인라인 셀렉트 변경 | high | 주문 행의 상태 셀을 클릭하면 드롭다운이 열리고, 현재 상태에서 전이 가능한 상태만 표시됨; 선택 즉시 저장 |
| FR-022 | 주문처리 버튼 — 현재 상태에 따라 동적 노출 (상세수정/검수완료/포장완료/결제확인/출고처리 등) | critical | 각 주문 행에 현재 상태에 대응하는 처리 버튼만 표시됨; 권한이 없는 버튼은 숨김 |
| FR-023 | 상품 테이블: 트래킹번호 인풋 + 저장 버튼 (인라인 편집) | high | 상품 행의 트래킹번호 셀에 직접 입력 후 저장 버튼 클릭 시 즉시 저장되고 성공/실패 인라인 피드백 표시 |
| FR-024 | 상품 테이블: 멀티트래킹 추가/관리 | high | 트래킹번호 행 옆 '+' 버튼으로 추가 트래킹 번호 입력 가능; 기존 번호 삭제 가능 |
| FR-025 | 상품 이미지 호버 시 확대 팝업 | medium | 상품 행의 썸네일 이미지에 마우스 오버 시 원본 비율로 확대된 이미지가 팝업으로 표시됨 |
| FR-026 | 상품명 클릭 시 구매링크 새 탭 열기 | low | 상품 행의 상품명 텍스트가 링크로 렌더링되어 클릭 시 상품 URL이 새 탭에서 열림 |
| FR-027 | 상태 일괄 변경 팝업 (변경 가능 상태 목록, 변경 사유, 알림/메모 옵션) | critical | 팝업에 선택된 주문 수 표시; 변경 가능한 상태 목록만 셀렉트로 제공; 변경 사유 텍스트 입력; 고객 알림 발송 여부 체크; 내부 메모 입력 옵션; 확인 클릭 시 일괄 적용 및 결과 안내 |
| FR-028 | 담당자 배정 팝업 (담당자 목록 + 현재 업무량 + 자동 배정 버튼) | high | 팝업에 활성 담당자 목록과 각 담당자의 현재 담당 주문 수 표시; '자동 배정' 클릭 시 업무량이 적은 담당자에게 자동 분배; 수동 선택도 가능 |
| FR-029 | 실사 보기 팝업 (이미지 슬라이드, 추가/삭제/다운로드, 검수 메모 입력) | high | 상품의 실사 이미지 슬라이드 뷰어; 이미지 추가(파일 선택)·삭제·전체 다운로드 기능; 검수 메모 텍스트 입력 및 저장 |
| FR-030 | 창고작업자 플로팅 메뉴 (입고스캔/실사촬영/출고스캔/재고스캔/상태스캔) | high | 창고작업자(warehouse) 역할로 접속 시 화면 우하단에 플로팅 버튼 표시; 클릭 시 스캔 모드 선택 메뉴 펼쳐짐 |
| FR-031 | 총 건수 표시 + 정렬 옵션 + 페이지당 표시 수 설정 | high | 목록 상단에 필터 적용 후 총 주문 건수 표시; 정렬 기준(등록일/상태/담당자) 드롭다운; 20/50/100건 per page 선택 가능 |
| FR-032 | 페이지네이션 | critical | 목록 하단에 이전/다음/번호 페이지네이션 표시; 현재 페이지 강조; 마지막 페이지 이상 이동 불가 |

### 3.2 Non-Functional Requirements (비기능 요구사항)

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | 주문 목록 초기 로딩 LCP | < 2.5s | Lighthouse LCP; 20건 기준 |
| NFR-002 | 검색 필터 적용 후 목록 갱신 응답 | < 1s | API 응답 p95 측정 |
| NFR-003 | 현황 카드 집계 조회 응답 | < 500ms | `/api/v1/admin/orders/summary` p95 측정 |
| NFR-004 | 개인정보 마스킹 (수취인 연락처 부분) | 화면 렌더링 시 항상 적용 | 전화번호 중간 4자리 마스킹 확인 테스트 |
| NFR-005 | 내부 메모 관리자 전용 열람 (operator 이상) | 역할 기반 필터링 | warehouse/customer 역할로 접근 시 메모 필드 미노출 확인 |
| NFR-006 | 결제 정보 접근 제한 | TBD — 재무담당자 역할 미정의 (rbac.v1.md 참조) | TBD |
| NFR-007 | 대량 데이터 테이블 접근성 (스크린리더 등) | TBD — 접근성 기준 미정의 | TBD |
| NFR-008 | 데스크톱 우선 최적화 | 1280px 이상 레이아웃 최적화; 반응형 요구사항 TBD | 1280px/1920px 해상도 시각 확인 |

## 4. User Stories (사용자 스토리)

### US-001: 주문 현황 모니터링 및 센터 필터링
- **As a** 운영관리자
- **I want** 8개 구분별 주문 현황을 한눈에 확인하고 센터별로 필터링하고 싶다
- **So that** 어느 구분·센터에서 처리가 몰려있는지 즉시 파악하고 우선순위를 결정할 수 있다
- **Acceptance Criteria**:
  - [ ] 페이지 진입 시 8개 구분 카드에 주문 수가 렌더링됨
  - [ ] 센터 셀렉트를 '위해'로 변경 시 8개 카드 수치가 위해 센터 기준으로 갱신됨
  - [ ] 카드 클릭 시 해당 구분의 상태별 주문 수 드릴다운이 펼쳐짐
  - [ ] 상태 항목 클릭 시 검색 필터에 구분+상태 값이 자동 설정되고 목록이 갱신됨
- **Related**: FR-001, FR-002, FR-003, FR-004

### US-002: 주문 상태 일괄 변경
- **As a** 운영관리자
- **I want** 여러 주문을 한 번에 선택해 상태를 일괄 변경하고 싶다
- **So that** 반복적인 상태 변경 작업 시간을 줄이고 실수를 방지할 수 있다
- **Acceptance Criteria**:
  - [ ] 주문 체크박스로 복수 선택 후 '상태 변경' 버튼 클릭 시 일괄 변경 팝업 열림
  - [ ] 팝업에 선택 건수와 변경 가능한 상태 목록이 표시됨
  - [ ] 변경 사유 입력 가능; 고객 알림 여부 체크박스 존재
  - [ ] 확인 후 성공/실패 건수를 결과 팝업으로 안내
  - [ ] 권한 없는 역할에서는 '상태 변경' 버튼이 노출되지 않음
- **Related**: FR-009, FR-010, FR-027

### US-003: 담당자 일괄 배정
- **As a** 운영관리자
- **I want** 선택한 주문들을 특정 담당자에게 일괄 배정하거나 업무량 기반 자동 배정하고 싶다
- **So that** 팀 업무를 균형 있게 분배하고 배정 누락을 방지할 수 있다
- **Acceptance Criteria**:
  - [ ] 주문 선택 후 '담당자 배정' 버튼 클릭 시 배정 팝업 열림
  - [ ] 팝업에 담당자 목록과 각 담당자의 현재 담당 주문 수가 표시됨
  - [ ] '자동 배정' 버튼 클릭 시 업무량이 가장 적은 담당자에게 자동 분배
  - [ ] 수동 선택 후 확인 시 선택 주문에 담당자 저장 완료
- **Related**: FR-011, FR-028

### US-004: 엑셀 다운로드 및 업로드
- **As a** 운영관리자
- **I want** 주문 데이터를 엑셀로 다운로드하거나 업로드하고 싶다
- **So that** 물류·통관 파트너사에 데이터를 제출하거나 대량 주문 데이터를 시스템에 반영할 수 있다
- **Acceptance Criteria**:
  - [ ] 엑셀 다운로드 드롭다운에서 8종 형식 선택 후 클릭 시 xlsx 파일 다운로드됨
  - [ ] 다운로드 범위(선택 주문 vs 필터 전체)는 TBD — needs clarification
  - [ ] 엑셀 업로드 클릭 시 파일 선택 다이얼로그 열림; 업로드 완료 시 성공/오류 건수 안내
  - [ ] 권한 없는 역할에서는 해당 버튼이 노출되지 않음
- **Related**: FR-012, FR-015

### US-005: 트래킹번호 입력 및 멀티트래킹 관리
- **As a** 물류담당자
- **I want** 주문의 상품 행에서 트래킹번호를 직접 입력하고 멀티트래킹을 관리하고 싶다
- **So that** 별도 화면 이동 없이 목록 페이지에서 신속하게 트래킹번호를 등록할 수 있다
- **Acceptance Criteria**:
  - [ ] 주문 행 펼침 후 상품 테이블에서 트래킹번호 인풋에 입력 후 저장 버튼 클릭 시 즉시 저장됨
  - [ ] 저장 성공/실패 여부가 인라인 피드백으로 표시됨
  - [ ] '+' 버튼으로 멀티트래킹 번호를 추가할 수 있음
  - [ ] 기존 트래킹번호 옆 삭제 버튼으로 제거 가능
- **Related**: FR-020, FR-023, FR-024

### US-006: 실사 이미지 보기 및 검수
- **As a** 물류담당자
- **I want** 상품의 실사 이미지를 보고 검수 메모를 입력하고 싶다
- **So that** 입고된 실물 상품 상태를 확인하고 이슈 사항을 기록할 수 있다
- **Acceptance Criteria**:
  - [ ] 상품 행에서 '실사 보기' 클릭 시 슬라이드 이미지 팝업이 열림
  - [ ] 팝업에서 이미지 추가(파일 선택), 삭제, 전체 다운로드 가능
  - [ ] 검수 메모 텍스트 입력 후 저장 시 서버에 반영됨
  - [ ] 이미지가 없는 경우 빈 상태 안내 문구 표시
- **Related**: FR-029

### US-007: 대량 메시지 발송
- **As a** CS담당자
- **I want** 선택한 주문의 수취인에게 SMS 또는 앱푸시 메시지를 일괄 발송하고 싶다
- **So that** 개별 연락 없이 한 번에 고객에게 처리 현황을 안내할 수 있다
- **Acceptance Criteria**:
  - [ ] 1개 이상 주문 선택 후 '대량 메시지' 버튼 클릭 시 발송 팝업 열림
  - [ ] 팝업에 수신자 목록(주문번호·수취인명·연락처)이 표시됨 — 연락처는 마스킹 적용
  - [ ] SMS/앱푸시 유형 선택 및 메시지 내용 입력 가능
  - [ ] 발송 완료 후 성공/실패 건수 안내
- **Related**: FR-018, NFR-004

### US-008: 창고작업자 스캔 작업
- **As a** 창고작업자
- **I want** 플로팅 메뉴에서 스캔 모드를 선택하여 입고/출고/재고/상태 스캔을 처리하고 싶다
- **So that** 별도 디바이스 없이 관리자 화면에서 바코드/QR 스캔으로 창고 작업을 수행할 수 있다
- **Acceptance Criteria**:
  - [ ] 창고작업자 역할 로그인 시 화면 우하단에 플로팅 메뉴 버튼이 표시됨
  - [ ] 입고스캔/실사촬영/출고스캔/재고스캔/상태스캔 5개 모드 선택 가능
  - [ ] 스캔 연동 방식(Web Camera API vs 모바일 앱)은 TBD — needs clarification
  - [ ] 창고작업자는 주문 목록을 읽기 전용으로 조회할 수 있으며 상태 변경·삭제 버튼은 노출되지 않음
- **Related**: FR-030

### US-009: 묶음 출고 처리
- **As a** 운영관리자
- **I want** 동일 수취인의 여러 주문을 하나로 묶어 출고 처리하고 싶다
- **So that** 배송 비용을 절감하고 고객이 한 번에 수령할 수 있도록 할 수 있다
- **Acceptance Criteria**:
  - [ ] 2개 이상 주문 선택 후 '묶음 출고' 버튼 클릭 시 확인 팝업 표시
  - [ ] 팝업에서 묶음 구성 주문 목록과 총 중량 확인 가능
  - [ ] 확인 시 묶음 출고 처리 완료 및 관련 주문 상태 갱신
  - [ ] 묶음 가능 조건(동일 수취인, 출고 가능 상태 등) 불충족 시 오류 메시지 표시
- **Related**: FR-016

### US-010: 주문 인라인 상태 변경 및 처리 버튼
- **As a** 운영관리자
- **I want** 주문 목록에서 개별 주문의 상태를 인라인으로 변경하고 처리 버튼으로 빠르게 처리하고 싶다
- **So that** 상세 페이지로 이동하지 않고 목록에서 신속하게 주문을 처리할 수 있다
- **Acceptance Criteria**:
  - [ ] 주문 행의 상태 셀 클릭 시 전이 가능한 상태 드롭다운 표시; 선택 시 즉시 저장
  - [ ] 현재 상태에 대응하는 처리 버튼(검수완료/포장완료/결제확인/출고처리 등)만 동적으로 노출
  - [ ] 권한이 없는 역할의 경우 해당 처리 버튼 숨김
  - [ ] 상태 변경 완료 시 해당 행이 즉시 갱신됨 (페이지 전체 새로고침 없이)
- **Related**: FR-021, FR-022

## 5. Data Model (데이터 모델)

> 이 스펙은 `order.v1.md`의 `Application`(주문), `Product`(상품), `Recipient`(수취인) 엔티티를 참조한다. 아래는 관리 화면 전용 추가 엔티티와 뷰 모델을 정의한다.

### 5.1 OrderStatusCategory (구분 및 상태 정의)

```
OrderStatusCategory
├── id            BIGINT PK AUTO_INCREMENT
├── code          VARCHAR(50) UNIQUE NOT NULL   -- 'EXPRESS' | 'PURCHASE' | 'COURIER' | 'LCL' | 'COUPANG' | 'ERROR' | 'RETURN' | 'INVENTORY'
├── name_ko       VARCHAR(100) NOT NULL          -- '특송' | '구매대행' 등 화면 표시명
├── display_order INT NOT NULL DEFAULT 0
└── is_active     BOOLEAN NOT NULL DEFAULT TRUE

OrderStatusDefinition
├── id            BIGINT PK AUTO_INCREMENT
├── category_id   BIGINT FK → OrderStatusCategory.id
├── status_code   VARCHAR(100) UNIQUE NOT NULL  -- 'PARTIAL_INBOUND' | 'INBOUND_COMPLETE' 등 영문 코드
├── status_name   VARCHAR(100) NOT NULL          -- '부분입고' | '입고완료' 등 한국어 표시명
├── display_order INT NOT NULL DEFAULT 0
└── is_active     BOOLEAN NOT NULL DEFAULT TRUE
```

**비고**: order.v1.md의 `Application.status` 컬럼과 이 스펙의 `status_code` 간 매핑 전략은 TBD — needs clarification (order.v1.md는 5종 상태 정의, 기획서는 60종+ 상태 정의)

### 5.2 OrderStatusTransition (상태 전이 규칙)

```
OrderStatusTransition
├── id              BIGINT PK AUTO_INCREMENT
├── from_status     VARCHAR(100) NOT NULL FK → OrderStatusDefinition.status_code
├── to_status       VARCHAR(100) NOT NULL FK → OrderStatusDefinition.status_code
├── required_role   VARCHAR(50) NULL            -- NULL이면 권한 무관; 'operator' 이상 등
├── is_active       BOOLEAN NOT NULL DEFAULT TRUE
└── UNIQUE(from_status, to_status)
```

**상태 전이 테이블 (주요 흐름)**:

| 현재 상태 | 전이 가능 상태 |
|-----------|---------------|
| 임시저장 | 접수신청, 접수취소 |
| 접수신청 | 입고완료, 오류입고, 접수취소 |
| 부분입고 | 입고완료, 오류입고 |
| 입고완료 | 검수완료, 오류입고 |
| 검수완료 | 포장요청, 재검수요청 |
| 포장요청 | 포장완료 |
| 포장완료 | 결제대기, 출고보류 |
| 결제대기 | 결제완료, 추가결제대기 |
| 결제완료 | 추가결제대기, 출고준비 |
| 추가결제대기 | 추가결제완료 |
| 추가결제완료 | 출고준비 |
| 출고준비 | 출고대기 |
| 출고대기 | 출고완료, 출고중지 |
| 출고완료 | 배송완료 |
| 배송완료 | 리턴신청 |
| 오류입고 | 오류무시, 접수취소 |
| 출고중지 | 출고보류, 출고대기 |

**비고**: 쿠팡입출고 독립 상태 체계 여부는 TBD — needs clarification. 상품 단위 상태 전이 규칙도 TBD — needs clarification

### 5.3 AssigneeWorkload (담당자 업무량 집계 뷰)

```
AssigneeWorkload  [Read-only / 집계 뷰]
├── user_id           BIGINT FK → User.id (rbac.v1.md)
├── user_name         VARCHAR(100)
├── assigned_count    INT    -- 현재 배정된 미완료 주문 수
└── last_assigned_at  TIMESTAMP NULL
```

**비고**: 물리 테이블이 아닌 집계 쿼리 결과로 제공할 수 있음

### 5.4 OrderAuditLog (주문 감사 로그)

```
OrderAuditLog
├── id            BIGINT PK AUTO_INCREMENT
├── order_id      BIGINT FK → Application.id (order.v1.md)
├── actor_id      BIGINT FK → User.id (rbac.v1.md)
├── action        VARCHAR(100) NOT NULL  -- 'STATUS_CHANGE' | 'ASSIGN' | 'TRACKING_UPDATE' | 'BATCH_STATUS' 등
├── before_value  JSON NULL              -- 변경 전 값
├── after_value   JSON NULL              -- 변경 후 값
├── memo          TEXT NULL              -- 변경 사유 또는 메모
├── ip_address    VARCHAR(45) NULL
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

### 5.5 InspectionImage (실사 이미지)

```
InspectionImage
├── id            BIGINT PK AUTO_INCREMENT
├── product_id    BIGINT FK → Product.id (order.v1.md)
├── url           VARCHAR(2048) NOT NULL   -- 저장된 이미지 URL (CDN 경로)
├── file_name     VARCHAR(255) NOT NULL
├── file_size     INT NOT NULL             -- bytes
├── display_order INT NOT NULL DEFAULT 0
├── uploaded_by   BIGINT FK → User.id (rbac.v1.md)
├── inspection_memo TEXT NULL              -- 해당 이미지에 대한 검수 메모
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

### 5.6 TrackingNumber (트래킹번호 — 멀티트래킹 지원)

```
TrackingNumber
├── id            BIGINT PK AUTO_INCREMENT
├── product_id    BIGINT FK → Product.id (order.v1.md)
├── carrier_code  VARCHAR(50) NULL         -- 운송사 코드
├── tracking_no   VARCHAR(255) NOT NULL
├── is_primary    BOOLEAN NOT NULL DEFAULT FALSE
├── created_by    BIGINT FK → User.id (rbac.v1.md)
└── created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**비고**: order.v1.md의 트래킹번호 모델과 충돌 여부 확인 필요 — TBD

## 6. API Contracts (API 계약)

> 모든 엔드포인트는 JWT HttpOnly Cookie 인증 필요 (`rbac.v1.md` 참조). 권한 부족 시 `403 Forbidden` 반환.

### 6.1 주문 목록 조회

```
GET /api/v1/admin/orders

Query Parameters:
  page          INT     default: 1
  limit         INT     default: 20  options: 20|50|100
  center        STRING  'ALL' | 'WEIHAI' | 'JAPAN'
  category      STRING  OrderStatusCategory.code
  status        STRING  OrderStatusDefinition.status_code
  order_no      STRING  주문번호 검색
  mailbox_no    STRING  사서함번호 검색
  tracking_no   STRING  운송장번호 검색
  product_code  STRING  상품코드 검색
  recipient     STRING  수취인명 검색
  transport     STRING  운송방식 코드
  clearance     STRING  통관구분 코드
  assignee_id   BIGINT  담당자 ID
  date_from     DATE    기간 시작 (ISO 8601)
  date_to       DATE    기간 종료 (ISO 8601)
  sort_by       STRING  'created_at' | 'status' | 'assignee'  default: 'created_at'
  sort_order    STRING  'asc' | 'desc'  default: 'desc'

Response 200:
{
  "success": true,
  "data": {
    "items": [OrderRow],
    "total": INT,
    "page": INT,
    "limit": INT
  }
}

OrderRow:
{
  "id": BIGINT,
  "order_no": STRING,
  "category": STRING,
  "status": STRING,
  "status_name": STRING,
  "center": STRING,
  "recipient_name": STRING,        -- 마스킹 없음 (관리자)
  "recipient_phone": STRING,       -- 중간 4자리 마스킹 적용
  "product_summary": STRING,
  "assignee_id": BIGINT | null,
  "assignee_name": STRING | null,
  "created_at": STRING,            -- ISO 8601
  "allowed_actions": [STRING]      -- 현재 역할+상태에서 가능한 액션 목록
}
```

### 6.2 현황 카드 집계

```
GET /api/v1/admin/orders/summary

Query Parameters:
  center  STRING  'ALL' | 'WEIHAI' | 'JAPAN'  default: 'ALL'

Response 200:
{
  "success": true,
  "data": {
    "categories": [
      {
        "category_code": STRING,
        "category_name": STRING,
        "total": INT,
        "statuses": [
          { "status_code": STRING, "status_name": STRING, "count": INT }
        ]
      }
    ],
    "as_of": STRING   -- 집계 기준 시각 ISO 8601
  }
}
```

### 6.3 상태 일괄 변경

```
PATCH /api/v1/admin/orders/batch-status

Request Body:
{
  "order_ids": [BIGINT],      -- 1개 이상
  "target_status": STRING,    -- OrderStatusDefinition.status_code
  "reason": STRING | null,
  "notify_customer": BOOLEAN,
  "memo": STRING | null
}

Response 200:
{
  "success": true,
  "data": {
    "succeeded": INT,
    "failed": INT,
    "errors": [{ "order_id": BIGINT, "reason": STRING }]
  }
}
```

**비고**: 혼합 상태(선택된 주문들이 서로 다른 구분)의 일괄 변경 처리 규칙은 TBD — needs clarification

### 6.4 담당자 일괄 배정

```
PATCH /api/v1/admin/orders/batch-assign

Request Body:
{
  "order_ids": [BIGINT],
  "assignee_id": BIGINT | null,   -- null이면 자동 배정
  "auto_assign": BOOLEAN
}

Response 200:
{
  "success": true,
  "data": {
    "succeeded": INT,
    "assignments": [{ "order_id": BIGINT, "assignee_id": BIGINT, "assignee_name": STRING }]
  }
}
```

### 6.5 주문 상품 목록 조회

```
GET /api/v1/admin/orders/:id/products

Response 200:
{
  "success": true,
  "data": [
    {
      "id": BIGINT,
      "product_name_ko": STRING,
      "product_url": STRING | null,
      "quantity": INT,
      "unit_price": DECIMAL,
      "weight_kg": DECIMAL,
      "thumbnail_url": STRING | null,
      "tracking_numbers": [
        { "id": BIGINT, "carrier_code": STRING | null, "tracking_no": STRING, "is_primary": BOOLEAN }
      ],
      "has_inspection_images": BOOLEAN
    }
  ]
}
```

### 6.6 트래킹번호 수정 (단건 저장)

```
PATCH /api/v1/admin/products/:id/tracking

Request Body:
{
  "tracking_no": STRING,
  "carrier_code": STRING | null
}

Response 200:
{ "success": true, "data": { "id": BIGINT, "tracking_no": STRING } }
```

### 6.7 멀티트래킹 추가

```
POST /api/v1/admin/products/:id/tracking

Request Body:
{
  "tracking_no": STRING,
  "carrier_code": STRING | null,
  "is_primary": BOOLEAN
}

Response 201:
{ "success": true, "data": { "id": BIGINT, "tracking_no": STRING } }
```

### 6.8 엑셀 다운로드

```
GET /api/v1/admin/orders/export/:type

Path Parameter:
  type  STRING  'manifest' | 'packing' | 'invoice' | '3pl' | 'j-manifest-kr' | 'j-manifest-cn' | 'japan-air' | 'hb-manifest' | 'hb-multi'

Query Parameters:
  order_ids   STRING  쉼표 구분 주문 ID 목록 (생략 시 현재 필터 전체) — 범위 TBD
  (+ 6.1과 동일한 필터 파라미터)

Response 200:
  Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Content-Disposition: attachment; filename="{type}_{timestamp}.xlsx"
```

### 6.9 엑셀 업로드 (주문 일괄)

```
POST /api/v1/admin/orders/import

Request:
  Content-Type: multipart/form-data
  file: xlsx/csv 파일

Response 200:
{
  "success": true,
  "data": {
    "total": INT,
    "succeeded": INT,
    "failed": INT,
    "errors": [{ "row": INT, "reason": STRING }]
  }
}
```

### 6.10 실사 이미지 목록 조회

```
GET /api/v1/admin/products/:id/images

Response 200:
{
  "success": true,
  "data": [
    { "id": BIGINT, "url": STRING, "file_name": STRING, "display_order": INT, "inspection_memo": STRING | null }
  ]
}
```

### 6.11 실사 이미지 업로드

```
POST /api/v1/admin/products/:id/images

Request:
  Content-Type: multipart/form-data
  file: 이미지 파일 (jpg/png/webp)
  inspection_memo: STRING (optional)

Response 201:
{ "success": true, "data": { "id": BIGINT, "url": STRING } }
```

### 6.12 실사 이미지 삭제

```
DELETE /api/v1/admin/products/:id/images/:imageId

Response 200:
{ "success": true }
```

### 6.13 담당자 목록 + 업무량 조회

```
GET /api/v1/admin/assignees

Response 200:
{
  "success": true,
  "data": [
    { "id": BIGINT, "name": STRING, "assigned_count": INT, "last_assigned_at": STRING | null }
  ]
}
```

## 7. UI/UX Requirements (UI/UX 요구사항)

### 7.1 화면 전체 레이아웃

```
┌────────────────────────────────────────────────┐
│  [페이지 헤더: 대행종합관리]  [센터 셀렉트]         │
├────────────────────────────────────────────────┤
│  [현황 카드 영역] — 8개 구분 카드 (FR-001~004)     │
│  각 카드: 구분명 + 주문수; 클릭 시 상태 드릴다운     │
├────────────────────────────────────────────────┤
│  [검색 필터 영역] — 1줄 기본 + 확장 접기 (FR-005~008) │
├────────────────────────────────────────────────┤
│  [액션 버튼 영역] — 역할별 가시 버튼 (FR-009~018)   │
│  [총 건수] [정렬] [페이지당 수]                     │
├────────────────────────────────────────────────┤
│  [주문 목록 테이블] — 복합 3레이어 행 (FR-019~026)  │
│  ├─ 주문 행 (체크박스 | 주문번호 | 구분 | 상태 셀렉트 | 센터 | 수취인 | 상품요약 | 담당자 | 등록일 | 처리버튼) │
│  └─ [펼침 시] 상품 테이블 (트래킹 | 실사 | 상품정보) │
├────────────────────────────────────────────────┤
│  [페이지네이션] (FR-032)                          │
└────────────────────────────────────────────────┘
                                  [창고 플로팅 메뉴] (FR-030)
```

### 7.2 현황 카드 영역

- 카드 8개를 가로 스크롤 없이 1~2줄 그리드로 배치 (1280px 기준 4열×2행 또는 8열×1행)
- 각 카드: 구분명(한국어) + 총 주문 수 (대형 숫자)
- 클릭 시 카드 하단에 상태별 주문 수 목록이 accordion으로 펼쳐짐
- 상태 항목은 "상태명 (건수)" 형식으로 표시; 클릭 시 검색 필터 자동 적용

### 7.3 검색 필터 영역

- 기본 1줄: 검색 유형 드롭다운(주문번호/사서함/운송장/트래킹) + 검색 인풋 + 검색 버튼
- '상세검색' 버튼 클릭 시 추가 행 슬라이드 다운: 수취인명, 상품코드, 운송방식, 통관구분, 담당자 셀렉트, 기간검색
- 기간검색: [1일][3일][7일][직접선택] 프리셋 버튼 + DateRangePicker
- 우측 하단 '초기화' 버튼

### 7.4 액션 버튼 영역 (역할별 노출)

| 버튼 | 시스템관리자 | 운영관리자 | 물류담당자 | CS담당자 | 창고작업자 |
|------|:---:|:---:|:---:|:---:|:---:|
| 상태 일괄 변경 | O | O | - | - | - |
| 담당자 배정 | O | O | - | - | - |
| 엑셀 다운로드 (8종) | O | O | O | O | - |
| 운송장 대량 등록 | O | O | - | - | - |
| 라벨 인쇄 (3종) | O | O | - | O | - |
| 엑셀 업로드 | O | O | - | - | - |
| 묶음 출고 | O | O | - | - | - |
| 신규 주문 | O | O | - | - | - |
| 대량 메시지 | O | O | - | O | - |
| 실사이미지 일괄 | O | O | O | - | - |
| 창고 스캔 (플로팅) | O | - | O | - | O |

**비고**: 기획서 역할명 ↔ rbac.v1.md 역할 코드 매핑은 TBD — needs clarification

| 기획서 역할명 | rbac.v1.md 역할 코드 (추정) |
|--------------|--------------------------|
| 시스템관리자 | `super_admin` |
| 운영관리자 | `admin` |
| 물류담당자 | `operator` |
| CS담당자 | TBD — needs clarification (`operator` 서브역할 여부 불명확) |
| 창고작업자 | `warehouse` |

### 7.5 주문 목록 테이블 (복합 행)

**3레이어 행 구조**:
- **레이어 1 (헤더행)**: 체크박스 | 펼침 아이콘 | 주문번호 | 구분 | 상태(인라인 셀렉트) | 센터
- **레이어 2 (정보행)**: 수취인명 | 상품요약(건수) | 담당자 | 등록일 | 처리버튼
- **레이어 3 (부가정보)**: 운송방식 | 통관구분 | 사서함번호 등 보조 정보

**펼침 상태 (상품 테이블)**:
- 상품별 행: 썸네일(호버 확대) | 상품명(링크) | 수량 | 단가 | 트래킹번호 인풋+저장 | 멀티트래킹+ | 실사보기 버튼

### 7.6 팝업 목록

1. **상태 일괄 변경 팝업** (FR-027): 선택 건수 안내 → 대상 상태 셀렉트 → 변경 사유 텍스트 → 고객 알림 체크 → 내부 메모 → 확인/취소
2. **담당자 배정 팝업** (FR-028): 담당자 목록(업무량 포함) → 자동 배정 버튼 → 수동 선택 → 확인/취소
3. **실사 보기 팝업** (FR-029): 이미지 슬라이드 → 추가/삭제/다운로드 버튼 → 검수 메모 입력 → 저장/닫기
4. **메시지 발송 팝업** (FR-018): 수신자 목록 → SMS/앱푸시 선택 → 메시지 입력 → 발송/취소
5. **묶음 출고 확인 팝업** (FR-016): 묶음 구성 목록 → 총 중량 → 확인/취소

### 7.7 창고작업자 플로팅 메뉴 (FR-030)

- 화면 우하단 고정 FAB(Floating Action Button) — warehouse 역할에만 노출
- 클릭 시 부채꼴 또는 리스트 형태로 5개 모드 아이콘+텍스트 노출
- 스캔 연동 방식은 TBD — needs clarification (Web Camera API vs 모바일 앱 연동)

## 8. Dependencies (의존성)

| 의존 대상 | 유형 | 설명 |
|----------|------|------|
| `order.v1.md` | Spec | Application(주문), Product, Recipient 엔티티; 주문 신청 플로우 |
| `rbac.v1.md` | Spec | User, Role, Permission 모델; JWT Guard; 역할 코드 정의 |
| NestJS 11 | Framework | 백엔드 API 서버 |
| Next.js 16 App Router | Framework | 프론트엔드 — `(admin)/admin/(dashboard)` 라우트 그룹 |
| TanStack React Query 5 | Library | 서버 상태 관리 (주문 목록, 현황 카드 캐싱) |
| shadcn/ui (radix-nova) | Library | Select, Dialog, Checkbox, Table, Popover 등 UI 컴포넌트 |
| Prisma + MariaDB | Database | ORM 및 데이터베이스 |
| 엑셀 처리 라이브러리 | Library | TBD — ExcelJS 또는 SheetJS |
| SMS/앱푸시 연동 서비스 | External | TBD — needs clarification (외부 메시지 플랫폼 미정) |
| 이미지 스토리지 | External | TBD — CDN/오브젝트 스토리지 미정 |
| 바코드/QR 스캔 | External | TBD — Web Camera API 또는 모바일 앱 연동 미정 |

## 9. Constraints & Assumptions (제약사항 및 가정)

### 제약사항

1. **RBAC 역할 매핑 미정**: 기획서의 5개 역할명(시스템관리자/운영관리자/물류담당자/CS담당자/창고작업자)과 `rbac.v1.md`의 역할 코드(`super_admin`/`admin`/`operator`/`warehouse`/`customer`) 간 1:1 매핑이 확정되지 않음 — TBD
2. **주문 상태 확장 전략 미정**: `order.v1.md`는 5종 상태(draft/pending/approved/rejected/completed) 정의, 기획서는 60종+ 상태 요구 — 기존 스펙 수정 vs 별도 status 테이블 추가 여부 TBD
3. **쿠팡입출고 상태 체계**: 기획서 현황 카드에 쿠팡이 포함되나 상태 정의가 명시되지 않음 — TBD
4. **재무담당자 역할 부재**: 결제 정보 접근 제어를 위한 재무담당자 역할이 rbac.v1.md에 없음 — 추가 여부 TBD
5. **엑셀 다운로드 범위**: 선택 주문만 vs 현재 필터 전체 중 어떤 기준을 기본으로 할지 TBD
6. **현황 카드 갱신 주기**: 실시간(WebSocket/SSE) vs 주기적 폴링 vs 수동 새로고침 TBD
7. **창고 스캔 연동**: Web Camera API(브라우저 카메라) vs 전용 모바일 앱 연동 TBD
8. **주문 상세 팝업 포함 여부**: 주문 상세 수정이 현재 목록 페이지 내 팝업으로 처리될지 별도 페이지로 분리될지 TBD
9. **혼합 상태 일괄 변경**: 서로 다른 구분·상태의 주문들을 동시에 상태 변경할 때의 처리 규칙 TBD
10. **상품 단위 상태 전이**: 주문 단위 상태 변경과 상품 단위 상태 변경의 관계 및 전이 규칙 TBD

### 가정

1. 이 스펙의 화면은 `(admin)/admin/(dashboard)` 라우트 그룹 아래 구현된다.
2. 인증은 JWT HttpOnly Cookie 방식을 사용하며 `rbac.v1.md`에 따른 Guard가 이미 구현되어 있다고 가정한다.
3. 데스크톱(1280px+) 사용이 주 환경이며 모바일 반응형은 이 스펙 범위에서 제외한다.
4. 현황 카드 집계는 OLTP 쿼리로 제공 가능한 수준(초단위 집계)임을 전제한다. 대규모 데이터 시 캐시 레이어 추가 필요성은 별도 검토.
5. 실사 이미지는 서버 측에서 CDN 업로드를 처리하며 프론트엔드는 URL만 받는다.

## 10. Glossary (용어집)

| 용어 | 정의 |
|------|------|
| 대행종합관리 | 관리자가 모든 대행 주문(배송대행/구매대행/특송/LCL/쿠팡/오류/리턴/재고)을 단일 화면에서 관리하는 통합 대시보드 |
| 구분 (Category) | 주문의 서비스 유형 분류. 배송대행·구매대행·특송·LCL·쿠팡·오류·리턴·재고 8종 |
| 현황 카드 | 각 구분별 주문 수를 집계하여 보여주는 카드 UI 컴포넌트 |
| 드릴다운 (Drill-down) | 구분 카드 클릭 시 해당 구분의 상태별 주문 수 세부 목록을 펼쳐 보는 기능 |
| 복합 행 (Multi-layer Row) | 주문 1건을 3개 레이어(헤더행·정보행·부가정보)로 렌더링하는 테이블 행 구조 |
| 일괄 변경 | 다수 주문을 한 번에 처리하는 배치 작업 (상태 변경, 담당자 배정 등) |
| 인라인 편집 | 목록 테이블 행에서 직접 데이터를 수정하는 UX 패턴 (별도 상세 페이지 이동 없이) |
| 트래킹번호 | 해외 물류에서 발송된 상품을 추적하기 위한 운송장 번호 |
| 멀티트래킹 | 하나의 상품에 여러 트래킹번호를 등록하는 기능 |
| 실사 이미지 | 창고에서 입고된 실물 상품을 직접 촬영한 검수용 이미지 |
| 매니페스트 | 화물의 명세를 정리한 공식 문서; 세관 신고 및 물류 파트너사 제출용 |
| 묶음 출고 | 동일 수취인의 여러 주문을 하나의 패키지로 합쳐 출고하는 처리 |
| 플로팅 메뉴 | 화면 위에 고정된 위치(우하단)에 항상 노출되는 빠른 접근 메뉴 UI |
| FAB | Floating Action Button. 플로팅 메뉴의 트리거 버튼 |
| 창고작업자 스캔 | 바코드/QR 스캔을 통해 입고·출고·재고·상태를 실시간 처리하는 창고 현장 작업 방식 |
| RBAC | Role-Based Access Control. 역할 기반 접근 제어 (`rbac.v1.md` 참조) |
| 센터 | 물류센터 (위해 / 일본) |
| 사서함번호 | HubNext 플랫폼에서 고객에게 부여되는 개인 물류 사서함 식별 번호 |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-04-11 | 대행종합관리.md v5.1.1 기반 최초 스펙 작성 |
