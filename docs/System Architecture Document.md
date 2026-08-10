# Quote & Invoice Builder

## System Architecture Document — MVP V1

**Document Version:** 1.0
**Status:** MVP
**Related Document:** PRD V1

---

# 1. Purpose

This document defines the technical architecture for the Quote & Invoice Builder MVP.

The architecture is designed to support:

* Responsive web application
* Desktop browser
* Tablet browser
* Mobile browser
* Android application
* iOS application
* Shared backend
* PostgreSQL database
* PDF generation
* Future AI and WhatsApp integrations

The architecture should remain simple enough for a small development team or solo developer to maintain.

---

# 2. Architecture Principles

The project must follow these principles:

1. **Keep V1 simple.**
2. Avoid microservices unless there is a demonstrated need.
3. Use a shared backend for web and mobile.
4. Keep business logic centralized.
5. Keep frontend presentation logic separate from business logic.
6. Avoid code duplication.
7. Use reusable UI components.
8. Use strict TypeScript.
9. Validate data on both client and server.
10. Never trust client-calculated financial totals.
11. Keep database access centralized.
12. Use migrations for database changes.
13. Log unexpected errors.
14. Never expose secrets to client applications.
15. Design the architecture so future features can be added without rewriting V1.

---

# 3. Recommended Technology Stack

## Web

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
```

Next.js will provide:

* Web UI
* Responsive UI
* Server-side capabilities
* API layer
* Authentication integration
* Backend-for-frontend capabilities where useful

---

# 4. Backend

For V1, the backend will be implemented within the Next.js application rather than creating a separate FastAPI service.

Recommended:

```text
Next.js API / Route Handlers
        │
        ▼
Application Services
        │
        ▼
Repository / Data Access
        │
        ▼
PostgreSQL
```

### Why?

The MVP does not require an independent backend service.

Using a single Next.js application reduces:

* Infrastructure
* Deployment complexity
* Authentication complexity
* API maintenance
* Development time
* Local development setup

A separate FastAPI backend can be introduced later if requirements justify it.

---

# 5. Mobile Application

The mobile application will use:

```text
Flutter
Dart
```

The Flutter application communicates with the same backend API used by the web application.

```text
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  └────────▲─────────┘
                           │
                  ┌────────┴─────────┐
                  │    Next.js API   │
                  └────────▲─────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────┴──────┐           ┌──────┴──────┐
       │   Web App   │           │ Flutter App │
       │ Next.js     │           │ Android/iOS │
       └─────────────┘           └─────────────┘
```

---

# 6. High-Level Architecture

```text
                           Internet
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
      ┌────────────────┐              ┌────────────────┐
      │ Responsive Web │              │ Flutter Mobile │
      │   Next.js      │              │ Android / iOS  │
      └───────┬────────┘              └───────┬────────┘
              │                               │
              └──────────────┬────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │    API Layer       │
                  │ Next.js Route/API  │
                  └─────────┬──────────┘
                            │
             ┌──────────────┼───────────────┐
             │              │               │
             ▼              ▼               ▼
      ┌────────────┐ ┌──────────────┐ ┌─────────────┐
      │ Auth       │ │ Application  │ │ PDF Service │
      │ Service    │ │ Services     │ │             │
      └────────────┘ └──────┬───────┘ └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Repository  │
                      │ / Data      │
                      │ Access      │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ PostgreSQL  │
                      └─────────────┘
```

---

# 7. Application Architecture

The Next.js application should be structured into clear layers.

```text
Presentation
     │
     ▼
API / Controllers
     │
     ▼
Application Services
     │
     ▼
Domain Logic
     │
     ▼
Repositories
     │
     ▼
Database
```

### Example

Creating a quote:

```text
UI
 │
 ▼
POST /api/quotes
 │
 ▼
Quote Service
 │
 ├── Validate customer
 ├── Validate products
 ├── Calculate totals
 ├── Generate quote number
 └── Save quote
       │
       ▼
   Repository
       │
       ▼
 PostgreSQL
```

---

# 8. Presentation Layer

The presentation layer contains:

* Pages
* Layouts
* Forms
* Components
* Tables
* Cards
* Modals
* Navigation
* Loading states
* Error states

The UI must not directly access the database.

The UI should communicate through application APIs/services.

---

# 9. API Layer

The API layer is responsible for:

* Receiving requests
* Authentication
* Authorization
* Request validation
* Calling application services
* Returning standardized responses

The API should not contain large amounts of business logic.

Bad:

```text
Route Handler
 ├── Validate
 ├── Calculate
 ├── Database query
 ├── Generate PDF
 ├── Send email
 └── More logic...
