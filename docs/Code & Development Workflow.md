# Quote & Invoice Builder

## GitHub, Claude Code & Development Workflow — MVP V1

**Document Version:** 1.0
**Status:** Mandatory Development Workflow
**Repository:** GitHub
**AI Coding Assistant:** Claude Code
**UI Generation:** Google Stitch / Lovable
**Web:** Next.js + React + TypeScript
**Mobile:** Flutter
**Backend/API:** REST API
**Database:** PostgreSQL + Prisma

---

# 1. Purpose

This document defines how the Quote & Invoice Builder should be developed using:

```text
Google Stitch / Lovable
        +
GitHub
        +
Claude Code
        +
Next.js
        +
Flutter
        +
REST API
        +
PostgreSQL
```

The objective is to create a workflow where Claude Code can implement features systematically without:

* Duplicating code
* Breaking existing functionality
* Ignoring documentation
* Introducing unnecessary dependencies
* Creating inconsistent UI
* Mixing business logic with UI
* Making uncontrolled architectural changes

---

# 2. Development Philosophy

The development process should follow:

> **Design first → Document → Plan → Implement → Test → Review → Commit**

Do not start by asking Claude Code to "build the entire application."

Build the MVP in small, verifiable increments.

---

# 3. Repository Strategy

Recommended approach:

```text
quote-invoice-builder/
│
├── docs/
│
├── web/
│
├── mobile/
│
├── backend/
│
├── .github/
│
├── README.md
├── CLAUDE.md
└── .gitignore
```

This is a monorepo.

---

# 4. Why Monorepo

A monorepo makes it easier to maintain:

```text
Web
Mobile
Backend
Documentation
CI/CD
```

in one GitHub repository.

It also allows Claude Code to understand the entire application architecture.

---

# 5. Repository Structure

Recommended:

```text
quote-invoice-builder/
│
├── docs/
│   ├── 01-PRD.md
│   ├── 02-SRS.md
│   ├── 03-SAD.md
│   ├── 04-DDD.md
│   ├── 05-API-SPECIFICATION.md
│   ├── 06-UI-UX-SPECIFICATION.md
│   ├── 07-WEB-DEVELOPMENT-STANDARDS.md
│   ├── 08-MOBILE-DEVELOPMENT-STANDARDS.md
│   ├── 09-TESTING-QA.md
│   └── 10-DEVELOPMENT-WORKFLOW.md
│
├── web/
│
├── mobile/
│
├── backend/
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── CLAUDE.md
├── README.md
└── .gitignore
```

---

# 6. Documentation Is the Source of Truth

Claude Code must treat:

```text
docs/
```

as the primary project specification.

Before implementing a feature, Claude Code must inspect the relevant document.

Example:

For quote functionality:

```text id="l8qg1w"
PRD
SRS
API Specification
DDD
UI/UX Specification
Testing & QA
```

---

# 7. Documentation Hierarchy

When documents conflict:

```text id="5gd2w1"
Business Requirement
       ↓
System Requirement
       ↓
Architecture
       ↓
API/Database
       ↓
UI/UX
       ↓
Implementation
```

If an implementation conflicts with a higher-level requirement, do not silently change the requirement.

Raise the conflict.

---

# 8. CLAUDE.md

Create:

```text id="pksn7q"
CLAUDE.md
```

at the repository root.

This file contains the permanent instructions Claude Code must follow.

It should include:

```text id="t72mhp"
Project overview
Architecture
Important commands
Coding standards
Documentation rules
Testing rules
Git rules
Security rules
Forbidden patterns
Feature workflow
```

---

# 9. Recommended CLAUDE.md

Use the following as the starting point:

```text id="qfce0x"
# Quote & Invoice Builder

## Project

Simple quote and invoice management application for
freelancers and small businesses.

Platforms:
- Responsive Web
- Android
- iOS

## Architecture

Web:
Next.js + React + TypeScript

Mobile:
Flutter + Dart

Backend:
REST API

Database:
PostgreSQL + Prisma

## Important Rules

1. Read relevant documentation before implementing features.
2. Do not modify unrelated files.
3. Do not duplicate components or business logic.
4. No inline CSS.
5. Use Tailwind CSS and shadcn/ui for web.
6. Use centralized Flutter theme/components for mobile.
7. Use strict TypeScript.
8. Avoid `any`.
9. Validate all external input.
10. Backend is authoritative for financial calculations.
11. Backend is authoritative for authorization.
12. Never expose secrets.
13. Add tests for critical business logic.
14. Run lint, type checking and tests after changes.
15. Do not introduce dependencies without justification.
16. Do not implement V2 features unless explicitly requested.
17. Do not silently change API contracts.
18. Do not silently change database schema.
19. Never remove tests to make CI pass.
20. Keep implementation simple and appropriate for MVP.

## Before Coding

1. Read relevant docs.
2. Inspect existing implementation.
3. Identify affected files.
4. Create a short implementation plan.
5. Implement the smallest correct change.
6. Run tests and validation.
7. Review the diff.

## Financial Rules

Never trust client calculations.

Server must validate:
- totals
- tax
- discount
- payment
- payment status
- quote status
- invoice status
- quote-to-invoice conversion

## Git

Use conventional commits.

Examples:
feat:
fix:
refactor:
test:
docs:
chore:

Keep commits focused.

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
```

---

# 10. Claude Code Session Workflow

Every Claude Code session should begin with:

```text id="ybx4x0"
Read CLAUDE.md.

Then inspect the relevant documentation
for the feature I am implementing.

Do not modify code yet.

Tell me:
1. What existing code is relevant?
2. What files likely need changes?
3. What is the implementation plan?
4. What tests should be added?
```

This prevents Claude Code from immediately generating uncontrolled code.

---

# 11. Planning Before Implementation

For each feature, Claude Code should produce:

```text id="q08h4b"
Feature
Goal
Existing code
Files to modify
Files to create
API changes
Database changes
UI changes
Tests
Risks
```

Keep the plan short.

---

# 12. Example Feature Request

Instead of:

```text id="blvifx"
Build the quote module.
```

Use:

```text id="xxd8j6"
Implement Quote List V1.

Read:
- PRD
- SRS
- API Specification
- UI/UX Specification
- Web Development Standards
- Testing & QA

Requirements:
- List quotes
- Search
- Status filter
- Pagination
- Empty state
- Loading state
- Error state
- Responsive table/card layout

Do not implement quote creation yet.

First inspect the repository and provide a plan.
```

---

# 13. Implementation Scope

Claude Code should implement only the requested scope.

If asked:

```text id="v3g5l9"
Create customer list.
```

it should not also implement:

```text id="9d6xai"
Quote creation
Invoice creation
Email
WhatsApp
AI
Payment gateway
```

unless explicitly requested.

---

# 14. Small Commits

Prefer:

```text id="s0iwro"
feat: add customer API
feat: add customer list
feat: add customer form
test: add customer API tests
```

rather than:

```text id="q5w8d9"
feat: build entire application
```

---

# 15. Branch Strategy

Recommended:

```text id="g25xwq"
main
  │
  ├── feature/auth
  ├── feature/customers
  ├── feature/products
  ├── feature/quotes
  ├── feature/invoices
  └── feature/payments
```

---

# 16. Main Branch

`main` must always represent:

> The latest stable version of the application.

Do not directly develop large features on `main`.

---

# 17. Feature Branch

Example:

```text id="3v8u9d"
feature/quote-creation
```

Workflow:

```text id="v7p3a1"
main
 ↓
feature/quote-creation
 ↓
Implementation
 ↓
Tests
 ↓
Pull Request
 ↓
Review
 ↓
Merge
```

---

# 18. Commit Convention

Use:

```text id="jz7zru"
feat:
fix:
refactor:
test:
docs:
chore:
build:
ci:
```

Examples:

```text id="a8yxk8"
feat: add customer creation API
feat: add quote item editor
fix: prevent invoice overpayment
test: cover quote total calculation
refactor: extract currency formatter
docs: update quote API
ci: add flutter test workflow
```

---

# 19. Commit Size

A commit should represent one logical change.

Avoid mixing:

```text id="wczf9j"
Quote feature
+
Authentication refactor
+
Database migration
+
UI redesign
```

unless they are genuinely inseparable.

---

# 20. Pull Request Strategy

Every feature should ideally have a PR.

Example:

```text id="yrh2jt"
PR #12

feat: implement customer management
```

---

# 21. Pull Request Template

Create:

```text id="cv6vpp"
.github/pull_request_template.md
```

Recommended:

```text id="q2a9pz"
## Summary

Describe what changed.

## Requirements

- [ ] Matches specification
- [ ] No unrelated changes

## Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests where required
- [ ] Manual testing

## UI

- [ ] Desktop tested
- [ ] Mobile tested
- [ ] Tablet tested

## Security

- [ ] Authorization checked
- [ ] Input validation checked
- [ ] No secrets added

## Screenshots

Add screenshots for UI changes.

## Notes

Known limitations or follow-up work.
```

