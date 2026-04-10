---
description: "Generate TypeScript types, mock data, and frontend components from a spec. Enables frontend publishing without backend."
argument-hint: "[spec domain name] (e.g., order)"
---

# Spec Publish Command (스펙 기반 프론트엔드 퍼블리싱)

> Converts spec data models into types + mock data + MSW handlers + frontend components.

**Input**: $ARGUMENTS

---

## Your Role

You are the spec-to-frontend orchestrator. You take a validated spec and produce everything needed for frontend publishing with mock data.

**Available agents:**
- `spec-publisher` — Generate types, mocks, and scaffold components
- `architect` — Resolve data model questions
- Existing skills: `frontend-design`, `frontend-patterns`, `nestjs-patterns`

---

## Process

### Step 0: SCAN FRONTEND STRUCTURE (mandatory)

Before any generation, scan the existing frontend to understand patterns:

1. **Read `CLAUDE.md`** — project structure, tech stack
2. **Read `frontend/AGENTS.md`** — Next.js 16 breaking changes warning
3. **Scan existing files**:
   - `frontend/app/**/page.tsx` — route groups and pages
   - `frontend/components/**/*.tsx` — component organization
   - `frontend/mocks/**/*` — MSW setup status
   - `frontend/types/**/*` — existing types
   - `frontend/lib/**/*` — existing utilities (client.ts, etc.)
4. **Determine target route group** from user input:
   - "관리자 로그인" / "관리자 대시보드" / "사용자관리" → `(admin)` group, pages in `app/(admin)/admin/`, components in `components/admin/`
   - "로그인" / "회원가입" / "주문" / "프로필" / customer features → `(user)` group, pages in `app/(user)/`, components in `components/user/`
   - Shared auth components (LoginForm, RegisterForm) → `components/auth/`
5. **Reuse existing code** — if `lib/api/client.ts` exists, import it; don't create a new one

**GATE**: Must complete scan before proceeding.

---

### Step 1: LOCATE SPEC

**If domain name + page description provided** (e.g., `rbac 관리자 로그인페이지`):
1. Read `docs/specs/{domain}.v{N}.md` (latest version)
2. Extract Data Model section
3. Extract API Contracts section — only endpoints relevant to the requested page
4. Extract UI/UX Requirements section — only the requested page/feature
5. **Determine output paths** based on Step 0 route group analysis

**If only domain name provided:**
1. Read the spec
2. Ask which page/feature to publish

**If no input:**
> 어떤 스펙을 기반으로 퍼블리싱하시겠습니까?
>
> 사용 가능한 스펙 목록을 확인합니다...

List specs in `docs/specs/` and ask user to choose.

**GATE**: Confirm spec found AND target route group determined before proceeding.

---

### Step 2: GENERATE TYPES

From the spec's Data Model section, generate TypeScript interfaces:

**Output**: `frontend/types/{domain}.ts`

Rules:
- Every entity in the spec → one TypeScript interface
- DB snake_case → TypeScript camelCase
- enum columns → union literal types
- Nullable/optional fields → `fieldName?: Type`
- Add `/** @spec FR-NNN */` JSDoc for traceability
- Export all types

**Example:**
```typescript
/** @spec order.v1 — Application entity */
export interface Application {
  /** @spec FR-001 — 신청서ID: FD{YYYYMMDD}{seq} (배송) or PA{YYYYMMDD}{seq} (구매) */
  id: string;
  mailboxId: string;
  orderType: 'shipping' | 'purchasing';
  warehouseCode: 'WH001' | 'WH002' | 'WH003' | 'WH004';
  transportMethod: 'SEA' | 'AIR';
  importMethod: 'PCE' | 'BS';
  customsType: 'list' | 'general';
  status: 'draft' | 'saved' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}
```

---

### Step 3: GENERATE MOCK FIXTURES

From types + spec business rules, create realistic mock data:

**Output**: `frontend/mocks/fixtures/{domain}.fixtures.ts`