```

Preferred:

```text
Route Handler
      │
      ▼
QuoteService.createQuote()
      │
      ├── validation
      ├── calculation
      ├── numbering
      └── repository
```

---

# 10. Application Service Layer

Application services contain use cases.

Examples:

```text
CustomerService
ProductService
QuoteService
InvoiceService
BusinessProfileService
DashboardService
PdfService
```

Example quote operations:

```text
createQuote()
getQuote()
updateQuote()
deleteDraftQuote()
listQuotes()
changeQuoteStatus()
convertQuoteToInvoice()
```

---

# 11. Domain Logic

Business rules should be centralized.

Important domain rules include:

### Quote

* Quote must belong to authenticated user.
* Customer must belong to authenticated user.
* Quote items must be valid.
* Quantity must be greater than zero.
* Prices cannot be negative.
* Totals must be calculated server-side.
* Only accepted quotes can be converted to invoices.

### Invoice

* Invoice must belong to authenticated user.
* Invoice number must be unique.
* Total must be calculated server-side.
* Payment amount cannot exceed invoice amount.
* Paid invoice cannot become unpaid without an explicit supported action.

---

# 12. Database

The primary database will be:

**PostgreSQL**

PostgreSQL is responsible for persistent application data.

Initial entities:

```text
User
BusinessProfile
Customer
Product
Quote
QuoteItem
Invoice
InvoiceItem
```

Future entities can include:

```text
Payment
Document
Notification
Subscription
TeamMember
ActivityLog
```

These should not be implemented in V1 unless required.

---

# 13. ORM / Database Access

Use a single ORM/data-access strategy throughout the project.

Recommended:

```text
Prisma ORM
```

Reasons:

* Type-safe database access
* Strong TypeScript integration
* Migration support
* Good developer experience
* Easy local development
* Works well with PostgreSQL

The application should not mix:

```text
Prisma
Raw SQL
Another ORM
```

without a documented reason.

---

# 14. Database Migration Strategy

All schema changes must use migrations.

Example:

```text
prisma/
 ├── schema.prisma
 └── migrations/
      ├── 001_initial
      ├── 002_add_customers
      ├── 003_add_quotes
      └── ...
```

Never make undocumented production database changes manually.

---

# 15. Authentication Architecture

V1 requires:

```text
Register
Login
Logout
Password Reset
Session Management
```

Authentication should be handled using a proven authentication library rather than building password/session management from scratch.

Recommended option:

```text
Auth.js
```

The authentication layer must provide:

* Secure password handling
* Session management
* Protected routes
* User identity
* API authorization

---

# 16. Authorization

Every protected request must identify the authenticated user.

Example:

```text
GET /api/customers/123
```

The backend must verify:

```text
Customer 123 belongs to current user
```

It must never assume that knowing the record ID is sufficient authorization.

---

# 17. Multi-Tenancy Model

Although V1 does not support teams, each registered user effectively represents an isolated business account.

Example:

```text
User
 │
 ├── Business Profile
 ├── Customers
 ├── Products
 ├── Quotes
 └── Invoices
```

Every business-owned table should contain a relationship to the owning user/business.

This prepares the system for future organization/team support.

---

# 18. Financial Calculation Architecture

Financial calculations are critical.

The frontend may display calculated values for user experience, but the backend must recalculate and validate totals before saving.

Example:

```text
Client
  │
  │ subtotal = 30000
  ▼
Backend
  │
  ├── Recalculate
  ├── Validate
  └── Persist authoritative totals
```

Use decimal-safe database types.

Recommended PostgreSQL type:

```text
DECIMAL / NUMERIC
```

Avoid storing monetary values as floating-point numbers.

---

# 19. Quote Number Generation

Quote numbers must be unique.

Example:

```text
Q-00001
Q-00002
Q-00003
```

The numbering logic should exist on the server.

It must be safe against concurrent requests.

The database should enforce uniqueness.

---

# 20. Invoice Number Generation

Invoice numbers:

```text
INV-00001
INV-00002
INV-00003
```

The same principles apply:

* Server-side generation
* Unique database constraint
* Concurrency-safe implementation
* Never trust client-provided invoice numbers

---

# 21. PDF Architecture

PDF generation should be centralized.

```text
Quote
  │
  ▼
