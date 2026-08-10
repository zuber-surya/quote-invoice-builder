# Quote & Invoice Builder

## Web Development Standards — MVP V1

**Document Version:** 1.0
**Status:** Mandatory Development Standard
**Platform:** Responsive Web
**Framework:** Next.js + React + TypeScript
**Styling:** Tailwind CSS + shadcn/ui
**Database:** PostgreSQL + Prisma
**API:** REST
**Testing:** Unit + Integration + E2E
**Repository:** GitHub
**AI Coding Assistant:** Claude Code

---

# 1. Purpose

This document defines the coding, architecture, UI, security, testing, logging, and Git standards for the web application.

These standards are mandatory for all production code.

The purpose is to ensure the application remains:

* Clean
* Maintainable
* Responsive
* Secure
* Testable
* Scalable
* Consistent
* Easy for Claude Code to understand
* Free from unnecessary duplication

---

# 2. Core Development Principles

The application must follow:

1. **TypeScript-first development**
2. **Strict typing**
3. **No unnecessary code duplication**
4. **No inline CSS**
5. **No hardcoded configuration**
6. **Reusable components**
7. **Reusable business logic**
8. **Server-side validation**
9. **Server-side authorization**
10. **Backend-authoritative financial calculations**
11. **Centralized error handling**
12. **Centralized logging**
13. **Small focused modules**
14. **Clear separation of concerns**
15. **Test critical business logic**
16. **Mobile-first responsive design**
17. **Accessibility by default**
18. **Security by default**
19. **Minimal dependencies**
20. **Do not over-engineer V1**

---

# 3. Technology Standards

The web application should use:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Prisma
PostgreSQL
Zod
Auth.js
Sentry
```

Additional dependencies require justification.

Do not add a package merely because it provides a small convenience that can be handled with existing project utilities.

---

# 4. TypeScript

TypeScript must use strict mode.

Recommended:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

The project must not disable strict TypeScript settings to make code compile.

---

# 5. No `any`

Avoid:

```typescript
const data: any = response;
```

Preferred:

```typescript
const data: CustomerResponse = response;
```

If `any` is absolutely unavoidable, it must be documented and limited to the smallest possible scope.

Do not use `any` to bypass type errors.

---

# 6. Unknown vs Any

When handling genuinely unknown external data:

```typescript
unknown
```

should be preferred over:

```typescript
any
```

Then validate/narrow the value.

Example:

```typescript
const payload: unknown = await request.json();

const result = createCustomerSchema.safeParse(payload);
```

---

# 7. API Type Safety

API request and response types should be explicitly defined.

Example:

```typescript
interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
}
```

Do not duplicate API types unnecessarily across multiple files.

Where practical, use shared schemas/types.

---

# 8. Validation

Use **Zod** for runtime validation.

Example:

```typescript
const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
});
```

Validation must exist at API boundaries.

Never trust:

* Browser forms
* Mobile clients
* URL parameters
* Query parameters
* Request bodies

---

# 9. Client vs Server Validation

Client-side validation improves UX.

Server-side validation provides security and correctness.

Therefore:

```text
Client Validation
       +
Server Validation
```

Both are required.

Do not assume client validation makes server validation unnecessary.

---

# 10. Project Structure

Recommended:

```text
web/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│       └── v1/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── shared/
│   ├── customers/
│   ├── products/
│   ├── quotes/
│   └── invoices/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── products/
│   ├── quotes/
│   └── invoices/
│
├── services/
├── repositories/
├── schemas/
├── types/
├── lib/
├── hooks/
├── utils/
├── prisma/
└── tests/
```

The structure may evolve, but responsibilities must remain clearly separated.

---

# 11. App Router

Use the Next.js App Router.

Prefer:

```text
app/
```

over the legacy Pages Router.

Use route groups where useful:

```text
app/
├── (auth)/
└── (dashboard)/
```

---

# 12. Server Components

Use React Server Components by default.

Do not add:

```typescript
"use client";
```

unless client-side functionality is actually required.

Use Client Components for:

* Interactive forms
* Dropdowns
* Modals
* Client-side state
* Browser APIs
* Interactive tables
* Date pickers
* File uploads

---

# 13. Client Component Rules

Keep Client Components as small as possible.

Bad:

```text
Entire dashboard
    ↓