---

# 22. GitHub Issues

Each meaningful feature should have an issue.

Examples:

```text id="z0zldj"
AUTH-001 Authentication
CUS-001 Customer Management
PRO-001 Product Management
QUO-001 Quote List
QUO-002 Quote Creation
QUO-003 Quote PDF
INV-001 Invoice List
INV-002 Invoice Creation
PAY-001 Record Payment
```

---

# 23. Issue Structure

Example:

```text id="quk9j8"
Title:
QUO-002 Create Quote

Description:

Implement quote creation according to
the Quote & Invoice Builder specifications.

Requirements:
- Select customer
- Add items
- Custom items
- Quantity
- Price
- Discount
- Tax
- Notes
- Terms
- Save draft
- Generate quote

Acceptance Criteria:
- Quote can be created successfully.
- Backend validates totals.
- User cannot create quote for another user's customer.
- Tests pass.
```

---

# 24. Labels

Recommended:

```text id="rccrj8"
feature
bug
enhancement
documentation
frontend
backend
mobile
database
security
testing
urgent
```

Avoid creating dozens of unnecessary labels.

---

# 25. Milestones

Recommended MVP milestones:

```text id="j4mt9a"
M0 — Project Setup
M1 — Authentication
M2 — Customers
M3 — Products
M4 — Quotes
M5 — Invoices
M6 — Payments
M7 — Mobile
M8 — QA
M9 — Production
```

---

# 26. Recommended Development Order

The project should be built in this order:

```text id="cc93n4"
1. Repository Setup
       ↓
2. Backend Foundation
       ↓
3. Database
       ↓
4. Authentication
       ↓
5. Business Profile
       ↓
6. Customers
       ↓
7. Products
       ↓
8. Quotes
       ↓
9. PDF Generation
       ↓
10. Invoices
       ↓
11. Payments
       ↓
12. Dashboard
       ↓
13. Responsive Polish
       ↓
14. Flutter Mobile
       ↓
15. QA
       ↓
16. Deployment
```

---

# 27. Why This Order

Quotes depend on:

```text id="c7a2w3"
Customers
Products
Business Profile
Authentication
```

Invoices depend on:

```text id="k0l58w"
Quotes
Customers
Products
```

Payments depend on:

```text id="f9f68k"
Invoices
```

Therefore building in this order reduces rework.

---

# 28. Phase 0 — Repository Setup

Tasks:

```text id="h6c0yx"
Create GitHub repository
Create monorepo
Create docs directory
Create CLAUDE.md
Create README
Create .gitignore
Configure GitHub Actions
```

Do not build business features yet.

---

# 29. Phase 1 — Backend Foundation

Implement:

```text id="z9q1gm"
Backend project
Environment configuration
Database connection
Prisma
Base API structure
Error handling
Logging
Health check
Sentry
```

Health endpoint:

```text id="4w5rbd"
/health
```

---

# 30. Phase 2 — Database

Implement:

```text id="d0w7kq"
User
Business
Customer
Product
Quote
QuoteItem
Invoice
InvoiceItem
Payment
```

according to the DDD.

Create migrations.

Seed development data.

---

# 31. Phase 3 — Authentication

Implement:

```text id="h65x91"
Register
Login
Logout
Session
Protected API
Authorization
```

Test user isolation immediately.

Do not postpone authorization until later.

---

# 32. Phase 4 — Business Profile

Implement:

```text id="9h83d4"
Create Business
Update Business
Business Logo
Currency
Tax information
Quote settings
Invoice settings
```

---

# 33. Phase 5 — Customers

Backend:

```text id="9d1l6x"
Create
Read
Update
Delete
Search
Pagination
```

Web:

```text id="6k9g2j"
List
Create
Edit
Details
```

Mobile:

```text id="atc0mj"
List
Create
Details
Edit
```

---

# 34. Phase 6 — Products

Implement:

```text id="v8g4qz"
Create
Read
Update
Delete
Search
Pagination
```

Then integrate product selection into quote creation.

---

# 35. Phase 7 — Quotes

Implement in this order:

```text id="g2w2j4"
Quote domain logic
       ↓
Quote API
       ↓
Quote List
       ↓
Quote Creation
       ↓
Quote Details
       ↓
Status transitions
       ↓
PDF
```