PdfService
  │
  ▼
Quote PDF
```

and:

```text
Invoice
  │
  ▼
PdfService
  │
  ▼
Invoice PDF
```

The PDF generation logic should not be duplicated between web and mobile.

The mobile app should request or access the generated document through the backend.

---

# 22. File Storage

V1 requires storage for:

* Business logo
* Generated documents if persisted

A cloud object-storage-compatible solution should be used.

Recommended:

```text
AWS S3
```

For initial development, local storage can be used if necessary.

Production should use object storage rather than storing files inside the application server.

Architecture:

```text
Application
    │
    ▼
Storage Service
    │
    ▼
Object Storage
```

The application should not tightly couple business logic directly to S3 APIs.

---

# 23. Storage Abstraction

Create an abstraction such as:

```text
StorageService
```

with operations such as:

```text
upload()
delete()
getUrl()
```

This allows future replacement with:

* S3
* Cloudflare R2
* Supabase Storage
* Other object storage

without changing application logic.

---

# 24. API Design

The API should follow REST conventions.

Example:

```text
/api/auth
/api/business-profile

/api/customers
/api/customers/:id

/api/products
/api/products/:id

/api/quotes
/api/quotes/:id
/api/quotes/:id/status
/api/quotes/:id/pdf
/api/quotes/:id/convert-to-invoice

/api/invoices
/api/invoices/:id
/api/invoices/:id/status
/api/invoices/:id/pdf

/api/dashboard
```

Detailed API contracts will be defined in **Document 4 — API Specification**.

---

# 25. API Response Format

Use a consistent response structure.

Success example:

```json
{
  "success": true,
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer was not found."
  }
}
```

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "fields": {
      "name": "Name is required."
    }
  }
}
```

The exact schema will be finalized in the API specification.

---

# 26. Error Handling

Use centralized error handling.

Architecture:

```text
API
 │
 ▼
Error Handler
 │
 ├── Validation Error
 ├── Authentication Error
 ├── Authorization Error
 ├── Not Found
 ├── Business Rule Error
 └── Unexpected Error
```

Expected business errors should produce safe user-facing messages.

Unexpected errors should be logged with technical details.

---

# 27. Logging

V1 must have structured application logging.

Logs should include:

```text
Timestamp
Environment
Log Level
Request ID
User ID where appropriate
Endpoint
HTTP Method
Error Code
Error Message
Stack Trace for server errors
```

Do not log:

* Passwords
* Authentication secrets
* Access tokens
* Payment credentials
* Sensitive personal information unnecessarily

---

# 28. Error Monitoring

The production application should integrate an error-monitoring service.

Recommended:

```text
Sentry
```

Use it for:

* Frontend errors
* Backend errors
* Unhandled exceptions
* Performance issues where useful

Development logs can remain local.

---

# 29. Environment Configuration

Never hardcode:

* Database credentials
* API keys
* Authentication secrets
* Storage credentials
* Sentry DSN
* Production URLs

Use environment variables.

Example:

```text
DATABASE_URL=
AUTH_SECRET=
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
SENTRY_DSN=
NEXT_PUBLIC_APP_URL=
```

Environment files:

```text
.env.local
.env.example
```

`.env.example` must contain variable names but never real secrets.

---

# 30. Web Application Structure

Recommended structure:

```text
web/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── customers/
│   ├── products/
│   ├── quotes/
│   └── invoices/
│
├── features/
│   ├── auth/
│   ├── customers/
│   ├── products/
│   ├── quotes/
│   ├── invoices/
│   └── dashboard/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   ├── logging/
│   ├── storage/
│   └── pdf/
│
├── services/
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── quote.service.ts
│   └── invoice.service.ts
│
├── repositories/
│
├── types/
│
└── prisma/
```

The exact structure can be adjusted during implementation, but the separation of concerns should remain.

---

# 31. Mobile Application Structure

Recommended Flutter structure:

```text
mobile/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   ├── network/
│   │   ├── errors/
│   │   ├── storage/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   └── settings/
│   │
│   ├── shared/
│   │   ├── widgets/
│   │   └── models/
│   │
│   └── main.dart
│
└── test/
```

The Flutter application should not contain database access logic.

---

# 32. Mobile API Communication

Flutter communicates with the backend through HTTPS APIs.

