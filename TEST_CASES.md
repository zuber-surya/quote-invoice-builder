# Manual Browser Test — Quote → Invoice → PDF Golden Path

Executed via Playwright MCP (`@playwright/mcp`) against `npm run dev` on
`localhost:3000`, branch `feature/invoice-pdf` (Sprint 9a–9c: Invoice API,
Invoice UI, Invoice PDF). Covers the PRD §41 Definition of Done core flow:
Customer → Quote → PDF → Invoice → Payment Status (payment recording itself
is Sprint 10, not yet built).

**Date**: 2026-08-11
**Tester**: Claude (browser automation), reviewed by Zuber
**Test account**: `sprint9c-test@example.com` (fresh user, created for this run)

## Result summary

| Result | Count |
|---|---|
| ✅ Pass | 18 |
| ⚠️ Finding (non-blocking) | 0 |
| ❌ Fail | 0 |

## Test cases

| # | Area | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|
| 1 | Register | Fill name/email/password on `/register`, submit | Account created, redirected into the app | Redirected to `/business-profile` | ✅ |
| 2 | Business Profile | Fill business name, owner, address, save | Profile saved, redirected to dashboard | Redirected to `/dashboard` | ✅ |
| 3 | Customer create | `/customers/new`, fill name + email, submit | Customer created, redirected to detail page | Created "Acme Retail Pvt Ltd", redirected to detail | ✅ |
| 4 | Product create | `/products/new`, fill name/unit/price/tax, submit | Product created (201), redirected to detail | "Website Design Package" ₹25000, 18% tax created | ✅ |
| 5 | Quote create — product autofill | On `/quotes/new`, select customer, select product in item row | Name/unit/price/tax auto-populate from product | All fields auto-filled correctly | ✅ |
| 6 | Quote create — live preview | Same form | Summary panel recalculates client-side as a UX preview | Subtotal 25000.00, Tax 4500.00, Total 29500.00 | ✅ |
| 7 | Quote create — server totals | Submit quote | Server recalculates and matches the preview exactly | Detail page shows identical 25000/0/4500/29500.00; number `Q-00001` generated | ✅ |
| 8 | Quote status: Draft → Sent | Click "Send / Mark as Sent" | Status badge updates to Sent, PDF link + accept/reject actions appear | Status → "Sent", correct actions shown | ✅ |
| 9 | Quote PDF | Open `/api/v1/quotes/:id/pdf` | 200, renders business/customer/items/totals correctly | Rendered correctly (see evidence), 200 OK | ✅ |
| 10 | Quote status: Sent → Accepted | Click "Mark Accepted" | Status → Accepted, "Convert to Invoice" button appears | Correct | ✅ |
| 11 | Quote → Invoice conversion | Click "Convert to Invoice" | `POST convert-to-invoice` → 201, redirect to new invoice detail | Redirected to `INV-00001`, totals match quote (29500.00), "Converted from quote Q-00001" link shown | ✅ |
| 12 | Invoice PDF (converted) | Open `/api/v1/invoices/:id/pdf` | 200, shows INVOICE title, status, Paid/Balance Due rows | Rendered correctly: "Unpaid", Paid 0.00, Balance Due 29500.00 | ✅ |
| 13 | Already-converted quote revisit | Reload the now-Accepted, now-converted quote's detail page | Button shows "View Invoice" (not "Convert to Invoice" re-triggering `QUOTE_ALREADY_CONVERTED`) | Correctly showed "View Invoice" linking to `INV-00001` | ✅ |
| 14 | Invoice list | `/invoices` | Table lists invoices with remaining amount + status badge | `INV-00001` listed correctly, status "Unpaid" | ✅ |
| 15 | Invoice list — search | Type invoice number into search box | Debounced filter narrows to matching rows | Matched `INV-00001` | ✅ |
| 16 | Invoice list — no match | Type a non-matching search term | Empty state: "No invoices match your filters." | Shown correctly | ✅ |
| 17 | Invoice direct create — discount calc | `/invoices/new`, qty=2, price=10000.00, discount=1000.00, tax=18% (API Spec §76 Test 2 case) | subtotal 20000.00, tax 3420.00, total 22420.00, client preview matches server | Preview and server both showed 20000.00 / 1000.00 / 3420.00 / 22420.00; number `INV-00002` generated sequentially | ✅ |
| 18 | Invoice edit-guard | Navigate directly to `/invoices/:id/edit` for an UNPAID invoice | Server redirects to detail page (edit only allowed for DRAFT) | Redirected to `/invoices/:id` as expected | ✅ |
| 19 | Invoice ownership/404 | Navigate to `/invoices/00000000-0000-0000-0000-000000000000` | 404, not 500/403 | 404 Not Found | ✅ |
| 20 | Customer detail page counts | Revisit the customer detail page after the quote + 2 invoices exist | Quotes/Invoices counts reflect real data (`_count.quotes`/`_count.invoices`), placeholder copy only shows when count is 0 | Showed "Quotes: 1", "Invoices: 2", no placeholder text | ✅ |

## Findings

None. (An earlier draft of this report flagged the customer detail page's
quote/invoice counts as stale — that was tested before this run's quote and
invoices existed yet, i.e. a test-ordering mistake, not a product bug.
Re-tested as case #20 above after the data existed: counts are live and
correct.)

## Not covered in this pass

- Payment recording (Sprint 10 — not built yet, invoice detail page shows a placeholder note by design)
- Quote/invoice `PUT`/`DELETE` on DRAFT status (only reachable for quotes in this flow — invoices are always created UNPAID, DRAFT is a reserved but currently unreachable status per Sprint 9a's design, confirmed by test #18)
- Mobile/tablet responsive layout (Sprint 12 — Responsive Polish, not yet done)
- Validation error paths (missing required fields, invalid decimal formats, XSS/injection in text fields)
- Multi-item quotes/invoices with per-item discounts and mixed tax rates
- Cross-user ownership isolation with two distinct accounts (only single-user 404-on-bad-id was checked, not "user B can't see user A's data")

## Evidence

Screenshots captured during this run (quote PDF, invoice PDF ×2) are in the
repo root as `quote-pdf.png`, `invoice-pdf.png`, `invoice-pdf-2.png` —
gitignored scratch output, not committed.
