---
name: spec-management
description: "Domain spec lifecycle — generation, versioning, validation, and multi-domain shared spec management. Use when working with domain specification documents or converting raw specs into structured format."
origin: project
version: 2.0.0
---

# Spec Management

도메인 기획 문서를 **페이지 단위 통합 스펙 파일**로 변환하고, 버전 관리하고, 검증하는 전체 라이프사이클을 관리한다.

## Design Principle

**페이지 단위 1파일**: 각 도메인/페이지는 하나의 스펙 파일로 생성한다. 데이터 모델, 흐름, 화면, 팝업, 액션, 비즈니스 규칙이 모두 한 파일에 포함된다. 개발 시 파일 1개만 열면 전체 컨텍스트를 확보할 수 있다.

- 소스코드는 800줄 제한이지만, **스펙 문서는 참조 문서이므로 크기 제한 없음**
- 섹션 헤딩으로 네비게이션
- 공통 enum/정책만 `shared/`로 분리

## When to Use

- 도메인 기획 문서(`.md`)를 구조화된 스펙으로 변환할 때
- 기존 스펙을 업데이트(v2, v3)할 때
- 여러 도메인 간 shared 스펙을 관리할 때
- 생성된 스펙의 품질을 검증할 때

## When NOT to Use

- 코드 구현 계획 → `planner` 에이전트 사용
- API 설계 → `architect` 에이전트 사용
- 기획 문서 자체를 작성할 때 (이 스킬은 기존 문서를 변환)

---

## Quick Start

```bash
/spec-gen 대행신청.md                     # 기본: 분석 → preview → 생성 → 검증
/spec-gen 대행신청.md --id proxy-order    # domain-id 직접 지정
/spec-gen 대행신청.md --skip-validation   # 검증 건너뛰기
```

---

## Architecture

### 에이전트 구성

```
/spec-gen (orchestrator command)
    │
    ├─ spec-analyzer   문서 → 분석 → analysis JSON
    │
    ├─ [preview + 사용자 확인]
    │
    ├─ spec-writer     analysis JSON → 통합 스펙 파일
    │
    └─ spec-validator  스펙 파일 → 품질 리포트
```

| 에이전트 | 역할 | 입력 | 출력 |
|---------|------|------|------|
| `spec-analyzer` | 문서 분석, 섹션 분류, 통합 구조 결정 | 도메인 문서 경로 | `docs/specs/.analysis/{id}.analysis.json` |
| `spec-writer` | 분석 결과 기반 통합 파일 생성 | analysis JSON + 원본 문서 | `docs/specs/{id}.v{N}.md` |
| `spec-validator` | 생성 스펙 품질 검증 | domain-id | 검증 리포트 |

### 디렉토리 구조

```
docs/
├── specs/                                    # 기획 단계에서 생성
│   ├── .analysis/                            # analyzer 중간 산출물
│   │   └── {domain-id}.analysis.json
│   ├── {domain-id}.v1.md                     # 도메인별 통합 스펙 파일
│   ├── {domain-id}.v2.md                     # 버전 업그레이드 시
│   └── shared/                               # 공통 스펙 (멀티 도메인 시)
│       ├── enums.md
│       └── common-policies.md
├── state/                                    # 구현 단계에서 생성 (기획 시 불필요)
│   ├── {domain-id}.json                      # 스펙 상태 추적
│   └── {domain-id}.events.jsonl              # 이벤트 로그 (append-only)
└── tasks/                                    # 구현 단계에서 생성 (기획 시 불필요)
    └── {domain-id}-v{N}.json                 # 태스크 분해
```

> **Note**: `state/`와 `tasks/`는 기획 단계에서 생성하지 않는다. 구현 단계로 전환할 때 별도로 생성한다.

---

## 통합 스펙 파일 구조

### 섹션 구성

각 도메인 스펙 파일은 다음 섹션으로 구성된다. **콘텐츠가 있는 섹션만 포함** — 모든 섹션이 필수는 아니다.

| # | 섹션 | 담당 콘텐츠 | 포함 조건 |
|---|------|------------|----------|
| 1 | 개요 | 메타데이터, 목적, 카테고리 | 항상 |
| 2 | 데이터 모델 | 엔티티, 필드 테이블, enum, 코드 테이블 | 데이터 구조 존재 시 |
| 3 | 사용자 흐름 | 화면 흐름도, 상태 전이, 접근 경로 | 흐름/상태 머신 존재 시 |
| 4 | 화면 구성 | 레이아웃, 와이어프레임, 컴포넌트 + 인터랙션 인라인 | 화면 설계 존재 시 |
| 5 | 팝업/레이어 | 각 팝업별 레이아웃 + 동작 + 검증 규칙 통합 | 팝업 존재 시 |
| 6 | 비즈니스 규칙 | 필수 입력, 입력 제한, 자동 계산, 검증 규칙 | 규칙 존재 시 |
| 7 | 공통 참조 | shared enum/policy 참조 | shared 의존성 시 |

### 인라인 원칙

**액션과 검증 규칙은 같은 컨텍스트에 배치:**
- `화면 구성` 내 인터랙션 바로 아래에 관련 검증 규칙
- `팝업/레이어` 내 각 팝업에 레이아웃 + 동작 + 규칙 통합
- `비즈니스 규칙` 섹션에는 여러 화면/팝업에 걸치는 공통 규칙만 수집

