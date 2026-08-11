# Quote & Invoice Builder

A simple quote and invoice management application for freelancers, small businesses,
contractors, and service providers. Core flow: **Customer → Quote → PDF → Invoice →
Payment Status**.

## Repository Structure

```text
quote-invoice-builder/
├── docs/          Full V1 specification (source of truth — read before building)
├── web/           Next.js app: web UI + REST API (route handlers) + Prisma
├── mobile/        Flutter app (not started — built after the web API is stable)
├── CLAUDE.md      Instructions for AI-assisted development in this repo
└── README.md      This file
```

There is no separate `backend/` service — the Next.js app in `web/` serves both the UI
and the API, per `docs/API Specification.md`.

## Documentation

Everything about scope, architecture, database, API, UI, and standards lives in `docs/`:

- `Product Requirements Document.md` — what V1 does and does not include
- `System Architecture Document.md`
- `Database Design Document.md`
- `API Specification.md`
- `UI-UX Specification.md`
- `Web Development Standards.md` / `Mobile Development Standards.md`
- `Testing & QA Specification.md`
- `Deployment & Infrastructure Specification.md`
- `Code & Development Workflow.md` — how features get planned, branched, and shipped

Read the relevant doc before implementing a feature. See `CLAUDE.md` for the full rules.

## Status

MVP in progress, Sprint 8 of 13 complete. Current state:

- [x] Repository structure, `CLAUDE.md`, docs
- [x] Next.js + TypeScript + Tailwind scaffold (`web/`)
- [x] Prisma schema for all V1 domain tables
- [x] Auth.js credentials login/register (JWT sessions) + protected routes
- [x] `/api/health` check
- [x] Business Profile
- [x] Customers (CRUD, search, ownership isolation)
- [x] Products/Services (CRUD, search)
- [x] Quotes — calculation engine, CRUD API, list/create/edit/detail UI, status
      transitions (merged)
- [x] Quotes — PDF generation (PR #30, unmerged as of this writing)
- [ ] Invoices (+ quote→invoice conversion, PDF)
- [ ] Payments / dashboard
- [ ] Responsive polish
- [ ] Flutter mobile app
- [x] CI (`.github/workflows/ci.yml` — install/lint/typecheck/unit test/build)
- [ ] Deployment
- [ ] Integration/E2E test infrastructure (tracked as a backlog item in
      `docs/Sprint Plan.md` — see `docs/Architecture Decisions.md` ADR-6)

See `docs/Sprint Plan.md` for the full sprint breakdown and
`docs/Architecture Decisions.md` for deliberate deviations from the standards docs.

## Local Development

See `web/README.md` for setup and commands. In short:

```bash
cd web
cp .env.example .env
docker compose up -d      # starts local PostgreSQL
npm install
npm run prisma:migrate
npm run prisma:seed       # optional demo data
npm run dev
```

## Development Workflow

This repo follows the process in `docs/Code & Development Workflow.md`: one requirement
→ one issue → one focused implementation → tests → review → merge. Features are built in
the order listed there (Foundation → Customers → Products → Quotes → Invoices →
Payments → Dashboard → Responsive polish → Mobile → QA → Deployment).