---

# 36. Quote Calculation First

Before building the complete UI:

```text id="y1k4i3"
Implement
calculateLineTotal()
calculateSubtotal()
calculateDiscount()
calculateTax()
calculateTotal()
```

Add tests first.

Then connect the UI.

---

# 37. Quote PDF

Implement:

```text id="x70kqz"
Quote data
 ↓
PDF template
 ↓
PDF generation
 ↓
Storage/response
 ↓
Download
```

Verify financial values.

---

# 38. Phase 8 — Invoices

Implement:

```text id="j2d5qb"
Invoice List
Create Invoice
Invoice Details
Invoice PDF
```

Then implement:

```text id="7ut5lw"
Quote → Invoice
```

---

# 39. Phase 9 — Payments

Implement:

```text id="2d4a9n"
Record Payment
Payment History
Remaining Balance
Payment Status
```

Use transactions.

Test concurrent payments.

---

# 40. Phase 10 — Dashboard

Only after core data exists.

Dashboard should aggregate:

```text id="2a9e4y"
Quote counts
Invoice counts
Paid amount
Outstanding amount
Recent quotes
Recent invoices
```

Avoid building complex analytics.

---

# 41. Phase 11 — Responsive Polish

Review:

```text id="whh2f8"
Desktop
Tablet
Mobile Web
```

Fix:

* Navigation
* Forms
* Tables
* Cards
* Dialogs
* Quote builder
* Invoice builder

---

# 42. Phase 12 — Flutter

Build mobile after the backend/API is stable.

Order:

```text id="v0l2ac"
Flutter foundation
 ↓
Theme
 ↓
Navigation
 ↓
Authentication
 ↓
Dashboard
 ↓
Customers
 ↓
Products
 ↓
Quotes
 ↓
Invoices
 ↓
Payments
 ↓
PDF
 ↓
Share
```

---

# 43. Why Mobile Comes Later

This avoids creating two clients against an unstable API.

Instead:

```text id="f2d2f4"
Backend API
      ↓
Stable contract
      ↓
Web
      +
Mobile
```

This reduces duplicated debugging.

---

# 44. UI Generation Workflow

Use Google Stitch or Lovable for design exploration.

Recommended:

```text id="ih5x2m"
Requirement
 ↓
Stitch/Lovable
 ↓
Design
 ↓
Review
 ↓
Finalize UX
 ↓
Claude Code implementation
```

Do not treat generated UI code as the final architecture.

---

# 45. Stitch/Lovable Output

The UI generator should primarily provide:

```text id="y1nd2s"
Visual design
Layout
Component ideas
Responsive behavior
Interaction ideas
```

Claude Code should implement the production architecture.

---

# 46. Do Not Copy Generated Code Blindly

Generated UI may contain:

* Duplicate components
* Hardcoded data
* Inline styles
* Unnecessary dependencies
* Incorrect state management
* Fake APIs

Claude Code must refactor generated UI into the project's standards.

---

# 47. UI-to-Code Workflow

Example:

```text id="zj6c9p"
Stitch Design
      ↓
Screenshot / Design Reference
      ↓
Claude Code
      ↓
Reusable Components
      ↓
API Integration
      ↓
Validation
      ↓
Responsive Behavior
      ↓
Tests
```

---

# 48. Claude Code Prompt Pattern

Use this pattern:

```text id="k2s9n5"
Read CLAUDE.md and the relevant project documentation.

Feature:
[FEATURE NAME]

Goal:
[GOAL]

Requirements:
[REQUIREMENTS]

UI reference:
[SCREEN / DESIGN REFERENCE]

Before coding:
1. Inspect the existing implementation.
2. Identify files that need changes.
3. Provide a concise implementation plan.

Then implement the feature.

Requirements:
- Follow project architecture.
- Reuse existing components.
- No inline CSS.
- No duplicated logic.
- Validate all input.
- Add appropriate tests.

After implementation:
1. Run formatter.
2. Run lint.
3. Run type check.
4. Run relevant tests.
5. Review changed files.
6. Report what changed and any remaining issues.
```

---

# 49. Claude Code Review Prompt

After implementation:

```text id="t2k31f"
Review the implementation you just made.

Check specifically for:

- Duplicate code
- Duplicate components
- Inline CSS
- Hardcoded values
- Incorrect API usage
- Missing validation
- Missing authorization
- Financial calculation errors
- Security issues
- Responsive issues
- Missing tests
- Unnecessary dependencies
- Unused code

Do not change anything yet.

Report issues first.
```