Rules:
- Korean realistic data (names: 홍길동, 김철수; addresses: 서울시 강남구...)
- Follow spec business rules for data consistency
- Include at least:
  - 3 happy-path records (목록통관, 일반통관, 사업자)
  - 2 edge-case records (통관유형 자동변경 케이스)
- All related entities linked correctly (FK relationships)

---

### Step 4: GENERATE MSW HANDLERS

From spec API Contracts, create mock API handlers:

**Output**: `frontend/mocks/handlers/{domain}.handlers.ts`

Rules:
- Every API endpoint in spec → one MSW handler
- Response format matches spec exactly
- POST handlers accept request body, return mock response
- GET handlers return fixture data
- Include error responses for validation failures
- Add realistic delays (100-300ms) for loading state testing

---

### Step 5: MSW SETUP

Check if MSW is already configured. If not, set up:

**Output**: `frontend/mocks/browser.ts`, `frontend/mocks/index.ts`

```typescript
// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { orderHandlers } from './handlers/order.handlers';

export const worker = setupWorker(...orderHandlers);
```

Wire into Next.js dev mode via `app/layout.tsx` or a provider.

---

### Step 6: GENERATE API CLIENT

Create a typed API client that works with both mock (MSW) and real backend:

**Output**: `frontend/lib/api/{domain}-api.ts`

```typescript
// lib/api/order-api.ts
import type { Application, CreateOrderRequest } from '@/types/order';

const BASE = '/api/v1';

export const orderApi = {
  submit: (data: CreateOrderRequest) =>
    fetch(`${BASE}/orders`, { method: 'POST', body: JSON.stringify(data) })
      .then(res => res.json()),

  saveDraft: (data: Partial<CreateOrderRequest>) =>
    fetch(`${BASE}/orders/draft`, { method: 'POST', body: JSON.stringify(data) })
      .then(res => res.json()),
  // ...
};
```

---

### Step 7: SCAFFOLD COMPONENTS

From spec UI/UX Requirements, generate component shells.

**Output path depends on the target route group determined in Step 0:**
- Customer pages → `frontend/components/user/{feature}/{Component}.tsx`
- Admin pages → `frontend/components/admin/{feature}/{Component}.tsx`
- Shared auth components → `frontend/components/auth/{Component}.tsx`

**Page files follow the same pattern:**
- Customer → `frontend/app/(user)/{path}/page.tsx`
- Admin → `frontend/app/(admin)/admin/{path}/page.tsx`

For each UI section in spec:
1. Create component file with correct props/types
2. Import mock data for initial rendering
3. Add form fields matching spec required/optional fields
4. Use shadcn/ui components (project convention) — install missing ones via `npx shadcn@latest add`
5. Add Zod validation schemas in `frontend/lib/validations/{domain}.ts`
6. **Reuse existing utilities** — import from `@/lib/api/client.ts` if it exists

**DO NOT** generate final polished UI — create functional scaffolds that:
- Render all fields from the spec
- Accept and submit data correctly
- Show loading/error states
- Can be styled later by a designer

---

### Step 8: SUMMARY

```markdown
## 퍼블리싱 준비 완료

### 생성된 파일
- 📐 Types: `frontend/types/{domain}.ts`
- 📦 Fixtures: `frontend/mocks/fixtures/{domain}.fixtures.ts`
- 🔌 Handlers: `frontend/mocks/handlers/{domain}.handlers.ts`
- 🌐 API Client: `frontend/lib/api/{domain}-api.ts`
- 🧩 Components: `frontend/components/user/{domain}/`

### 실행 방법
1. `cd frontend && pnpm dev`
2. MSW가 콘솔에 "[MSW] Mocking enabled" 출력 확인
3. 신청서 페이지 접근하여 목데이터로 동작 확인

### 백엔드 연동 시
1. MSW 비활성화 (환경변수 또는 코드 제거)
2. API 클라이언트 URL이 실제 백엔드를 가리키도록 확인
3. Types는 그대로 유지 (계약 역할)
```

---

## Related Commands

- `/spec-gen` — 기획서 → 스펙 변환
- `/plan` — 구현 계획
- `/feature-dev` — 기능 개발 워크플로
- `/prp-implement` — 전체 구현
