# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HubNext (허브넥스트) - A proxy purchasing/shipping service (구매대행/배송대행) platform. The domain spec is in `대행신청.md` (Korean). The project uses a spec-driven development workflow where domain documents are converted into versioned development specs under `docs/`.

## Architecture

Monorepo with two independent packages (no shared workspace root):

- **`frontend/`** - Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui (radix-nova style)
- **`backend/`** - NestJS 11 + SWC compiler

Each package has its own `pnpm-lock.yaml`. Run `pnpm install` inside each directory separately.

**Important:** The frontend uses Next.js 16 which has breaking changes from earlier versions. Always check `frontend/node_modules/next/dist/docs/` before using Next.js APIs.

## Directory Structure

```
agents-example/
├── frontend/                  # Next.js 16 App Router
│   ├── app/                   # App Router pages & layouts
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── forbidden.tsx      # 403 page
│   │   ├── globals.css        # Tailwind + CSS variables
│   │   ├── (user)/            # Customer route group
│   │   │   ├── login/         # /login — customer login
│   │   │   ├── register/      # /register — customer registration
│   │   │   └── order/         # /order — order form
│   │   └── (admin)/           # Admin route group
│   │       └── admin/         # /admin/* URL prefix
│   │           ├── login/     # /admin/login — admin login (no sidebar)
│   │           └── (dashboard)/ # Authenticated admin pages (with sidebar)
│   │               ├── layout.tsx  # Sidebar + header layout
│   │               └── page.tsx    # /admin — dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── user/              # Customer feature components
│   │   ├── admin/             # Admin feature components
│   ├── hooks/                 # Custom React hooks (@/hooks)
│   ├── stores/                # State management (e.g., Zustand)
│   ├── lib/
│   │   ├── utils.ts           # cn() helper (clsx + tailwind-merge)
│   │   ├── api/               # API clients (client.ts)
│   │   └── validations/       # Zod schemas per domain
│   └── public/                # Static assets
├── backend/                   # NestJS 11 API server
│   ├── src/
│   │   ├── main.ts            # Bootstrap (port: env.PORT ?? 3000)
│   │   ├── app.module.ts      # Root module
│   │   ├── app.controller.ts  # Root controller
│   │   └── app.service.ts     # Root service
│   └── test/                  # E2E tests (Jest)
├── docs/                      # Spec-driven workflow
│   ├── specs/                 # Versioned domain specs ({domain}.v{N}.md)
│   ├── state/                 # Spec progress tracking (JSON + JSONL)
│   └── tasks/                 # Generated task files per spec version
```

## Commands

### Frontend (`cd frontend`)

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
```

Path alias: `@/*` maps to the frontend root.

### Backend (`cd backend`)

```bash
pnpm start:dev    # Dev server with watch mode
pnpm build        # Production build (nest build)
pnpm lint         # ESLint with auto-fix
pnpm format       # Prettier

# Tests
pnpm test         # Unit tests (Jest)
pnpm test:watch   # Watch mode
pnpm test:cov     # Coverage report
pnpm test:e2e     # E2E tests (jest-e2e config)
```

Backend listens on `process.env.PORT ?? 3000`.

## Spec-Driven Workflow

Domain specs live in `docs/specs/` with versioned filenames (`{domain}.v{N}.md`). Progress tracking uses JSON files:

- `docs/state/` - Spec state and event logs (schema: `docs/state/_schema.json`)
- `docs/tasks/` - Generated task files per spec version (schema: `docs/tasks/_schema.json`)

Spec lifecycle: `idle -> syncing -> in_progress -> verifying -> completed -> stable`

## Tech Stack

### Frontend

| Category          | Tech                                      | Version |
| ----------------- | ----------------------------------------- | ------- |
| Framework         | Next.js (App Router, RSC)                 | 16.2    |
| UI Library        | React                                     | 19.2    |
| Language          | TypeScript                                | 5.x     |
| Styling           | Tailwind CSS                              | 4.x     |
| Component Library | shadcn/ui (radix-nova)                    | -       |
| Icons             | lucide-react                              | 1.8     |
| Server State      | TanStack React Query                      | 5.97    |
| Client State      | Zustand                                   | -       |
| Validation        | Zod                                       | -       |
| CSS Utility       | clsx + tailwind-merge (via `@/lib/utils`) | -       |
| Animation         | tw-animate-css                            | 1.4     |
| Bundler           | Turbopack (Next.js built-in)              | -       |

### Backend

| Category       | Tech                                   | Version   |
| -------------- | -------------------------------------- | --------- |
| Framework      | NestJS                                 | 11.x      |
| Language       | TypeScript                             | 5.x       |
| Compiler       | SWC                                    | -         |
| HTTP           | Express (via @nestjs/platform-express) | -         |
| Testing        | Jest + ts-jest + Supertest             | 29.x      |
| Database       | Prisma + MariaDB                       | -         |
| Authentication | JWT (HttpOnly Cookie)                  | -         |
| Linting        | ESLint + Prettier                      | 9.x / 3.x |

### Shared

| Category        | Tech                                     |
| --------------- | ---------------------------------------- |
| Package Manager | pnpm                                     |
| Node Target     | ES2023 (backend), ES2017 (frontend)      |
| Monorepo        | Independent packages (no workspace root) |