### 분류 시그널

analyzer가 소스 문서 섹션을 분류할 때 사용하는 패턴:

| 콘텐츠 타입 | 키워드/패턴 |
|---|---|
| `data_model` | `\| 필드명 \| 타입`, `\| 코드 \| 이름`, "데이터 구조", "엔티티", enum 테이블 |
| `workflow` | `┌─` `→` `↓` (ASCII 흐름도), "화면 흐름", "단계", "접근 경로", state diagram |
| `screen` | `┌──` `│` `└──` (ASCII 와이어프레임), "화면 설계", 레이아웃 블록 |
| `interaction` | `[버튼명]`, "클릭 시", "제출", "업로드", "팝업", CRUD 동작 설명 |
| `rule` | "자동 변경", "자동 설정", "조건", "필수", "제한", "규칙", OR/AND 조건 |
| `popup` | 팝업/레이어 헤딩 + 혼합 콘텐츠 (와이어프레임 + 동작 + 규칙) |

---

## 버전 관리

### 파일 명명 규칙

```
{domain-id}.v{N}.md

예: fulfillment-request.v1.md
    fulfillment-request.v2.md
```

### 버전 라이프사이클

```
v1 (draft) → v1 (stable) → v2 (draft) → v2 (stable) → ...
```

- **draft**: 수정 가능, 아직 검증/승인 전
- **stable**: 검증 완료, 수정 불가 → 변경 시 새 버전 생성

### 버전 업그레이드 절차

소스 문서가 변경되었을 때:

1. `spec-analyzer` 실행 (기존 v1과 소스 문서 diff 감지)
2. `analysis.json`의 `next_version: 2` 확인
3. `spec-writer`가 v2 파일 생성
4. v2의 Changes 섹션에 `ADD:` / `MODIFY:` / `REMOVE:` 접두사 사용
5. v2의 Current State에 v1의 Target State 요약 포함

### Spec-Workflow 규칙 준수

`common-spec-workflow.md` 필수 사항:

**기획 단계 (항상 적용):**
- 스펙 파일 덮어쓰기 금지 → 새 버전 파일 생성
- 모든 파일에 **Current State / Changes / Target State** 트리플 필수
- Changes에 `ADD:` / `MODIFY:` / `REMOVE:` 접두사 사용

**구현 단계 (구현 전환 시 적용):**
- `docs/state/{id}.json` 상태 업데이트
- `docs/state/{id}.events.jsonl` 이벤트 추가 (append-only)
- 태스크 ID가 스펙 변경사항을 추적

---

## 멀티 도메인 전략

### 첫 번째 도메인

- 단일 스펙 파일만 생성
- shared 디렉토리 불필요
- 모든 enum/정책은 스펙 내부에 포함

### 두 번째 도메인부터

- `spec-analyzer`가 기존 도메인 스펙 스캔
- 겹치는 enum 감지 (예: 물류센터 코드가 여러 도메인에서 동일)
- 겹치는 정책 감지 (예: 주소 형식 검증이 공통)
- 겹침 발견 시 → shared 추출 제안

### Shared 스펙 관리

```
docs/specs/shared/
├── enums.md              # 공통 열거형 (물류센터, 운송방식 등)
└── common-policies.md    # 공통 정책 (주소 검증, 전화번호 형식 등)
```

- shared로 이동된 항목은 도메인 스펙에서 참조로 교체
- shared 파일도 버전 관리 대상

---

## 에이전트 선택 가이드

| 상황 | 사용할 에이전트 | 커맨드 |
|------|----------------|--------|
| 새 도메인 문서 → 스펙 생성 | analyzer → writer → validator | `/spec-gen {doc}.md` |
| 기존 스펙 품질 확인만 | validator | 직접 호출 |
| 소스 문서 변경 → 스펙 업데이트 | analyzer (diff) → writer | `/spec-gen {doc}.md` (자동 감지) |
| 여러 도메인 간 shared 추출 | analyzer (cross-domain) | `/spec-gen --cross-domain` |

---

## Anti-Patterns

| 하지 말 것 | 이유 | 대신 할 것 |
|-----------|------|-----------|
| 소스 문서 없이 스펙 직접 작성 | 소스 문서가 single source of truth | 항상 소스 문서부터 시작 |
| 도메인별 여러 파일로 분리 | 개발 시 여러 파일 참조 필요 | 페이지 단위 1파일로 통합 |
| stable 스펙 직접 수정 | 버전 히스토리 파괴 | 새 버전(v2) 생성 |
| shared에 도메인 특화 로직 | shared 오염 | 도메인 스펙에 유지 |
| 기획 단계에서 state/task 생성 | 아직 구현 대상이 아님 | 구현 전환 시 생성 |
| events.jsonl 수정/삭제 (구현 단계) | 감사 로그 파괴 | append-only 원칙 |
| analysis JSON 수동 편집 | analyzer 재실행이 안전 | analyzer 재실행 |
| 액션과 검증 규칙을 분리 | 컨텍스트 스위칭 비용 | 인라인으로 함께 배치 |

---

## Related

- **Rules**: `common-spec-workflow.md` — 스펙 워크플로 규칙
- **Schemas**: `docs/state/_schema.json`, `docs/tasks/_schema.json`
- **Agents**: `spec-analyzer`, `spec-writer`, `spec-validator`
- **Command**: `/spec-gen`