Example:

```text
Flutter
   │
   ▼
HTTP Client
   │
   ▼
Next.js API
   │
   ▼
Application Service
   │
   ▼
PostgreSQL
```

The API client should be centralized rather than making raw HTTP calls throughout the application.

---

# 33. State Management — Web

Do not introduce a complex state-management framework unnecessarily.

Use:

* React state
* Server-side data fetching
* URL/search parameters
* Appropriate data-fetching utilities

If client-side server-state management becomes necessary, a library such as TanStack Query can be introduced.

Do not add Redux simply because it is popular.

---

# 34. State Management — Mobile

Flutter should use a predictable state-management solution.

Recommended:

```text
Riverpod
```

Keep:

```text
UI
 ↓
State/Controller
 ↓
Repository
 ↓
API
```

separated.

---

# 35. Design System

The web application should use:

```text
Tailwind CSS
shadcn/ui
```

No random styling approach should be introduced.

Avoid:

```text
Inline styles
Random CSS files
Duplicated component styles
Hardcoded repeated values
```

Create reusable components.

Examples:

```text
Button
Input
Select
Modal
DataTable
Card
Badge
EmptyState
LoadingState
ErrorState
ConfirmDialog
```

---

# 36. Responsive Architecture

Responsive behavior should be designed from the beginning.

Do not create:

```text
Desktop version
+
Separate mobile web version
```

Instead:

```text
Single responsive web application
```

Use responsive layouts/components.

Example:

```text
Desktop
Sidebar + Content

Mobile
Bottom Navigation / Compact Header + Content
```

The same application should adapt to the viewport.

---

# 37. Mobile Navigation

Recommended mobile navigation:

```text
Home
Customers
Quotes
Invoices
More
```

Primary action:

```text
+ Create Quote
```

should be easily accessible.

---

# 38. Security Architecture

Minimum security controls:

```text
HTTPS
Authentication
Authorization
Input Validation
Database Constraints
Secure Password Handling
CSRF protection where applicable
Rate Limiting
Secure Cookies
Security Headers
```

Do not implement custom cryptography.

Use established libraries and framework capabilities.

---

# 39. Database Security

Database access should only occur on the server.

Never expose:

```text
DATABASE_URL
Database credentials
Database connection
```

to the web browser or mobile application.

---

# 40. Deployment Architecture

A simple production deployment is recommended.

Example:

```text
                    Internet
                       │
                       ▼
                ┌──────────────┐
                │ Web Hosting  │
                │   Next.js    │
                └──────┬───────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
        PostgreSQL          Object Storage
          Database             S3/R2
```

The exact hosting provider can be selected later.

Possible choices:

### Web/API

* Vercel
* AWS
* Railway
* Render

### PostgreSQL

* Supabase
* Neon
* AWS RDS
* Railway
* Render

### Storage

* AWS S3
* Cloudflare R2
* Supabase Storage

For the first deployment, choose the simplest reliable combination rather than optimizing for infrastructure complexity.

---

# 41. Development Environment

Local development should support:

```text
Node.js
npm/pnpm
PostgreSQL
Git
GitHub
Flutter SDK
Android Studio / Xcode where required
```

A developer should be able to clone the repository and follow the README to start the application.

---

# 42. GitHub Repository Strategy

For V1, use a monorepo.

```text
quote-invoice-builder/
│
├── web/
├── mobile/
├── docs/
├── .github/
├── CLAUDE.md
├── README.md
└── .gitignore
```

Advantages:

* One repository
* Shared documentation
* Easier Claude Code context
* Easier issue management
* Single source of truth

---

# 43. Git Branching

Use a simple branching strategy.

```text
main
  │
  └── develop
       │
       ├── feature/auth
       ├── feature/customers
       ├── feature/products
       ├── feature/quotes
       └── feature/invoices
```

For a solo developer, this can be simplified further.

Do not create complicated Git workflows unnecessarily.

---

# 44. CI/CD

GitHub Actions should eventually handle:

### Pull Request

```text
Lint
Type Check
Unit Tests
Build
```

### Main Branch

```text
Lint
Type Check
Tests
Build
Deploy
```

The initial CI pipeline should remain lightweight.

---

# 45. Testing Architecture

Testing should exist at multiple levels.

### Unit Tests

Test:

* Financial calculations
* Tax calculations
* Discount calculations
* Status transitions
* Quote → Invoice conversion
* Number generation

