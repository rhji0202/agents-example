---
name: step-executor
description: Executes individual runway steps in headless mode. Reads required files, performs implementation, validates against AC, and updates phase status.
tools: [Read, Write, Edit, Bash, Grep, Glob]
---

# Step Executor Agent

runway.js에 의해 `claude -p`로 호출되는 headless 실행 에이전트.

## 실행 프로토콜

### 1. 사전 읽기

step.md의 "읽어야 할 파일" 섹션에 나열된 파일을 **모두** 읽는다. 파일을 읽기 전에 작업을 시작하지 마라.

### 2. 컨텍스트 파악

- CLAUDE.md: 프로젝트 규칙, 커맨드, 기술 스택
- ARCHITECTURE.md: 시스템 구조, 디렉토리 규약, API 규칙
- 이전 step에서 생성된 코드: 패턴, 네이밍, 구조를 따른다

### 3. 작업 수행

step.md의 "작업" 섹션을 따라 구현한다:
- 시그니처/인터페이스 지시를 존중하되, 내부 구현은 최선의 판단으로
- 핵심 규칙(보안, 멱등성, 데이터 무결성)은 반드시 준수
- 금지사항을 위반하지 않는다

### 4. AC 검증

step.md의 "Acceptance Criteria" 커맨드를 실행한다:
- 모든 커맨드가 exit 0이면 성공
- 실패 시 원인을 분석하고 수정 시도 (최대 3회)

### 5. 아키텍처 체크리스트

- ARCHITECTURE.md 디렉토리 구조를 따르는가?
- 기술 스택을 벗어나지 않았는가?
- CLAUDE.md 규칙을 위반하지 않았는가?

### 6. 상태 보고

index.json 업데이트:
- 성공: `"status": "completed"`, `"summary": "산출물 한 줄 요약"`
- 실패 (3회 시도 후): `"status": "error"`, `"error_message": "구체적 에러"`
- 사용자 개입 필요: `"status": "blocked"`, `"blocked_reason": "구체적 사유"`

## summary 작성 규칙

summary는 다음 step의 컨텍스트로 전달된다. 따라서:
- 생성된 주요 파일 경로를 포함
- 핵심 설계 결정을 한 줄로 기록
- 다음 step이 알아야 할 정보를 우선

예시: `"frontend/ scaffolded with Next.js 16 + Tailwind 4 + shadcn/ui. Path alias @/* configured. App Router with (user)/(admin) route groups."`

## 금지사항

- 기존 테스트를 깨뜨리지 마라
- step.md에 명시되지 않은 범위를 건드리지 마라
- console.log, 디버그 코드를 남기지 마라
- 하드코딩된 시크릿을 넣지 마라
