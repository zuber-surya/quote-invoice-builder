# Quote & Invoice Builder — Deployment Readiness Checklist

Distilled from `docs/Deployment & Infrastructure Specification.md` (§11, §13, §88) for
V1 launch. This document is a checklist only — every item below requires a human to
create an account, provision a service, or handle a secret. None of it is done by
Claude Code; account creation and holding production credentials are out of scope for
an AI coding agent (see CLAUDE.md rule 12 — secrets only ever live in environment
variables, never in chat or in the repo).

Work through it top to bottom before the first production deploy.

---

## 1. Choose managed services (Deployment Spec §4)

- [ ] Web hosting — Vercel, Cloudflare Pages, or another managed Next.js host
- [ ] Backend hosting — same as web (Next.js API routes; no separate backend service
      per CLAUDE.md Architecture)
- [ ] Managed PostgreSQL — Neon, Supabase, Railway, or Render Postgres
- [ ] Object storage — Cloudflare R2, AWS S3, or Supabase Storage (needed once logo
      uploads / persisted PDFs move off on-demand generation — see Architecture
      Decisions on the current "no object storage" deviation)
- [ ] Sentry project (web + backend; mobile later per Phase 12)
- [ ] Domain registrar / DNS provider

## 2. Environment variables (Deployment Spec §11, §13)

Confirm `.env.example` in `web/` stays in sync with what production actually needs, and
that every value below has a real (never placeholder) value set in the hosting
platform's secret store — never committed to git:

- [ ] `DATABASE_URL` — production Postgres connection string
- [ ] `AUTH_SECRET` — strong, unique secret (not the CI placeholder)
- [ ] `APP_URL` / `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `CORS_ORIGINS` — production origin only, never `*`
- [ ] `SENTRY_DSN` (web + backend)
- [ ] `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`
      (once object storage is adopted)

## 3. Database (Deployment Spec §19-28)

- [ ] Production database created, on a dedicated (non-superuser) app credential
- [ ] `prisma migrate deploy` run against production as part of the controlled release
      process — never `prisma migrate dev` against prod
- [ ] Automated daily backups enabled
- [ ] Backup restoration tested at least once (restore to a temp DB, verify schema +
      data)
- [ ] TLS connection enforced, database not publicly reachable

## 4. Security (Deployment Spec §36-44)

- [ ] HTTPS enforced on the production domain
- [ ] CORS restricted to the production origin
- [ ] Security headers verified in production (already code-complete —
      `web/next.config.ts` sets CSP, X-Content-Type-Options, Referrer-Policy,
      X-Frame-Options, HSTS; re-check the CSP against the deployed app once, since a
      hosting platform can inject its own scripts/analytics that need a CSP exception)
- [ ] Auth secrets rotated from any values used in development/CI

## 5. Monitoring (Deployment Spec §45-53)

- [ ] Sentry capturing unhandled exceptions in production (separate environment tag
      from dev/staging)
- [ ] `/health` endpoint reachable and monitored externally
- [ ] Alerting configured for meaningful failures (high error rate, DB unavailable,
      repeated PDF failures) — avoid alerting on every minor warning

## 6. CI/CD (Deployment Spec §54-63)

- [ ] `.github/workflows/ci.yml` gate (install → lint → typecheck → unit tests → build)
      passing on `main` — already in place
- [ ] Production deploy trigger decided (auto on `main` merge, or manual approval —
      Deployment Spec recommends manual approval for MVP)
- [ ] Rollback procedure documented for the chosen hosting platform

## 7. Post-launch smoke test (Deployment Spec §89)

Run this manually immediately after the first production deploy:

1. Register / login
2. Create business profile
3. Create customer
4. Create product
5. Create quote, verify total
6. Generate quote PDF
7. Convert quote to invoice
8. Record partial payment
9. Record final payment, verify Paid
10. Open invoice PDF

---

## Explicitly not covered here

- Mobile (Flutter) release infrastructure — Phase 12, not started (CLAUDE.md).
- Integration/E2E test infrastructure — tracked separately in
  `docs/Sprint Plan.md` Backlog, per Architecture Decisions ADR-6.
- Two QA findings from the Sprint 13 code-side pass need a decision before launch:
  [#73](https://github.com/zuber-surya/quote-invoice-builder/issues/73) (unauthenticated
  API requests return an HTML redirect instead of JSON 401) and
  [#74](https://github.com/zuber-surya/quote-invoice-builder/issues/74) (no automated
  auth-route tests).