"use client"
    ↓
Everything rendered client-side
```

Preferred:

```text
Server Page
   │
   ├── Server data
   │
   └── Small Client Components
          ├── Filter
          ├── Modal
          └── Interactive Form
```

---

# 14. Component Design

Components should follow the Single Responsibility Principle.

Bad:

```text
CustomerPage
 ├── Fetch data
 ├── Validate form
 ├── Calculate invoices
 ├── Render table
 ├── Render modal
 ├── Handle API
 └── Handle notifications
```

Preferred:

```text
CustomerPage
 ├── CustomerList
 ├── CustomerFilters
 └── CustomerActions

CustomerForm
CustomerService
CustomerRepository
```

---

# 15. Component Size

Avoid extremely large components.

As a guideline, if a component becomes difficult to understand or contains multiple independent responsibilities, split it.

Do not blindly split every five lines into a component.

Use good judgment.

---

# 16. Reusability

Reusable components should be created for repeated UI patterns.

Examples:

```text
PageHeader
SearchInput
DataTable
StatusBadge
EmptyState
ErrorState
ConfirmDialog
FormField
CurrencyInput
DateInput
LoadingSkeleton
```

Do not create duplicate versions.

---

# 17. No Duplicate UI

Bad:

```text
CustomerCreateButton
CustomerSaveButton
ProductSaveButton
QuoteSaveButton
```

if they all implement the same visual button.

Use:

```text
Button
```

with variants.

---

# 18. No Duplicate Business Logic

Financial calculation logic must exist in one authoritative location.

Bad:

```text
QuoteForm.calculateTotal()
InvoiceForm.calculateTotal()
MobileQuote.calculateTotal()
```

with slightly different implementations.

Preferred:

```text
calculateDocumentTotals()
```

shared by the appropriate domain/application logic.

The backend remains authoritative.

---

# 19. Domain Utilities

Business calculations should be isolated.

Example:

```text
lib/
└── finance/
    ├── calculateLineTotal.ts
    ├── calculateDocumentTotals.ts
    └── paymentStatus.ts
```

These functions should be deterministic and heavily tested.

---

# 20. Money Handling

Never use JavaScript floating-point arithmetic directly for authoritative financial calculations.

Avoid:

```typescript
const total = price * quantity;
```

for server-authoritative monetary calculations when precision could be affected.

Use:

* Prisma Decimal
* Decimal.js or equivalent where necessary
* String/Decimal representations

The database uses:

```text
NUMERIC(15,2)
```

---

# 21. API Architecture

Route handlers should be thin.

Preferred:

```text
Route Handler
      ↓
Authentication
      ↓
Validation
      ↓
Service
      ↓
Repository
      ↓
Database
```

Avoid putting business logic directly into route handlers.

---

# 22. Route Handler Example

Conceptually:

```typescript
export async function POST(request: Request) {
  const user = await requireUser();

  const body = await request.json();

  const input = createQuoteSchema.parse(body);

  const quote = await quoteService.createQuote({
    userId: user.id,
    input,
  });

  return successResponse(quote, 201);
}
```

The route handler should not contain the complete quote calculation/database workflow.

---

# 23. Service Layer

Services contain application use cases.

Examples:

```text
CustomerService
ProductService
QuoteService
InvoiceService
DashboardService
PdfService
BusinessProfileService
```

Example:

```typescript
quoteService.createQuote()
quoteService.updateQuote()
quoteService.changeStatus()
quoteService.convertToInvoice()
```

---

# 24. Repository Layer

Repositories handle database access.

Example:

```text
CustomerRepository
ProductRepository
QuoteRepository
InvoiceRepository
```

The repository should not contain UI logic.

It should not know about:

* Toast notifications
* React components
* Browser APIs

---

# 25. Service vs Repository

### Service

Answers:

> What business operation should happen?

### Repository

Answers:

> How do we read/write the database?

Example:

```text
QuoteService
    ↓
QuoteRepository
    ↓