Then ask Claude Code to fix the identified issues.

---

# 50. Claude Code Test Prompt

Use:

```text id="qjv6j6"
Run the relevant test suite for this feature.

Check:
- Unit tests
- Integration tests
- UI tests
- TypeScript
- Lint
- Build

If anything fails:
1. Explain the failure.
2. Identify the root cause.
3. Fix only the root cause.
4. Re-run the affected tests.

Do not disable tests or lint rules.
```

---

# 51. Database Change Workflow

Never ask:

```text id="7d2p4u"
Change the database however necessary.
```

Instead:

```text id="x2c5y6"
Read the DDD and existing Prisma schema.

Requirement:
[DATABASE CHANGE]

Before implementation:
- Explain affected tables.
- Explain relationships.
- Explain migration impact.
- Identify whether existing data is affected.

Then implement the migration.
```

---

# 52. API Change Workflow

Before changing an API:

```text id="z9q4ai"
Read API Specification.

Explain:
- Existing endpoint
- Current request
- Current response
- Proposed change
- Backward compatibility impact

Then implement.
```

---

# 53. Breaking Changes

Breaking API changes require explicit approval.

Examples:

```text id="p7s9g2"
Renaming fields
Removing fields
Changing response structure
Changing required fields
Changing authentication behavior
```

Do not silently introduce them.

---

# 54. Documentation Updates

When implementation changes:

```text id="u9zv4r"
API
Database
Architecture
UI
```

update the relevant documentation.

Do not allow the code and documentation to drift.

---

# 55. README

The root README should contain:

```text id="w8n2ei"
Project overview
Features
Architecture
Repository structure
Development setup
Environment variables
Running web
Running mobile
Running backend
Testing
Deployment
Claude Code workflow
```

---

# 56. Local Development

Developer should be able to start:

```text id="v6y17c"
PostgreSQL
Backend
Web
```

with a simple documented workflow.

Mobile should point to the appropriate local/staging API.

---

# 57. Docker

Docker may be used for:

```text id="kw8f9b"
PostgreSQL
Backend
Development environment
```

Do not containerize everything merely because Docker exists.

Keep local development simple.

---

# 58. Environment Files

Repository:

```text id="a1h5k3"
.env.example
```

Local:

```text id="0ot8cu"
.env.local
```

Real secrets must never be committed.

---

# 59. Development Commands

Document standard commands.

Example:

```text id="h2q8yl"
Backend:
npm run dev

Web:
npm run dev

Mobile:
flutter run

Tests:
npm test

Flutter tests:
flutter test
```

The exact commands should match the final implementation.

---

# 60. CI/CD

Minimum pipeline:

```text id="i9p4dx"
Push / PR
    ↓
Install
    ↓
Lint
    ↓
Type Check
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Build
    ↓
E2E
```

---

# 61. Deployment Strategy

Recommended environments:

```text id="6stf5k"
Development
      ↓
Staging
      ↓
Production
```

Do not deploy untested feature branches directly to production.

---

# 62. Database Deployment

Production database migrations must:

* Be reviewed
* Be tested
* Be version controlled
* Be applied in controlled deployment

Never manually modify production tables without a documented reason.

---

# 63. Rollback Strategy

For each production release understand:

```text id="7v1w03"
Application rollback
Database migration impact
Configuration rollback
```

Database migrations should be designed carefully because application rollback does not always mean database rollback is safe.

---

# 64. Release Versioning

Use semantic versioning where practical:

```text id="z6s8v9"
0.1.0
0.2.0
0.3.0
1.0.0
```

For the MVP:

```text id="4r5v3h"
0.x
```

can be used until the product is considered stable.

---

# 65. Release Notes

Every release should document:

```text id="y3qj8f"
New Features
Bug Fixes
Breaking Changes
Known Issues
```

---

# 66. Backup Strategy

Production PostgreSQL must have:

* Automated backups
* Backup retention
* Recovery procedure

A backup is only useful if restoration is tested.

---

# 67. Monitoring

Production should monitor:

```text id="e7df8q"
API errors
Application exceptions
Database errors
PDF failures
Authentication failures
Payment failures
Mobile crashes
```

Sentry can provide application-level monitoring.

---

# 68. Post-Deployment Verification

After deployment:

```text id="zh5q2s"
Health Check
 ↓
Login
 ↓
Create Customer
 ↓
Create Quote
 ↓
Generate PDF
 ↓
Create Invoice
 ↓
Record Payment
```

