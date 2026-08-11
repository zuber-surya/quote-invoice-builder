# Quote & Invoice Builder — Architecture Decisions

Records deliberate deviations from the mandatory standards in `docs/Web Development
Standards.md` and `docs/Testing & QA Specification.md`, so future sessions (human or
Claude Code) treat them as decisions, not oversights. Update this file whenever a new
deviation is knowingly accepted, or when one of these is resolved.

---

## ADR-1: No Service/Repository layers (yet)

**Standard**: Web Development Standards §21-29 — route handlers should be thin, calling a
Service layer, which calls a Repository layer, which calls Prisma.

**Actual**: `web/src/app/api/v1/**/route.ts` files call `prisma` directly. No
`services/` or `repositories/` directories exist.

**Rationale**: Through Customers, Products, and Quotes, every route's logic is a single
CRUD operation or a short calculation pipeline (see `lib/quote-calculation.ts`,
`lib/quote-ownership.ts`) — there's no cross-route reuse need yet that the extra
indirection would pay for. CLAUDE.md rule 20 / Web Dev Standards §20 both say "do not
over-engineer V1."

**Revisit when**: A route's logic needs to be called from more than one place (e.g.
quote→invoice conversion in Sprint 9 reusing quote-total-calculation logic that also
needs to run from a dashboard aggregation), or a route handler grows past what's
comfortably readable in one file.

---

## ADR-2: shadcn/ui not adopted

**Standard**: Web Development Standards §33 (and CLAUDE.md rule 5) — Tailwind CSS +
shadcn/ui for web.

**Actual**: Every form/list/detail page (`customer-form.tsx`, `product-form.tsx`,
`quote-form.tsx`, `quote-list.tsx`, etc.) uses hand-rolled Tailwind markup — no shadcn/ui
components are installed.

**Rationale**: Not a considered trade-off — this was simply never set up before the first
CRUD screen (Business Profile) was built, and every subsequent screen mirrored that
pattern for consistency with what already existed. This is real technical debt, not an
accepted simplification like ADR-1.

**Revisit when**: Before Responsive Polish (Sprint 12) at the latest — shadcn's
accessible primitives directly serve Web Dev Standards §64 (Accessibility) and §37-39
(responsive tables/forms), which that sprint is explicitly about. Doing the shadcn
migration then, in one focused pass, is cheaper than mixing it into every future feature
sprint.

---

## ADR-3: No centralized `lib/api/` client

**Standard**: Web Development Standards §44-45 — a centralized API client
(`lib/api/customers.ts`, etc.) rather than `fetch()` scattered through components.

**Actual**: Every client component (`customer-list.tsx`, `product-form.tsx`,
`quote-form.tsx`, ...) calls `fetch("/api/v1/...")` directly.

**Rationale**: Same as ADR-2 — never set up, every screen since has mirrored it.

**Revisit when**: Bundled with the shadcn migration (ADR-2) or whenever the number of
distinct `fetch()` call sites starts causing real duplication pain (e.g. auth-error
handling logic drifting between components).

---

## ADR-4: File naming — kebab-case, not PascalCase

**Standard**: Web Development Standards §80 — React component files in PascalCase
(`CustomerForm.tsx`).

**Actual**: Every component file uses kebab-case (`customer-form.tsx`,
`quote-status-actions.tsx`).

**Status**: **Adopted as the project's actual convention**, not debt. This matches the
Next.js App Router / shadcn community norm (route files are already lowercase —
`page.tsx`, `route.ts` — so kebab-case component files sit more consistently alongside
them than PascalCase would). CLAUDE.md now states this explicitly so it isn't
re-litigated per PR.

---

## ADR-5: Quote PDF generated on demand, no object storage

**Standard**: Deployment & Infrastructure Specification §29-33 — generated PDFs should
live in object storage (S3/R2/Supabase Storage), not be regenerated per request.

**Actual**: `GET /api/v1/quotes/:id/pdf` (Sprint 8, PR #30) renders the PDF fresh on
every request and streams it directly; nothing is persisted.

**Rationale**: API Specification §40 explicitly allows either approach for V1. Adding
object storage now would mean a second, unrequested infrastructure dependency (a storage
provider, credentials, bucket setup) on top of the PDF library decision already made.
Known cost: ~30s cold-start on the first PDF request per server process
(`@react-pdf/renderer`'s font/layout-engine init), ~1.5s after. Not a V1 blocker per PRD
§35's own non-binding performance targets, but worth remembering if serverless cold
starts become a real complaint.

**Revisit when**: Invoice PDFs (Sprint 9) are added — if regeneration cost becomes
noticeable at that point, object storage is the fix, and the two document types (quote +
invoice PDFs) can share the same storage-key structure Deployment Spec §30 already
recommends.

---

## ADR-6: Integration tests and E2E — deferred

**Standard**: Testing & QA Specification §5-9, §90-93 — integration tests against a real
test database, Playwright E2E for the critical flow (Register → Quote → PDF → Invoice →
Payment → Paid).

**Actual**: 110 tests exist, all unit-level — Zod schema tests and API route tests with
`prisma`/`getCurrentUser` mocked via `vi.mock`. No test database config, no fixture
factories (`createTestUser()` etc.), no Playwright.

**Rationale**: Meaningful new infrastructure (test DB provisioning/teardown, Playwright
install and config, fixture factories) — sizable enough to deserve its own scoped sprint
rather than being folded into either a feature sprint or this governance pass. Tracked as
a backlog item in `docs/Sprint Plan.md`.

**Revisit when**: Scheduled explicitly — see Sprint Plan.md's backlog section.