Prisma
    ↓
PostgreSQL
```

---

# 26. Prisma Rules

Prisma must be the primary database access layer.

Do not mix:

```text
Prisma
+
another ORM
```

without an approved architectural reason.

Raw SQL may be used when genuinely necessary, but it must be isolated and documented.

---

# 27. Prisma Client

Use a single Prisma client instance appropriate for the Next.js runtime.

Do not create a new database client for every request.

---

# 28. Database Transactions

Use transactions for operations requiring atomicity.

Mandatory examples:

```text
Create Quote + Items

Create Invoice + Items

Convert Quote → Invoice

Record Payment
```

Example:

```typescript
await prisma.$transaction(async (tx) => {
  // all related operations
});
```

---

# 29. Authorization

Every business resource must be scoped to the authenticated user.

Never trust:

```text
resourceId
```

alone.

Always verify ownership.

Example:

```typescript
const quote = await quoteRepository.findByIdForUser(
  quoteId,
  userId
);
```

Prefer repository methods that enforce ownership rather than relying on every caller to remember it.

---

# 30. Authentication

Authentication must use the approved authentication library.

Do not implement custom:

* Password hashing
* Session encryption
* Token generation
* Authentication protocols

unless explicitly required and reviewed.

---

# 31. Secrets

Never place secrets in source code.

Never commit:

```text
.env
.env.production
```

containing real credentials.

Use:

```text
.env.example
```

with placeholder values.

---

# 32. Environment Variables

Examples:

```text
DATABASE_URL
AUTH_SECRET
NEXT_PUBLIC_APP_URL
SENTRY_DSN
STORAGE_BUCKET
STORAGE_REGION
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
```

Public variables must be clearly distinguished from server-only secrets.

Never use:

```text
NEXT_PUBLIC_
```

for a secret.

---

# 33. Styling

The project must use:

```text
Tailwind CSS
shadcn/ui
```

No inline CSS.

Avoid:

```tsx
<div style={{ marginTop: 20 }}>
```

Use:

```tsx
<div className="mt-5">
```

---

# 34. No Static/Inline CSS

The following are prohibited unless there is a documented exceptional case:

```text
style={{ ... }}
```

and large page-specific CSS files.

Do not create random CSS files for individual components when Tailwind/design tokens can solve the requirement.

---

# 35. CSS Architecture

Use:

```text
Tailwind
+
CSS variables/design tokens
+
shadcn/ui
```

Centralize:

* Colors
* Typography
* Radius
* Shadows
* Spacing conventions
* Theme values

---

# 36. No Hardcoded Repeated Design Values

Avoid repeating arbitrary values throughout the application.

Bad:

```text
bg-[#2563EB]
bg-[#2563EB]
bg-[#2563EB]
```

Prefer centralized design tokens or Tailwind theme values.

---

# 37. Responsive Design

Every feature must work on:

```text
320px
375px
390px
414px
768px
1024px
1280px+
```

Do not build desktop first and "fix mobile later."

Mobile behavior must be considered while implementing every component.

---

# 38. Mobile-First CSS

Prefer mobile-first Tailwind classes.

Example:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

rather than designing only for desktop and patching mobile afterward.

---

# 39. Tables on Mobile

Do not allow critical tables to create unnecessary horizontal scrolling.

Use responsive transformations such as:

```text
Desktop → Table
Mobile  → Card/List
```

This applies especially to:

* Customers
* Products
* Quotes
* Invoices

---

# 40. Forms

Forms must have:

* Visible labels
* Required indicators
* Validation
* Error messages
* Loading states
* Disabled submit state
* Success feedback

Avoid placeholder-only labels.

Bad:

```text
[ Enter customer name ]
```

Preferred:

```text
Customer Name *
[ Enter customer name ]
```

---

# 41. Form Library

A form library may be used if it reduces complexity.

Recommended:

```text
React Hook Form
+
Zod
```

Use it consistently if adopted.

Do not mix several form libraries.

---

# 42. Form Error Handling

Validation errors should appear close to the relevant field.

Example:

```text
Email *

[ abc@ ]

Please enter a valid email address.
```

Server errors should also map to fields where possible.

---

# 43. Submit Protection

When submitting:

```text
[ Saving... ]
```

The form should prevent accidental duplicate submissions.

---

# 44. API Client

Create a centralized API client.

Example:

```text
lib/api/
├── client.ts
├── customers.ts
├── products.ts
├── quotes.ts
└── invoices.ts
```

Do not scatter:

```text
fetch(...)
```

throughout random components.

---

# 45. API Client Responsibilities

The API client should handle:

* Base URL
* Headers
* Authentication where applicable
* JSON parsing
* Standard errors
* Request IDs
* Response handling

Components should not know implementation details of HTTP communication.

---

# 46. Data Fetching

Use the simplest appropriate strategy.

Prefer:

* Server-side fetching for server-rendered pages.
* Server Actions where appropriate for internal web-only mutations.
* REST API for mobile-consumed functionality.
* Client-side fetching only when interaction requires it.

The public REST API remains the shared contract with Flutter.

---

# 47. State Management

Do not introduce Redux by default.

Use:

* React state
* Server state
* URL state
* Context only where appropriate

If client-side server-state management becomes necessary, use a consistent solution such as TanStack Query.

---

# 48. URL State

Search/filter state that should survive refresh should preferably be represented in URL parameters.

Example:

```text
/quotes?status=SENT&search=Ahmed
```

This improves:

* Navigation
* Browser refresh
* Sharing
* Back/forward behavior

---

# 49. Loading States

Every async UI operation must have a loading state.

Examples:

```text
Loading customers...
Saving quote...
Generating PDF...
Recording payment...
```

Do not leave the user wondering whether an action worked.

---

# 50. Empty States

Every list needs an empty state.

Example:

```text
No quotes yet.

Create your first quote to get started.

[ + Create Quote ]
```

Empty states should guide the user toward the next useful action.

---

# 51. Error States

Every data-driven page needs an error state.

Provide:

```text
Message
+
Retry action
```

Do not expose:

```text
PrismaClientKnownRequestError
```

to users.

---

# 52. Error Boundaries

Use Next.js/React error boundaries for unexpected UI failures.

Provide a user-friendly fallback.

Example:

```text
Something went wrong.

Please try again.

[ Try Again ]
```

---

# 53. Centralized Error Handling

Create application error classes.

Examples:

```text
AppError
ValidationError
UnauthorizedError
ForbiddenError
NotFoundError
ConflictError
BusinessRuleError
```

Do not create ad-hoc error formats throughout the application.

---

# 54. Logging

Use structured logging.

Minimum information:

```text
timestamp
level
requestId
userId where appropriate
route
method
status
duration
errorCode
message
```

---

# 55. Sentry

Sentry should be integrated for:

* Unhandled exceptions
* API errors
* Client errors
* Production failures

Do not send passwords, tokens, or unnecessary sensitive information to Sentry.

---

# 56. Log Levels

Use appropriate levels:

```text
DEBUG
INFO
WARN
ERROR
```

Production should not be flooded with debug logs.

---

# 57. Financial Logging

Never log sensitive financial payloads unnecessarily.

For example, avoid logging complete invoice objects on every request.

Instead:

```text
invoiceId
userId
action
amount where appropriate
status
```

Only log information necessary for diagnosis/audit.

---

# 58. Security

The application must follow secure coding practices.

Required:

* Input validation
* Authentication
* Authorization
* HTTPS
* Secure cookies
* Security headers
* Rate limiting where needed
* Safe file uploads
* Output escaping
* Dependency updates

---

# 59. SQL Injection

Never construct SQL using raw string concatenation with user input.

Bad:

```typescript
`SELECT * FROM users WHERE email = '${email}'`
```

Use Prisma parameterized queries or properly parameterized raw SQL.

---

# 60. XSS Prevention

Never render arbitrary HTML from users without sanitization.

For example:

* Notes
* Terms
* Customer information

must be treated as untrusted content.

Avoid:

```tsx
dangerouslySetInnerHTML
```

unless absolutely required and properly sanitized.

---

# 61. CSRF

Use the authentication/framework mechanisms appropriate for the chosen authentication model.

Do not assume that a frontend-only restriction is sufficient.

Protected state-changing operations must be appropriately protected.

---

# 62. File Upload Security

Business logo uploads must:

* Validate MIME type
* Validate file extension
* Validate file size
* Use safe storage
* Generate safe filenames/keys
* Never execute uploaded files

Allowed initial formats:

```text
PNG
JPEG
WEBP
```

---

# 63. API Rate Limiting

Rate limiting should be considered for:

* Authentication
* Password reset
* PDF generation
* File uploads
* Expensive endpoints

Do not add a complex distributed rate limiter unless actual scale requires it.

---

# 64. Accessibility

Every component must consider:

* Keyboard navigation
* Focus states
* ARIA where necessary
* Semantic HTML
* Labels
* Screen readers
* Color contrast

Use accessible shadcn/ui primitives where applicable.

---

# 65. SEO

Public pages should have appropriate metadata.

The authenticated application does not require aggressive SEO optimization.

At minimum:

```text
title
description
favicon
Open Graph metadata where useful
```

---

# 66. Performance

Avoid unnecessary:

* Client components
* JavaScript bundles
* Large dependencies
* API requests
* Re-renders
* Images without optimization

Use Next.js image optimization where appropriate.

---

# 67. API Request Optimization

Avoid:

```text
Customer page
 ├── API request 1
 ├── API request 2
 ├── API request 3
 ├── API request 4
 └── API request 5
```

when a reasonable consolidated API can provide the required page data.

However, do not create giant APIs that return unnecessary data.

Balance is required.

---

# 68. Database Query Rules

Avoid N+1 queries.

Bad:

```text
Get 20 quotes
   ↓
20 customer queries
```

Preferred:

```text
Get quotes
+
required customer data
```

using appropriate Prisma relations/includes/selects.

---

# 69. Select Only Required Fields

Do not fetch entire database records when only a few fields are needed.

Example:

```typescript
select: {
  id: true,
  name: true,
  email: true,
}
```

This improves performance and reduces accidental data exposure.

---

# 70. Pagination

All potentially large lists must be paginated.

Required:

```text
Customers
Products
Quotes
Invoices
```

Do not load thousands of records into the browser.

---

# 71. Search Debouncing

Search fields should be debounced when triggering API requests.

For example:

```text
User types:
A
Ah
Ahm
Ahme
Ahmed

```

Avoid five immediate API calls.

---

# 72. Financial Calculations

Financial calculations must be tested independently from the UI.

Examples:

```text
calculateLineTotal()
calculateSubtotal()
calculateDiscount()
calculateTax()
calculateTotal()
calculateRemainingAmount()
calculatePaymentStatus()
```

---

# 73. Quote → Invoice

The conversion logic must be centralized.

Do not implement separate versions in:

```text
Quote Details UI
Dashboard
Mobile
API
```

The actual conversion must happen through the backend service.

---

# 74. PDF Generation

PDF generation must be centralized.

Do not create one implementation for:

```text
Web
Mobile
```

The backend should generate the authoritative PDF.

---

# 75. PDF UI

The web application may display a preview, but the final document generation must use the backend document data.

The browser must not be considered the authoritative source for financial values.

---

# 76. Dates

Use a consistent date-handling library/utilities where necessary.

Avoid manually parsing dates in many places.

API format:

```text
YYYY-MM-DD
```

Display format can be localized.

Example:

```text
API:
2026-08-10

UI:
10 Aug 2026
```

---

# 77. Currency Formatting

Create one reusable currency formatter.

Example:

```text
formatCurrency(amount, currency)
```

Do not repeatedly implement:

```text
₹ + amount
```

throughout the application.

---

# 78. Number Formatting

Quantity, tax, and money formatting should use shared utilities.

Example:

```text
formatCurrency()
formatQuantity()
formatPercentage()
formatDate()
formatDateTime()
```

---

# 79. Naming Conventions

### Components

PascalCase:

```text
CustomerForm
QuoteSummary
InvoiceCard
```

### Functions

camelCase:

```text
createCustomer
calculateQuoteTotal
formatCurrency
```

### Constants

UPPER_SNAKE_CASE where appropriate:

```text
DEFAULT_PAGE_SIZE
MAX_FILE_SIZE
```

### Database

snake_case.

### API

REST-style plural resources:

```text
/customers
/products
/quotes
/invoices
```

---

# 80. File Naming

React components:

```text
CustomerForm.tsx
QuoteSummary.tsx
```

Utilities:

```text
formatCurrency.ts
calculateTotals.ts
```

Services:

```text
quote.service.ts
invoice.service.ts
```

Schemas:

```text
quote.schema.ts
invoice.schema.ts
```

Tests:

```text
quote.service.test.ts
calculateTotals.test.ts
```

---

# 81. Comments

Write comments only when they explain **why**, not obvious **what**.

Bad:

```typescript
// Add two numbers
const total = a + b;
```

Good:

```typescript
// Decimal arithmetic is used here to avoid floating-point
// precision issues in financial calculations.
```

---

# 82. TODO Rules

Do not leave vague TODOs.

Bad:

```text
TODO: fix this later
```

Preferred:

```text
TODO(PROJECT-123): Add email delivery after email service is implemented.
```

If there is no issue/ticket, avoid leaving long-term TODOs.

---

# 83. Dependency Rules

Before adding a dependency:

1. Check whether existing dependencies solve the problem.
2. Check package maintenance.
3. Check bundle impact.
4. Check security history.
5. Check license.
6. Confirm the dependency is necessary.

Avoid dependency bloat.

---

# 84. Environment Separation

Support:

```text
development
test
production
```

Do not hardcode environment-specific behavior.

---

# 85. Feature Flags

Do not introduce a feature flag system for every small feature.

Use feature flags only when there is a genuine need for:

* Gradual rollout
* Experimental functionality
* Production migration

---

# 86. Git Standards

Commits should be small and meaningful.

Preferred:

```text
feat: add customer creation
feat: add quote calculation
fix: prevent duplicate invoice conversion
test: add quote calculation tests
refactor: extract quote service
docs: update API specification
```

Avoid:

```text
update
changes
fix stuff
final
final2
latest
```

---

# 87. Branch Naming

Recommended:

```text
feature/auth
feature/customers
feature/products
feature/quotes
feature/invoices
fix/quote-total
refactor/pdf-service
```

---

# 88. Pull Requests

Every PR should contain:

```text
Summary
Changes
Testing performed
Screenshots for UI changes
Known limitations
```

Avoid huge PRs containing unrelated features.

---

# 89. Code Review Checklist

Reviewers/Claude Code should verify:

```text
[ ] No unnecessary duplication
[ ] No inline CSS
[ ] TypeScript strict
[ ] No unnecessary any
[ ] Validation exists
[ ] Authorization exists
[ ] Error handling exists
[ ] Loading state exists
[ ] Empty state exists
[ ] Responsive UI works
[ ] Accessibility considered
[ ] Tests added
[ ] No secrets committed
[ ] No unrelated files changed
```

---

# 90. Testing Strategy

Testing levels:

```text
Unit
  ↓
Integration
  ↓
E2E
```

---

# 91. Unit Testing

Mandatory for:

* Financial calculations
* Tax calculations
* Discount calculations
* Payment calculations
* Status transitions
* Quote → invoice rules
* Number generation logic

---

# 92. Integration Testing

Test:

* API
* Database
* Authentication
* Authorization
* Prisma queries
* Transactions

---

# 93. E2E Testing

Critical flow:

```text
Register
 ↓
Business Setup
 ↓
Create Customer
 ↓
Create Product
 ↓
Create Quote
 ↓
Generate PDF
 ↓
Accept Quote
 ↓
Convert Invoice
 ↓
Record Payment
 ↓
Paid
```

This flow must work end-to-end.

---

# 94. Testing Tools

Recommended:

```text
Vitest
+
React Testing Library
+
Playwright
```

Use the smallest combination that covers requirements.

---

# 95. Test Naming

Tests should clearly describe behavior.

Good:

```text
should calculate tax correctly
should reject payment above remaining balance
should prevent user from accessing another user's quote
should convert an accepted quote into an invoice
```

Bad:

```text
test1
test2
works
```

---

# 96. Mocking

Mock external services such as:

* Sentry
* Object storage
* Email
* External APIs

Do not mock your own core business logic unnecessarily.

---

# 97. Test Data

Use factories/fixtures for test data.

Example:

```text
createTestUser()
createTestCustomer()
createTestProduct()
createTestQuote()
```

Avoid copying large JSON objects across tests.

---

# 98. CI Pipeline

GitHub Actions should run:

```text
Install dependencies
       ↓
Lint
       ↓
Type check
       ↓
Unit tests
       ↓
Integration tests
       ↓
Build
       ↓
E2E where configured
```

A PR should not merge if mandatory checks fail.

---

# 99. Linting

Use ESLint.

The project should enforce:

* Unused variables
* React rules
* TypeScript rules
* Import consistency
* Basic code quality

Warnings should not be ignored without justification.

---

# 100. Formatting

Use Prettier or the project's chosen formatter consistently.

Developers and Claude Code must not manually format files inconsistently.

Recommended:

```text
ESLint
+
Prettier
```

---

# 101. Import Rules

Prefer clean imports.

Avoid deeply tangled relative imports where aliases improve clarity.

Example:

```text
@/components
@/services
@/lib
@/features
```

Configure aliases consistently.

---

# 102. Circular Dependencies

Avoid circular dependencies.

Bad:

```text
QuoteService
 ↓
InvoiceService
 ↓
QuoteService
```

If business logic becomes circular, refactor shared logic into a lower-level domain/service module.

---

# 103. Dead Code

Do not leave:

* Unused components
* Unused functions
* Unused imports
* Dead feature branches
* Old API implementations

Remove them.

---

# 104. Debug Code

Do not commit:

```text
console.log()
debugger
temporary test buttons
hardcoded fake API responses
```

unless explicitly intended.

Production logging should use the centralized logging system.

---

# 105. Hardcoded Data

Do not hardcode business data into application components.

Bad:

```typescript
const customers = [
  { name: "Ahmed" }
];
```

Use API/database data.

Static configuration is acceptable when genuinely configuration.

---

# 106. Mock Data

Mock/demo data should exist only in:

```text
tests
development seed
Storybook/demo environment if used
```

It must never accidentally appear in production.

---

# 107. Accessibility Testing

Critical screens should be checked for:

* Keyboard navigation
* Focus
* Labels
* Contrast
* Dialog accessibility
* Form errors

---

# 108. Responsive Testing

Every new UI feature must be checked at minimum:

```text
390px
768px
1280px
```

Critical screens should also be checked at:

```text
320px
375px
414px
1024px
1440px
```

---

# 109. Browser Support

Support modern versions of:

* Chrome
* Edge
* Safari
* Firefox

The MVP does not need to support obsolete browsers.

---

# 110. Performance Budgets

Avoid unnecessarily large bundles.

Pay attention to:

* Client component size
* Third-party packages
* Images
* PDF libraries
* Data tables

Heavy functionality should be lazy-loaded where appropriate.

---

# 111. Image Handling

Use Next.js image optimization where applicable.

Business logos should:

* Have size limits
* Have format validation
* Be optimized where practical
* Use appropriate dimensions

---

# 112. Accessibility of Icons

Icon-only buttons must have accessible labels.

Bad:

```text
<button>
  <TrashIcon />
</button>
```

Preferred:

```text
<button aria-label="Delete customer">
  <TrashIcon />
</button>
```

---

# 113. Destructive Actions

Delete actions must:

* Use destructive styling.
* Require confirmation where appropriate.
* Clearly explain consequences.
* Be disabled where business rules prohibit deletion.

---

# 114. Financial Document Protection

Issued invoices and accepted quotes must not be casually editable.

The UI should disable invalid actions.

The backend must enforce the same rules.

Never rely only on UI restrictions.

---

# 115. API/UI Consistency

If the UI says:

```text
Invoice is Paid
```

the backend must return the authoritative payment status.

The UI must not independently decide financial state.

---

# 116. Offline Behavior

Full offline functionality is out of scope.

The UI should still gracefully handle network failures.

Example:

```text
Connection lost.

Your changes were not saved.

[ Retry ]
```

Never falsely show a successful save if the API failed.

---

# 117. Security Review Before Release

Before production release, verify:

```text
[ ] Authentication works
[ ] Authorization works
[ ] Cross-user access tested
[ ] Secrets protected
[ ] File uploads secured
[ ] Input validation active
[ ] Rate limiting configured where needed
[ ] Error responses sanitized
[ ] Production HTTPS enabled
[ ] Dependencies updated
[ ] Sentry configured
```

---

# 118. Claude Code Development Rules

Claude Code must follow these rules for every task.

### Rule 1

Read the relevant documentation before implementing a feature.

### Rule 2

Do not modify unrelated files.

### Rule 3

Do not introduce new architecture without explaining why.

### Rule 4

Do not add dependencies without justification.

### Rule 5

Do not duplicate existing components or logic.

### Rule 6

Do not use inline CSS.

### Rule 7

Do not use `any` to bypass TypeScript errors.

### Rule 8

Do not bypass validation.

### Rule 9

Do not bypass authorization.

### Rule 10

Do not calculate authoritative financial totals only on the client.

### Rule 11

Add tests for critical business logic.

### Rule 12

Update documentation when architecture/API behavior changes.

### Rule 13

Run lint, type checking, and relevant tests after changes.

### Rule 14

Do not commit secrets.

### Rule 15

If requirements are ambiguous, inspect existing project documentation and code before making assumptions.

### Rule 16

Prefer the simplest implementation that satisfies the requirement.

### Rule 17

Do not implement future V2/V3 features unless explicitly requested.

### Rule 18

Preserve backward compatibility when modifying existing APIs unless a breaking change is approved.

### Rule 19

Never silently change database schema.

### Rule 20

Never delete working functionality simply to make a new feature easier.

---

# 119. Claude Code Task Workflow

For every feature, Claude Code should follow:

```text
1. Read relevant docs
        ↓
2. Inspect existing code
        ↓
3. Identify affected files
        ↓
4. Create implementation plan
        ↓
5. Implement
        ↓
6. Run formatter
        ↓
7. Run lint
        ↓
8. Run type check
        ↓
9. Run tests
        ↓
10. Review changes
        ↓
11. Report completed work
```

---

# 120. Claude Code Should Not

Claude Code must not:

* Rewrite the entire project for a small feature.
* Introduce unnecessary frameworks.
* Replace existing libraries without approval.
* Generate duplicate components.
* Put business logic inside UI components.
* Put database queries directly inside React components.
* Hardcode API responses.
* Disable TypeScript checks.
* Disable ESLint rules simply to make the build pass.
* Remove tests to fix failures.
* Ignore failing migrations.
* Commit secrets.
* Modify unrelated functionality.

---

# 121. Definition of Done — Web Feature

A feature is complete only when:

```text
[ ] Requirements implemented
[ ] UI implemented
[ ] Responsive behavior implemented
[ ] Validation implemented
[ ] API implemented if required
[ ] Authorization implemented
[ ] Error handling implemented
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Tests added
[ ] Lint passes
[ ] TypeScript passes
[ ] Build passes
[ ] No unrelated regressions
```

---

# 122. Definition of Done — Production Release

The web MVP is production-ready when:

```text
[ ] Authentication works
[ ] Business profile works
[ ] Customers work
[ ] Products work
[ ] Quotes work
[ ] Quote calculations are tested
[ ] Quote PDFs work
[ ] Invoice conversion works
[ ] Invoices work
[ ] Payments work
[ ] Dashboard works
[ ] Responsive UI works
[ ] Security checks completed
[ ] Sentry configured
[ ] Database backups configured
[ ] CI/CD works
[ ] Production environment configured
[ ] Critical E2E tests pass
```

---

# 123. Final Standard

The guiding principle for the web application is:

> **Write simple, strongly typed, reusable, testable code that solves the current MVP requirement without creating unnecessary complexity for the future.**

The application should be easy for another developer — or Claude Code in a future session — to understand and continue.

---

## End of Web Development Standards — V1
