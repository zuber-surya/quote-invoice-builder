# Quote & Invoice Builder

## Project

Simple quote and invoice management application for freelancers and small businesses.

Platforms:
- Responsive Web
- Android
- iOS (mobile built after the web API is stable — see docs/Code & Development Workflow.md)

## Architecture

Web:
Next.js (App Router) + React + TypeScript, in `web/`

Backend:
Next.js API route handlers inside `web/` — there is no separate backend service.

Mobile:
Flutter + Dart + Riverpod, in `mobile/` (Phase 12 — not started until web API is stable)

Database:
PostgreSQL + Prisma

Auth:
Auth.js

## Documentation Is the Source of Truth

`docs/` contains the full V1 specification: PRD, System Architecture, Database Design,
API Specification, UI/UX Specification, Web Development Standards, Mobile Development
Standards, Testing & QA Specification, Deployment & Infrastructure Specification, and
the Code & Development Workflow doc (which this file is derived from).

Before implementing a feature, read the relevant doc(s) first. When documents conflict,
resolve in this order: Business Requirement (PRD) → System Requirement → Architecture →
API/Database → UI/UX → Implementation. If an implementation would conflict with a
higher-level requirement, raise it — do not silently change the requirement.

## Known Deviations From the Standards

`docs/Web Development Standards.md` and `docs/Testing & QA Specification.md` are
mandatory, but a few things are knowingly not (yet) followed — see
`docs/Architecture Decisions.md` for the full rationale and when to revisit each one:
no Service/Repository layers (routes call Prisma directly), shadcn/ui not adopted (plain
Tailwind), no centralized `lib/api/` client, on-demand PDF generation (no object
storage), no integration/E2E test infrastructure yet (unit tests with mocked
Prisma/auth only). Don't silently "fix" these mid-feature — they're tracked decisions,
not bugs.

## Important Rules

1. Read relevant documentation before implementing features.
2. Do not modify unrelated files.
3. Do not duplicate components or business logic.
4. No inline CSS.
5. Use Tailwind CSS and shadcn/ui for web.
6. Use centralized Flutter theme/components for mobile.
7. Use strict TypeScript.
8. Avoid `any`.
9. Validate all external input (client-side AND server-side; server-side is mandatory).
10. Backend is authoritative for financial calculations. Client-side totals are preview only.
11. Backend is authoritative for authorization. Every query touching business data must
    filter by the authenticated user's ownership (user_id).
12. Never expose secrets. Store secrets only in environment variables.
13. Add tests for critical business logic (quote/invoice calculations, status transitions,
    payment logic, ownership isolation).
14. Run lint, type checking and tests after changes.
15. Do not introduce dependencies without justification.
16. Do not implement V2 features unless explicitly requested (see "Out of Scope — V1" in
    the PRD: no AI, WhatsApp, payment gateways, accounting, inventory, team management,
    recurring invoices, multi-currency).
17. Do not silently change API contracts.
18. Do not silently change database schema.
19. Never remove tests to make CI pass.
20. Keep implementation simple and appropriate for MVP.

## Before Coding

1. Read relevant docs.
2. Inspect existing implementation.
3. Identify affected files.
4. Create a short implementation plan (Feature / Goal / Existing code / Files to modify /
   Files to create / API changes / Database changes / UI changes / Tests / Risks).
5. Implement the smallest correct change.
6. Run tests and validation.
7. Review the diff.

## Financial Rules

Never trust client calculations. Server must validate:
- totals, tax, discount
- payment and payment status
- quote status and invoice status
- quote-to-invoice conversion

Money fields use NUMERIC/DECIMAL(15,2) — never floating point. Quantity uses
NUMERIC(12,3). Tax rate uses NUMERIC(5,2), constrained 0–100.

Quote/invoice line items snapshot product data (name, description, unit, price, tax
rate) at creation time. They do not live-reference products — historical documents must
not change when product data changes later.

## Naming Conventions

Component/utility files use **kebab-case** (`customer-form.tsx`, `format-decimal.ts`),
not the PascalCase suggested in Web Development Standards §80 — see
`docs/Architecture Decisions.md` ADR-4. This is the project's adopted convention, not
debt; don't rename existing files to match the doc.

## Git

Use conventional commits: `feat:` `fix:` `refactor:` `test:` `docs:` `chore:` `build:` `ci:`

Keep commits focused — one logical change per commit. Prefer small, verifiable
increments over large multi-feature commits.

Branch strategy: `main` is always stable. Feature work happens on `feature/*` branches
(e.g. `feature/customers`, `feature/quotes`) merged via PR.

PRs use `.github/pull_request_template.md`. CI (`.github/workflows/ci.yml` — install,
lint, typecheck, unit tests, build) must pass before merge; it does not yet run
integration/E2E tests (see Architecture Decisions ADR-6).

## Forbidden

Do not:
- use inline CSS
- hardcode secrets
- use `any` to bypass errors
- duplicate components
- duplicate business logic
- put database queries inside React components
- put HTTP calls directly in Flutter widgets
- disable lint rules without justification
- disable TypeScript checks
- remove tests
- rewrite unrelated modules

## Build Order

Repo setup → Backend foundation (DB connection, Prisma, error handling, logging,
`/health`) → Database schema → Auth → Business Profile → Customers → Products →
Quotes (calculation logic + tests first, then API, then UI, then PDF) → Invoices
(+ quote→invoice conversion) → Payments → Dashboard → Responsive polish → Flutter
mobile → QA → Deployment.

Full detail in `docs/Code & Development Workflow.md`.