This should be the production smoke test.

---

# 69. MVP Feature Freeze

Before final release:

```text id="e7zv0y"
Stop adding new features.
```

Only work on:

```text id="i4r1yu"
Critical bugs
High-priority bugs
Security issues
Performance issues
Release blockers
```

---

# 70. Avoid Scope Creep

The following are explicitly outside MVP unless requirements are updated:

```text id="k3i7tg"
❌ AI quote generation
❌ AI invoice generation
❌ WhatsApp chatbot
❌ WhatsApp API automation
❌ Payment gateway
❌ Online payment collection
❌ Recurring invoices
❌ Inventory management
❌ Expense management
❌ Full accounting
❌ Multi-company
❌ Advanced analytics
❌ Subscription billing
❌ Team collaboration
❌ Complex approval workflows
```

These can be future versions.

---

# 71. MVP Success Criteria

The MVP succeeds if a small business user can:

```text id="y4f3i2"
Create account
    ↓
Set up business
    ↓
Add customer
    ↓
Add product/service
    ↓
Create quote
    ↓
Generate PDF
    ↓
Share quote
    ↓
Accept quote
    ↓
Convert to invoice
    ↓
Record payment
    ↓
See paid status
```

without needing training.

---

# 72. First Release Scope

The first production version should contain only:

```text id="o6yqfj"
Authentication
Business Profile
Customers
Products/Services
Quotes
Quote PDF
Invoices
Invoice PDF
Payments
Dashboard
Responsive Web
Flutter Mobile
```

---

# 73. Recommended GitHub Project Board

Columns:

```text id="l3f9wb"
Backlog
↓
Ready
↓
In Progress
↓
Code Review
↓
QA
↓
Ready for Release
↓
Done
```

Do not move an issue to Done until its acceptance criteria are satisfied.

---

# 74. Daily Claude Code Workflow

For a development session:

```text id="y17e5j"
1. Select one issue
2. Read documentation
3. Inspect code
4. Plan
5. Implement
6. Test
7. Review diff
8. Commit
9. Update issue
```

Avoid opening ten unrelated tasks simultaneously.

---

# 75. End-of-Day Workflow

Before stopping:

```text id="g3h6po"
Run tests
 ↓
Check git status
 ↓
Review diff
 ↓
Commit working changes
 ↓
Push branch
 ↓
Update issue
```

Do not leave the repository in an unknown state.

---

# 76. Claude Code Context Management

Because Claude Code sessions can become large, avoid giving it the entire project context unnecessarily.

Start with:

```text id="n2l3qv"
CLAUDE.md
+
Relevant specification
+
Relevant source files
```

Only expand context when required.

---

# 77. Claude Code Should Read Before Writing

For example, when working on invoices:

```text id="0dyf1j"
Read:
CLAUDE.md
DDD
API Specification
UI/UX Specification
Testing Specification

Then inspect:
Invoice service
Invoice repository
Invoice API
Invoice components
```

Only then implement.

---

# 78. Avoid "Fix Everything"

Do not give Claude Code prompts such as:

```text id="1g4xk3"
Review the whole application and fix everything.
```

This creates uncontrolled changes.

Instead:

```text id="d6z6h4"
Review the quote creation feature only.
```

---

# 79. Safe Refactoring

Refactoring should happen separately from feature implementation when possible.

Example:

```text id="q1b9h3"
PR 1:
feat: add quote creation

PR 2:
refactor: extract quote calculation service
```

This makes regressions easier to identify.

---

# 80. Final Development Workflow

The complete process:

```text id="p6w6o2"
┌───────────────────────┐
│ Requirements / Docs   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Google Stitch/Lovable │
│ UI Design             │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ GitHub Issue          │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Claude Code Plan      │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Implementation        │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Unit / Integration    │
│ Tests                 │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Code Review           │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Pull Request          │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ CI                    │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ QA                    │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Staging               │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Production            │
└───────────────────────┘
```

---

# 81. Final Principle

The development workflow should follow:

> **One requirement → one issue → one focused implementation → tests → review → merge.**

Claude Code should act as a highly capable implementation assistant, but the project documentation, architecture, business rules, and acceptance criteria remain the source of truth.

The goal is not to generate the maximum amount of code.

The goal is to generate the **minimum amount of clean, reliable code required to build the MVP correctly.**

---

## End of GitHub, Claude Code & Development Workflow — V1
