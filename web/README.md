# Quote & Invoice Builder — Web

Next.js (App Router) application serving both the responsive web UI and the REST API
(route handlers) for the Quote & Invoice Builder. See `../docs/` for the full spec and
`../CLAUDE.md` for development rules.

## Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4
- Prisma + PostgreSQL
- Auth.js (credentials provider, JWT sessions)
- Zod for validation

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL), or a PostgreSQL 16 instance you already have running

## Setup

```bash
cp .env.example .env
# edit .env — generate a real AUTH_SECRET with: npx auth secret

docker compose up -d        # starts PostgreSQL on localhost:5432

npm install
npm run prisma:migrate      # creates the database schema
npm run prisma:seed         # optional: demo@example.com / password123

npm run dev                 # http://localhost:3000
```

> Note: this scaffold was generated in a sandboxed environment where `npm install`
> could not be verified end-to-end against the real npm registry within the available
> time budget. Run `npm install` locally and report any dependency resolution errors —
> they should be quick to fix (mainly version pinning in `package.json`).

## Commands

| Command                  | Purpose                                   |
| ------------------------ | ------------------------------------------ |
| `npm run dev`             | Start the dev server                      |
| `npm run build`           | Production build                          |
| `npm run start`           | Run the production build                  |
| `npm run lint`            | ESLint                                     |
| `npm run typecheck`       | `tsc --noEmit`                             |
| `npm run test`            | Run unit tests (Vitest)                    |
| `npm run prisma:migrate`  | Create/apply a local migration             |
| `npm run prisma:studio`   | Browse the database                        |
| `npm run prisma:seed`     | Load demo data                             |

## Project Layout

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   Auth.js handler
│   │   ├── auth/register/route.ts        Registration endpoint
│   │   └── health/route.ts               Health check
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx                Placeholder — Phase 10
│   └── layout.tsx / page.tsx / providers.tsx
├── lib/
│   ├── auth.ts                           Auth.js config
│   ├── prisma.ts                         Prisma client singleton
│   └── validations/                      Zod schemas (shared client/server)
├── middleware.ts                         Route protection
└── types/next-auth.d.ts                  Session type augmentation
prisma/
├── schema.prisma
└── seed.ts
```

## Auth

Credentials-only for V1 (email + password), JWT sessions — no OAuth adapter tables.
`middleware.ts` protects every route except `/login`, `/register`, `/api/auth/*`, and
`/api/health`. See `docs/API Specification.md` and `docs/Database Design Document.md`
section 39 before changing this.

## Financial Rules

The backend is the authoritative source for all totals, tax, discount, and payment
calculations — the client is a preview only. See `CLAUDE.md`.
