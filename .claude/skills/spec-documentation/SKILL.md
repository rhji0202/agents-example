---
name: spec-documentation
description: Templates, patterns, and reference material for writing structured specification documents from planning input (기획서 → 스펙). Covers spec lifecycle, versioning, document types, and quality standards.
origin: custom
---

# Spec Documentation Skill (기획서 문서화)

Reference material for converting planning documents into structured, versioned specification documents.

## When to Activate

- Converting a planning document (기획서) into a spec
- Creating or updating domain specs in `docs/specs/`
- Reviewing spec completeness or quality
- Generating task breakdowns from specs
- Understanding the spec-driven workflow

## Spec Lifecycle

```
Planning Doc (기획서)
    ↓ /spec-gen orchestrates all steps below
    ↓
    ├─ spec-analyzer → Analysis Report
    ├─ [user confirms]
    ├─ spec-writer → Draft Spec (v1) + State + Events
    ├─ spec-validator → Validation Report
    ├─ planner → Task Breakdown
    ↓
Implementation Ready
    ↓
    └─ /spec-publish → Frontend Scaffold (types, mocks, components)
```

### State Machine

```
idle → syncing → in_progress → verifying → completed → stable
                     ↑                          |
                     └──── (new version) ───────┘
```

## Document Types

### 1. Domain Spec (도메인 스펙)

Primary spec format. One per business domain.

**Path**: `docs/specs/{domain}.v{N}.md`
**Examples**: `order.v1.md`, `shipping.v2.md`, `payment.v1.md`

**When to use**: For feature areas with data models, business rules, and user flows.

### 2. Integration Spec (연동 스펙)

For external service integrations.

**Path**: `docs/specs/{service}-integration.v{N}.md`
**Examples**: `pg-integration.v1.md`, `s3-integration.v1.md`

**When to use**: When integrating a third-party service or API.

### 3. Migration Spec (마이그레이션 스펙)

For data or schema migrations.

**Path**: `docs/specs/{domain}-migration.v{N}.md`

**When to use**: For breaking changes that require data transformation.

## Template: Domain Spec

```markdown
# {Domain} Specification v{N}

> **Status**: draft | review | approved | implemented | deprecated
> **Author**: {author}
> **Created**: {YYYY-MM-DD}
> **Spec ID**: {domain-kebab-case}
> **Version**: {N}

## 1. Overview (개요)

{1-3 paragraphs describing the domain and purpose of this spec}

## 2. Problem Statement (문제 정의)

- **Current State**: {what exists today}
- **Pain Points**: {specific problems}
- **Impact**: {who is affected and how}

## 3. Requirements (요구사항)

### 3.1 Functional Requirements (기능 요구사항)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | {description} | critical | {measurable criteria} |

### 3.2 Non-Functional Requirements (비기능 요구사항)

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | Page load time | < 2s |
| NFR-002 | Security | Authentication required | JWT |

## 4. User Stories (사용자 스토리)

### US-001: {Title}
- **As a** {role}
- **I want** {capability}
- **So that** {benefit}
- **Acceptance Criteria**:
  - [ ] {criterion 1}
  - [ ] {criterion 2}
- **Related**: FR-001, FR-002

## 5. Data Model (데이터 모델)

### {Entity Name}

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |

### Relationships

- {Entity A} 1:N {Entity B}

## 6. API Contracts (API 계약)

### POST /api/v1/{resource}

**Request:**
```json
{
  "field": "value"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 400 | Validation failed |
| 401 | Not authenticated |
| 409 | Duplicate resource |

## 7. UI/UX Requirements (UI/UX 요구사항)

### Screens
- {Screen 1}: {description and key interactions}

### User Flows
1. {Step 1} → {Step 2} → {Step 3}

## 8. Dependencies (의존성)

| Dependency | Type | Status |
|------------|------|--------|
| {other-spec} | Internal spec | approved |
| {service} | External service | available |

## 9. Constraints & Assumptions (제약사항 및 가정)

### Constraints
- {constraint 1}

### Assumptions
- {assumption 1}

## 10. Glossary (용어집)

| Term | Definition |
|------|------------|
| {term} | {definition} |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v{N} | {date} | {description} |
```

## Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Spec file | `{domain}.v{N}.md` | `order.v1.md` |
| State file | `{domain}.json` | `order.json` |
| Event log | `{domain}.events.jsonl` | `order.events.jsonl` |
| Task file | `{domain}-v{N}.json` | `order-v1.json` |
| Requirement ID | `FR-NNN` / `NFR-NNN` | `FR-001` |
| User story ID | `US-NNN` | `US-001` |
| Task ID | `{domain}-v{N}-NNN` | `order-v1-001` |

## Priority Levels

| Priority | Definition | SLA |
|----------|-----------|-----|
| Critical | Blocks launch, no workaround | Must implement first |
| High | Important for launch, difficult workaround | Implement in current sprint |
| Medium | Desired for launch, acceptable workaround | Implement if time allows |
| Low | Nice to have, can defer | Next version |

## Quality Standards

### Requirement Quality (INVEST)

Good requirements are:
- **I**ndependent - No hidden coupling
- **N**egotiable - Not a fixed contract, room for discussion
- **V**aluable - Delivers user/business value
- **E**stimable - Can assess complexity
- **S**mall - Fits in a sprint
- **T**estable - Has measurable acceptance criteria

### Anti-Patterns to Avoid

- Vague requirements: "The system should be fast" → "Page loads in < 2s on 3G"
- Implementation-as-requirement: "Use Redis for caching" → "Support 1000 concurrent users"
- Missing actors: "Can create orders" → "Authenticated users can create orders"
- Untestable criteria: "Should be user-friendly" → "Task completion rate > 90%"

## Agent Orchestration

| Step | Agent | Input | Output |
|------|-------|-------|--------|
| 1. Analyze | `spec-analyzer` | Planning doc | Analysis report |
| 2. Write | `spec-writer` | Analysis report | Spec document |
| 3. Validate | `spec-validator` | Spec document | Validation report |
| 4. Plan tasks | `planner` | Validated spec | Task breakdown |
| 5. Architecture | `architect` | Complex specs | Design decisions |
