# Quote & Invoice Builder — Sprint Plan

Tracks the one V1 milestone as a sequence of sprints, mapped to CLAUDE.md's Build Order
and the PRD. Each sprint is a shippable vertical slice on `main`. Only the next sprint
gets a full task breakdown — later sprints get a one-line scope note and are broken into
tasks when they start, so this doc doesn't drift stale.

---

## Milestone: V1 MVP

**Scope**: PRD §2 Primary Goals 1–8 — Auth, Business Profile, Customers, Products, Quotes,
Invoices (+ quote→invoice conversion), PDF generation, payment tracking, dashboard.

**Out of scope** (PRD §37 — do not implement): AI, WhatsApp, payment gateways, accounting,
inventory, team management, recurring invoices, multi-currency.

**Definition of Done** (PRD §41): core flow works end-to-end (Customer → Quote → PDF →
Invoice → Payment Status), financial calculations correct, user data isolated, responsive
on desktop/tablet/mobile web, critical business logic has automated tests, no known
critical security issues.

Mobile (Flutter, `mobile/`) is Phase 12 per CLAUDE.md — explicitly deferred until the web
API is stable. Not part of this milestone's sprints.

---

## Sprint Status

| # | Sprint | Status |
|---|--------|--------|
| 1 | Repo & Backend Foundation (DB, Prisma, `/health`) | ✅ Done |
| 2 | Auth (register/login/logout, ownership middleware) | ✅ Done |
| 3 | Business Profile | ✅ Done |
| 4 | Customers (CRUD, search, ownership) | ✅ Done |
| 5 | Products / Services (CRUD, search) | ✅ Done |
| 6 | Quotes — Calculation Engine & API | ✅ Done |
| 7 | Quotes — UI (list, create/edit, detail, status) | ✅ Done |
| 8 | Quotes — PDF generation | ✅ Done (PR #30) |
| 9a | Invoice API + Quote → Invoice Conversion | ✅ Done (PR #43) |
| 9b | Invoice UI (list, create, detail) | ✅ Done (PR #48) |
| 9c | Invoice PDF | ✅ Done (PR #53) |
| 10 | **Payments (record payment, status derivation)** | 🔵 Next |
| 11 | Dashboard (summary cards, recent documents) | ⬜ Not started |
| 12 | Responsive Polish (desktop/tablet/mobile web) | ⬜ Not started |
| 13 | QA pass + Deployment prep | ⬜ Not started |
| — | Integration/E2E test infrastructure (backlog, unscheduled) | ⬜ Backlog |

---

## Sprint 6 (done): Quotes — Calculation Engine & API

**Goal**: server-authoritative quote calculation and CRUD API, fully tested. No UI, no PDF
yet — those are Sprints 7–8.

**Docs to read first**: PRD §12–16, §31, §37; DB Design §12–17, §24–25, §35, §40; API
Spec §29–38, §61–63, §75–76.

### Tasks

- [ ] **Calculation engine** (`lib/quote-calculation.ts` or similar) — pure functions,
      no DB/HTTP. Per item: `gross = qty × unitPrice`, `taxable = gross - discount`,
      `tax = taxable × taxRate / 100`, `lineTotal = taxable + tax`. Header:
      `subtotal = Σ gross`, `discountAmount = Σ item discounts`, `taxAmount = Σ item tax`,
      `totalAmount = subtotal - discountAmount + taxAmount`. Decimal-string in/out, same
      pattern as `lib/format-decimal.ts` — no floating point.
- [ ] **Unit tests for calculation engine** — cover API Spec §76 Test 2 exactly
      (qty=2, price=10000, discount=1000, tax=18% → subtotal 20000, tax 3420, total 22420),
      plus zero-discount, zero-tax, multi-item, and rounding edge cases.
- [ ] **Quote number generation** — sequential per user (`Q-00001`), concurrency-safe
      (DB Design §54 DoD item). Decide mechanism (e.g. `SELECT ... FOR UPDATE` counter row,
      or transaction-scoped `COUNT`); document the choice.
- [ ] **Validation schemas** (`lib/validations/quote.ts`) — header (customerId, quoteDate,
      expiryDate, notes, terms) and item rules (API Spec §34: `quantity > 0`,
      `unitPrice >= 0`, `discountAmount >= 0`, `0 <= taxRate <= 100`). Mirror the
      decimal-string pattern from `lib/validations/product.ts`.
- [ ] **`POST /api/v1/quotes`** — validate customer ownership, validate product ownership
      per item (when `productId` given), snapshot item fields (name/description/unit/price/
      taxRate — DB Design §16, never live-reference the product), calculate totals
      server-side, generate quote number, create quote + items in one transaction.
- [ ] **`GET /api/v1/quotes`** — paginated, filter by `status`/`customerId`/`dateFrom`/
      `dateTo`, search, ownership-scoped (mirror `customers`/`products` list routes).
- [ ] **`GET /api/v1/quotes/:id`** — full detail incl. items; 404 (not 403) outside
      ownership, per API Spec §60.
- [ ] **`PUT /api/v1/quotes/:id`** — editable only in `DRAFT` (API Spec §35); reject
      otherwise with a clear error.
- [ ] **`DELETE /api/v1/quotes/:id`** — only `DRAFT` (API Spec §36) →
      `QUOTE_NOT_DRAFT` 409 otherwise.
- [ ] **`PATCH /api/v1/quotes/:id/status`** — state machine per API Spec §37–38
      (`DRAFT→SENT`, `SENT→ACCEPTED|REJECTED|EXPIRED`, nothing else); reject invalid
      transitions with `INVALID_STATUS_TRANSITION`.
- [ ] **API route tests** — ownership isolation (API Spec §76 Test 1 pattern), invalid
      status transitions rejected, non-DRAFT edit/delete rejected, validation errors on
      bad items. (First route-level tests in the repo — schema tests exist, route tests
      don't yet; stand up whatever harness is needed, e.g. mocking `getCurrentUser`.)

**Explicitly not in this sprint**: quote UI, PDF generation, quote→invoice conversion
(that reads an `ACCEPTED` quote but is Sprint 9's concern since it creates an `Invoice`).

---

## Sprint 9a (done): Invoice API + Quote → Invoice Conversion

**Goal**: Invoice CRUD API (same shape as Quotes) + quote→invoice transactional
conversion, fully tested. No UI, no PDF yet — those are Sprints 9b–9c.

**Docs to read first**: PRD §18–23; DB Design §18–27; API Spec §41–53, §60.

Full task breakdown tracked as GitHub issues under milestone "Sprint 9a: Invoice API +
Quote-to-Invoice Conversion" (issues #32–#42):

1. Generalize `lib/quote-calculation.ts`/`quote-number.ts`/`quote-ownership.ts` into
   document-agnostic versions (Web Dev Standards §19 names the target shape,
   `calculateDocumentTotals()`) — no behavior change, rerun quote tests first.
2. Extract shared `documentItemSchema` from `lib/validations/quote.ts`.
3. `lib/validations/invoice.ts`, `lib/serialize-invoice.ts` (adds `remainingAmount`).
4. `POST`/`GET /api/v1/invoices`, `GET`/`PUT`/`DELETE /api/v1/invoices/:id` — mirror the
   quotes routes exactly; `PUT`/`DELETE` restricted to `DRAFT`.
5. `POST /api/v1/quotes/:id/convert-to-invoice` — verify `ACCEPTED` + not already
   converted, copy customer/items as fresh snapshots, recalculate totals, one
   transaction.
6. Route tests: ownership isolation, DRAFT-only enforcement, conversion rejection cases.

**Explicitly not in this sprint**: invoice UI, invoice PDF, payment recording (Sprint 10).

---

## Sprint 10 (current): Payments

**Goal**: record payments against an invoice, with server-derived status
(`UNPAID`/`PARTIALLY_PAID`/`PAID`), fully tested.

**Docs to read first**: PRD §22; API Spec §50–52; Code & Development Workflow §39
("test concurrent payments").

Full task breakdown tracked as GitHub issues under milestone "Sprint 10: Payments"
(issues #54–#56):

1. `POST /api/v1/invoices/:id/payment` — validate `amount > 0` and
   `paidAmount + amount <= totalAmount`, reject on an already-`PAID` or `DRAFT` invoice,
   optimistic-concurrency update to prevent an overpayment race, derive status
   (`PARTIALLY_PAID` vs `PAID`, set `paidDate` when fully paid).
2. Route tests: validation, already-paid rejection, status derivation, concurrent-payment
   race (mirrors the quote-number/conversion race tests from Sprints 6 and 9a).
3. Record Payment form on the invoice detail page, replacing today's "coming in a later
   update" placeholder for `UNPAID`/`PARTIALLY_PAID` invoices.

**Note**: the schema has a single `paymentNotes` field on `Invoice`, not a payment
history table — this is a fixed V1 simplification (see DB Design), not something to work
around with an ad-hoc history mechanism.

## Later Sprints (scope only, not yet broken into tasks)

- **Sprint 11 — Dashboard**: summary cards + recent quotes/invoices (API Spec §54–56).
- **Sprint 12 — Responsive Polish**: PRD §25 breakpoints, table→card transforms on mobile.
  Also the natural point to adopt shadcn/ui (Architecture Decisions ADR-2) since this
  sprint is already touching every screen's accessibility/responsive behavior.
- **Sprint 13 — QA & Deployment prep**: Testing & QA Spec, Deployment & Infrastructure
  Spec — full pass before considering V1 shippable.

## Backlog (unscheduled)

- **Integration/E2E test infrastructure** — test Postgres database config (separate from
  dev DB, per Testing & QA Spec §7), Playwright setup for the critical E2E flow (§61,
  Register → Quote → PDF → Invoice → Payment → Paid), fixture/factory functions
  (`createTestUser()`, `createTestCustomer()`, etc. per §8-9). Currently only 110 unit
  tests exist (mocked Prisma/auth). See Architecture Decisions ADR-6. Not assigned to a
  sprint number yet — schedule explicitly when picked up, rather than folding into a
  feature sprint.