### Integration Tests

Test:

* API
* Database
* Authentication
* Authorization

### E2E Tests

Test critical flows:

```text
Register
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
Convert to Invoice
   ↓
Mark Paid
```

---

# 46. PDF Testing

PDF generation should be tested to ensure:

* Correct customer
* Correct business information
* Correct items
* Correct totals
* Correct taxes
* Correct invoice/quote number
* Correct dates

Financial values must match the database.

---

# 47. Observability

V1 observability should consist of:

```text
Application Logs
        +
Sentry Error Monitoring
        +
Basic Performance Monitoring
```

Do not introduce a complex observability stack unless required.

---

# 48. Future Architecture Evolution

The architecture should allow future services to be introduced without redesigning the entire product.

Potential future architecture:

```text
                    Clients
                  /         \
                Web        Mobile
                  \         /
                   API
                    │
        ┌───────────┼────────────┐
        │           │            │
     Quotes      Invoices       AI
        │           │            │
        └───────────┼────────────┘
                    │
                PostgreSQL
                    │
              Object Storage
```

Later, if needed:

```text
WhatsApp Service
Payment Service
Notification Service
AI Service
Email Service
```

should be added as separate integrations/services only when complexity justifies them.

---

# 49. Architecture Decisions

| Decision         | V1 Choice                   |
| ---------------- | --------------------------- |
| Web              | Next.js                     |
| Language         | TypeScript                  |
| UI               | React                       |
| Styling          | Tailwind CSS                |
| UI Components    | shadcn/ui                   |
| Backend          | Next.js API                 |
| Database         | PostgreSQL                  |
| ORM              | Prisma                      |
| Authentication   | Auth.js                     |
| Mobile           | Flutter                     |
| Mobile Language  | Dart                        |
| Mobile State     | Riverpod                    |
| PDF              | Centralized backend service |
| Storage          | S3-compatible storage       |
| Error Monitoring | Sentry                      |
| Repository       | GitHub                      |
| CI/CD            | GitHub Actions              |
| Architecture     | Modular monolith            |
| Deployment       | Simple cloud deployment     |

---

# 50. Why Modular Monolith?

The MVP should **not** start with microservices.

Recommended:

```text
             Modular Monolith
                    │
       ┌────────────┼─────────────┐
       │            │             │
    Customers     Quotes       Invoices
       │            │             │
       └────────────┼─────────────┘
                    │
               PostgreSQL
```

This gives us:

* Faster development
* Easier debugging
* Easier deployment
* Lower cost
* Less infrastructure
* Easier Claude Code development

If the product grows significantly, modules can later be extracted into services.

---

# 51. Architecture Constraints

Claude Code and developers must not introduce the following without explicit approval:

* Microservices
* Redis
* Kafka
* RabbitMQ
* Kubernetes
* GraphQL
* Event-driven architecture
* Multiple databases
* Multiple backend services
* Complex caching systems

These may be valid technologies, but they are unnecessary for this MVP.

---

# 52. Final Architecture

The final V1 architecture is:

```text
                     ┌─────────────────────┐
                     │      GitHub         │
                     │ Source + CI/CD      │
                     └──────────┬──────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
        ┌─────────────────┐           ┌─────────────────┐
        │    Next.js      │           │     Flutter     │
        │ Responsive Web  │           │ Android / iOS  │
        └────────┬────────┘           └────────┬────────┘
                 │                             │
                 └──────────────┬──────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │     Next.js API     │
                     └──────────┬──────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
       ┌───────────┐      ┌────────────┐     ┌────────────┐
       │ Services  │      │ PDF Service│     │  Storage   │
       └─────┬─────┘      └────────────┘     └────────────┘
             │
             ▼
       ┌─────────────┐
       │ Repositories│
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ PostgreSQL  │
       └─────────────┘

              +
       ┌─────────────┐
       │   Sentry    │
       │ Error/Perf  │
       └─────────────┘
```

---

# 53. Implementation Priority

Development should follow this order:

```text
1. Repository + project setup
2. Database + migrations
3. Authentication
4. Application layout
5. Business profile
6. Customers
7. Products
8. Quote calculation engine
9. Quotes
10. PDF generation
11. Invoices
12. Dashboard
13. Error monitoring
14. Testing
15. Responsive refinement
16. Flutter application
17. Mobile testing
18. Production deployment
```

---

## End of System Architecture Document — V1
