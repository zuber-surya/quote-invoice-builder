# Quote & Invoice Builder

## Testing & QA Specification — MVP V1

**Document Version:** 1.0
**Status:** Mandatory QA Standard
**Platforms:** Web + Responsive Web + Flutter Mobile
**Backend:** REST API + PostgreSQL
**Web Testing:** Vitest + React Testing Library + Playwright
**Mobile Testing:** Flutter Unit + Widget + Integration Tests
**CI:** GitHub Actions
**Error Monitoring:** Sentry

---

# 1. Purpose

This document defines the testing and quality assurance standards for the Quote & Invoice Builder MVP.

The objective is to ensure:

* Financial calculations are correct.
* Users cannot access another user's data.
* Quotes and invoices follow valid business rules.
* Web and mobile behave consistently.
* Responsive layouts work correctly.
* API failures are handled properly.
* Critical workflows are covered end-to-end.
* Production releases do not contain obvious regressions.

---

# 2. QA Philosophy

Testing priority should be:

```text
Financial correctness
        ↓
Security / authorization
        ↓
Core business workflows
        ↓
API reliability
        ↓
UI correctness
        ↓
Responsive behavior
        ↓
Visual polish
```

For this application, a wrong invoice amount is significantly more serious than a minor visual defect.

---

# 3. Testing Pyramid

The application should follow:

```text
                 ┌───────────┐
                 │   E2E     │
                 │   Tests   │
                 └─────┬─────┘
                       │
                ┌──────▼──────┐
                │ Integration │
                │    Tests    │
                └──────┬──────┘
                       │
              ┌────────▼────────┐
              │   Unit Tests    │
              │                 │
              └─────────────────┘
```

Most tests should be unit tests.

Critical workflows should have integration/E2E coverage.

---

# 4. Test Levels

## Level 1 — Unit

Test individual:

* Functions
* Calculations
* Validators
* Formatters
* State transitions

## Level 2 — Integration

Test:

* API
* Database
* Services
* Repositories
* Authentication
* Transactions

## Level 3 — E2E

Test:

* Complete user workflows
* Web UI
* Mobile workflows where appropriate

## Level 4 — Manual QA

Perform final visual and usability verification.

---

# 5. Testing Tools

## Web

```text
Vitest
React Testing Library
Playwright
```

## Backend/API

```text
Vitest
Supertest or equivalent HTTP testing approach
Test PostgreSQL database
```

## Mobile

```text
flutter test
Flutter Widget Tests
Flutter Integration Tests
```

## CI

```text
GitHub Actions
```

---

# 6. Test Environment

Never run automated tests against production.

Use:

```text
Development
Test
Staging
Production
```

The automated test suite should use a dedicated test environment.

---

# 7. Test Database

Integration tests must use a separate database.

Example:

```text
quote_invoice_test
```

Never use:

```text
production database
```

for automated tests.

---

# 8. Test Data

Use test factories/fixtures.

Examples:

```text
createTestUser()
createTestBusiness()
createTestCustomer()
createTestProduct()
createTestQuote()
createTestInvoice()
createTestPayment()
```

Avoid duplicating large test objects in every test file.

---

# 9. Test Data Isolation

Each test should be isolated.

A test should not depend on:

```text
Previous test
Database state from another test
Execution order
```

Prefer:

```text
Setup
 ↓
Test
 ↓
Cleanup
```

or transaction-based isolation where appropriate.

---

# 10. Critical Business Rules

The following require high test coverage:

```text
Quote calculations
Invoice calculations
Tax
Discount
Payment
Remaining balance
Payment status
Quote status
Invoice status
Quote → Invoice conversion
Document numbering
User ownership
```

---

# 11. Quote Calculation Tests

Test:

```text
Quantity × Unit Price
```

Example:

```text
1 × ₹1,000 = ₹1,000
```

Test multiple quantities:

```text
3 × ₹1,000 = ₹3,000
```

---

# 12. Decimal Calculation Tests

Test values that commonly expose floating-point issues.

Examples:

```text
₹99.99 × 3
₹10.10 × 7
₹0.01 × 3
```

The final result must be financially accurate.

---

# 13. Subtotal Tests

Example:

```text
Item A = ₹10,000
Item B = ₹5,000

Subtotal = ₹15,000
```

Test:

* One item
* Multiple items
* Zero items
* Deleted item
* Updated quantity
* Updated price

---

# 14. Discount Tests

Test:

```text
No discount
Fixed discount
Percentage discount
Maximum valid discount
Zero discount
```

If V1 supports only one discount type, test only the supported type.

Do not implement unsupported business rules simply for testing.

---

# 15. Tax Tests

Test:

```text
0%
5%
12%
18%
28%
```

where applicable to the supported configuration.

Example:

```text
Subtotal = ₹10,000
Tax = 18%

Tax amount = ₹1,800
Total = ₹11,800
```

---

# 16. Combined Calculation Tests

Example:

```text
Subtotal     ₹20,000
Discount      ₹2,000
Taxable       ₹18,000
Tax 18%        ₹3,240
Total         ₹21,240
```

The calculation must be deterministic.

---

# 17. Multiple Item Calculation

Example:

```text
Website       1 × ₹25,000
Hosting       2 × ₹5,000
────────────────────────
Subtotal         ₹35,000
```

Tax and discount should then be calculated according to the defined business rules.

---

# 18. Zero Value Tests

Test:

```text
Quantity = 0
Price = 0
Discount = 0
Tax = 0
```

The API must either:

* Reject invalid values, or
* Handle them according to the business rules.

The behavior must be explicitly defined.

---

# 19. Negative Value Tests

The API must reject invalid negative values where business rules prohibit them.

Examples:

```text
Quantity = -1
Price = -100
Tax = -5
Discount = -100
Payment = -500
```

---

# 20. Excessive Value Tests

Test reasonable maximum limits.

Examples:

```text
Extremely large quantity
Extremely large price
Extremely large discount
Extremely large tax
```

The API should prevent values that exceed database/business limits.

---

# 21. Payment Tests

Test:

```text
Payment = 0
Payment < remaining
Payment = remaining
Payment > remaining
Negative payment
Multiple payments
```

Expected:

```text
Payment = remaining
        ↓
Paid
```

---

# 22. Partial Payment

Example:

```text
Invoice Total = ₹50,000
Payment = ₹20,000

Paid = ₹20,000
Remaining = ₹30,000
Status = Partially Paid
```

Test this on both API/service level and UI where appropriate.

---

# 23. Full Payment

Example:

```text
Invoice Total = ₹50,000
Payment = ₹50,000

Paid = ₹50,000
Remaining = ₹0
Status = Paid
```

---

# 24. Overpayment

Example:

```text
Invoice Total = ₹50,000
Remaining = ₹30,000
Payment = ₹35,000
```

Expected:

```text
Request rejected.
```

The backend must enforce this even if the UI already validates it.

---

# 25. Multiple Payments

Example:

```text
Invoice = ₹50,000

Payment 1 = ₹10,000
Payment 2 = ₹15,000
Payment 3 = ₹25,000
```

Expected:

```text
Paid = ₹50,000
Remaining = ₹0
Status = Paid
```

---

# 26. Payment Concurrency

The backend should protect against two simultaneous payment requests causing an incorrect balance.

Test:

```text
Remaining = ₹10,000

Request A = ₹10,000
Request B = ₹10,000

```

Only one should succeed if the resulting balance would otherwise become negative.

This should be verified using database transactions/locking appropriate to the implementation.

---

# 27. Quote Status Tests

Supported statuses:

```text
Draft
Sent
Accepted
Rejected
Expired
```

Test valid transitions.

Example:

```text
Draft → Sent
Sent → Accepted
Sent → Rejected
```

---

# 28. Invalid Quote Status Transitions

Test invalid operations such as:

```text
Draft → Accepted
Draft → Rejected
Rejected → Accepted
Accepted → Rejected
```

unless explicitly allowed by business rules.

The backend must reject invalid transitions.

---

# 29. Invoice Status Tests

Supported statuses:

```text
Draft
Unpaid
Partially Paid
Paid
Overdue
```

Test valid state transitions.

Payment status should be derived from authoritative payment data where applicable.

---

# 30. Quote → Invoice Conversion

Critical test.

Given:

```text
Quote Q-00025
Customer ABC
Total ₹29,500
Status Accepted
```

Convert to invoice.

Expected:

```text
Invoice created
Customer copied
Items copied
Quantities copied
Prices copied
Taxes copied
Total preserved
Quote linked to invoice
```

---

# 31. Conversion Idempotency

Attempt to convert the same quote twice.

Expected:

```text
First conversion → Success
Second conversion → Rejected or returns existing invoice
```

The application must not create duplicate invoices accidentally.

---

# 32. Conversion Status Restriction

Test:

```text
Draft Quote → Convert
```

Expected:

```text
Rejected
```

unless the product explicitly allows conversion from draft.

The backend is authoritative.

---

# 33. Customer Isolation

User A must not be able to access:

```text
User B's customers
```

Test:

```text
GET /customers/{userBCustomerId}
```

while authenticated as User A.

Expected:

```text
404 or 403
```

according to the security design.

---

# 34. Quote Isolation

User A must not access User B's quote.

Test:

```text
GET /quotes/{userBQuoteId}
```

Expected:

```text
Access denied/not found.
```

---

# 35. Invoice Isolation

User A must not access User B's invoice.

Test:

```text
GET /invoices/{userBInvoiceId}
```

Expected:

```text
Access denied/not found.
```

---

# 36. Payment Isolation

User A must not record payment against User B's invoice.

This must be tested at the backend level.

---

# 37. ID Tampering Tests

Test changing:

```text
customerId
quoteId
invoiceId
productId
```

to IDs belonging to another user.

The backend must reject unauthorized access.

---

# 38. Authentication Tests

Test:

```text
Valid login
Invalid password
Unknown email
Missing credentials
Expired session
Logout
Unauthorized API access
```

---

# 39. Authorization Tests

Test every protected resource.

Examples:

```text
Customers
Products
Quotes
Invoices
Payments
Business Profile
Settings
```

No protected endpoint should work without proper authentication.

---

# 40. Input Validation Tests

Test invalid:

```text
Email
Phone
Name
Tax
Price
Quantity
Dates
IDs
```

The API must return a standardized validation error.

---

# 41. Required Field Tests

Verify required fields.

Customer:

```text
Name
```

Quote:

```text
Customer
Items
```

Invoice:

```text
Customer
Items
```

The exact mandatory fields must follow the API specification.

---

# 42. Date Validation

Test:

```text
Quote expiry before quote date
Invoice due date before invoice date
Invalid date format
Missing date
```

The backend should reject invalid combinations.

---

# 43. Document Number Tests

Test:

```text
Q-00001
Q-00002
Q-00003
```

and:

```text
INV-00001
INV-00002
```

Ensure numbers are unique.

---

# 44. Concurrent Number Generation

Simulate multiple simultaneous quote creation requests.

Expected:

```text
Request A → Q-00001
Request B → Q-00002
```

Never:

```text
Request A → Q-00001
Request B → Q-00001
```

Database-level protection is required.

---

# 45. API Response Tests

Verify API responses contain:

* Correct HTTP status
* Correct response shape
* Correct data
* Correct error format

---

# 46. API Status Codes

Recommended:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error where applicable
429 Too Many Requests
500 Internal Server Error
```

The actual API specification remains authoritative.

---

# 47. API Error Format

All API errors should follow a consistent structure.

Example:

```json id="i6gj2k"
{
  "success": false,
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote was not found."
  }
}
```

The exact structure must match the API specification.

---

# 48. Web Unit Tests

Test reusable utilities:

```text
formatCurrency
formatDate
calculateTotals
paymentStatus
validationSchemas
```

---

# 49. Web Component Tests

Test critical components:

```text
CustomerForm
ProductForm
QuoteForm
QuoteItemForm
QuoteSummary
InvoiceForm
PaymentForm
StatusBadge
```

Verify:

* Rendering
* User interaction
* Validation
* Loading state
* Error state

---

# 50. Web Form Tests

Customer form:

```text
Empty name → validation error
Valid name → submit
API failure → error message
Success → navigation/feedback
```

Quote form:

```text
Select customer
Add item
Change quantity
Change price
Apply discount
Change tax
Verify displayed total
Generate
```

---

# 51. Web Dashboard Tests

Verify:

```text
Dashboard loads
Summary values appear
Recent quotes appear
Recent invoices appear
Empty states work
API errors show correctly
```

---

# 52. Responsive Web Testing

Minimum viewport tests:

```text
320 × 800
375 × 812
390 × 844
414 × 896
768 × 1024
1024 × 768
1280 × 800
1440 × 900
```

---

# 53. Responsive Test Priorities

Verify:

```text
Navigation
Forms
Tables
Cards
Buttons
Dialogs
Quote creation
Invoice creation
PDF actions
```

---

# 54. Mobile Widget Tests

Test:

```text
CustomerCard
ProductCard
QuoteCard
InvoiceCard
QuoteItemCard
PaymentForm
QuoteSummary
```

---

# 55. Mobile State Tests

Verify providers correctly represent:

```text
Initial
Loading
Success
Empty
Error
Refreshing
Submitting
```

---

# 56. Mobile API Tests

Test:

```text
Successful response
401
403
404
422
500
Network timeout
No internet
Malformed response
```

---

# 57. Mobile Authentication Tests

Test:

```text
Login success
Login failure
Token storage
Logout
Expired token
401 handling
Redirect to login
```

---

# 58. Mobile Form Tests

Test:

```text
Customer creation
Product creation
Quote creation
Invoice creation
Payment
```

Verify validation and loading states.

---

# 59. Mobile Navigation Tests

Verify:

```text
Login → Dashboard
Dashboard → Customers
Dashboard → Quotes
Dashboard → Invoices
Quote → Invoice
Invoice → Payment
Logout → Login
```

---

# 60. Mobile Integration Test

Critical workflow:

```text
Login
 ↓
Create Customer
 ↓
Create Product
 ↓
Create Quote
 ↓
Generate
 ↓
Open Quote
 ↓
Convert Invoice
 ↓
Record Payment
 ↓
Paid
```

---

# 61. E2E Web Test — Primary Flow

The main Playwright test should cover:

```text
Register
 ↓
Business Setup
 ↓
Dashboard
 ↓
Create Customer
 ↓
Create Product
 ↓
Create Quote
 ↓
Generate Quote
 ↓
Open Quote
 ↓
Accept
 ↓
Convert to Invoice
 ↓
Record Payment
 ↓
Verify Paid
```

---

# 62. E2E Web Test — Draft Quote

```text
Login
 ↓
Create Quote
 ↓
Add customer
 ↓
Add item
 ↓
Save Draft
 ↓
Close
 ↓
Open Quotes
 ↓
Verify Draft
```

---

# 63. E2E Web Test — Partial Payment

```text
Create Invoice
 ↓
Record ₹10,000
 ↓
Verify Partially Paid
 ↓
Verify Remaining Amount
```

---

# 64. E2E Web Test — Full Payment

```text
Invoice
 ↓
Record remaining balance
 ↓
Verify Paid
 ↓
Verify Remaining = ₹0
```

---

# 65. E2E Web Test — Authorization

```text
Login User A
 ↓
Create Quote A
 ↓
Logout
 ↓
Login User B
 ↓
Attempt Quote A URL
 ↓
Verify Access Denied
```

---

# 66. PDF Tests

Verify:

```text
PDF generated
PDF opens
Correct business name
Correct customer
Correct quote/invoice number
Correct items
Correct totals
Correct tax
Correct final amount
```

---

# 67. PDF Regression Tests

When PDF layout changes, verify:

* Header
* Logo
* Customer section
* Items table
* Totals
* Notes
* Terms
* Page breaks

Visual PDF regression can be introduced later if required.

---

# 68. PDF Financial Integrity

The PDF must use backend-authoritative values.

Test that the PDF total matches the database/API total.

Example:

```text
Database Total = ₹29,500
PDF Total      = ₹29,500
```

---

# 69. API Contract Testing

Web and mobile depend on the API contract.

When an API response changes:

```text
Backend
 ↓
API Contract
 ↓
Web
 ↓
Mobile
```

The API specification must be updated.

Breaking changes require explicit review.

---

# 70. Regression Testing

After implementing a new feature, run:

```text
Lint
Type Check
Unit Tests
Integration Tests
Relevant E2E Tests
```

Before release:

```text
Full test suite
```

---

# 71. Bug Severity

## Critical

Examples:

```text
Incorrect invoice total
Cross-user data access
Duplicate invoice creation
Payment recorded incorrectly
Authentication bypass
Database corruption
```

Must block release.

---

## High

Examples:

```text
Quote cannot be generated
Invoice conversion fails
Payment cannot be recorded
PDF has incorrect totals
Major mobile crash
```

Should block release unless explicitly accepted.

---

## Medium

Examples:

```text
Search issue
Minor responsive problem
Non-critical validation issue
```

Can be prioritized based on release impact.

---

## Low

Examples:

```text
Minor spacing
Minor visual inconsistency
Small copy issue
```

Can be fixed after MVP if necessary.

---

# 72. Bug Report Format

Every bug should include:

```text
Title

Environment

Steps to Reproduce

Expected Result

Actual Result

Screenshots/Video

Request ID if API-related

Severity

Device/Browser

App Version
```

---

# 73. QA Checklist Per Feature

Before marking a feature complete:

```text
[ ] Functional requirement works
[ ] Validation works
[ ] Loading state works
[ ] Empty state works
[ ] Error state works
[ ] Authorization tested
[ ] Responsive UI tested
[ ] Mobile tested
[ ] Unit tests added
[ ] Integration tests added where necessary
[ ] E2E test added for critical workflow
```

---

# 74. Database Migration Testing

Every database migration should be tested.

Verify:

```text
Migration applies successfully
Migration does not destroy existing data
Indexes work
Constraints work
Rollback strategy understood
```

Do not test migrations only against an empty database.

---

# 75. Seed Data

Development/test seed data should include:

```text
User
Business
Customers
Products
Draft Quote
Sent Quote
Accepted Quote
Rejected Quote
Unpaid Invoice
Partially Paid Invoice
Paid Invoice
```

This makes UI testing easier.

---

# 76. Performance Testing

MVP does not require extensive load testing.

However, verify reasonable performance for:

```text
Dashboard
Customer list
Quote list
Invoice list
Quote creation
Invoice creation
PDF generation
```

---

# 77. API Performance

Check for:

```text
N+1 queries
Unnecessary joins
Large payloads
Missing pagination
Repeated API calls
Slow PDF generation
```

---

# 78. Database Performance

Verify important indexes exist for:

```text
userId
customerId
quoteId
invoiceId
status
createdAt
```

The exact indexes follow the database design.

---

# 79. Security QA

Before production:

```text
[ ] Authentication tested
[ ] Authorization tested
[ ] User isolation tested
[ ] Input validation tested
[ ] SQL injection checked
[ ] XSS checked
[ ] CSRF strategy verified
[ ] File upload checked
[ ] Rate limiting reviewed
[ ] Secrets checked
[ ] Error leakage checked
```

---

# 80. Dependency Security

Run dependency/security checks regularly.

Check for:

```text
Known vulnerabilities
Outdated packages
Abandoned packages
License issues
```

Do not blindly update major versions immediately before release.

---

# 81. Sentry QA

Verify Sentry captures:

```text
Unhandled frontend exception
Unhandled backend exception
Critical API failure
Mobile crash
```

Verify sensitive information is not unintentionally captured.

---

# 82. Logging QA

Verify logs contain useful correlation information:

```text
Request ID
Timestamp
Endpoint
Status
Error Code
```

Do not log secrets.

---

# 83. CI Quality Gates

Pull requests must pass:

```text
Formatting
Lint
Type Check
Unit Tests
Integration Tests
Build
```

Critical E2E tests should run before production deployment.

---

# 84. GitHub Actions Flow

Recommended:

```text
Pull Request
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
     ↓
PR Approved
```

---

# 85. Release QA

Before production:

```text
[ ] All Critical bugs closed
[ ] All High bugs closed or explicitly accepted
[ ] Core E2E flow passes
[ ] Financial calculation tests pass
[ ] Authorization tests pass
[ ] PDF tests pass
[ ] Mobile release build works
[ ] Production configuration verified
[ ] Sentry verified
[ ] Database backup verified
```

---

# 86. Smoke Test

Immediately after deployment:

```text
Login
Create customer
Create product
Create quote
Generate PDF
Create/convert invoice
Record payment
Logout
```

This should be a short production smoke test.

---

# 87. Production Monitoring

After release monitor:

```text
API error rate
Authentication errors
Quote creation failures
Invoice creation failures
Payment failures
PDF failures
Mobile crashes
Database errors
```

---

# 88. Acceptance Criteria — Authentication

```text
[ ] User can register
[ ] User can log in
[ ] Invalid login is rejected
[ ] User can log out
[ ] Protected pages require authentication
[ ] Session expiration works
```

---

# 89. Acceptance Criteria — Customers

```text
[ ] User can create customer
[ ] User can edit customer
[ ] User can view customer
[ ] User can search customers
[ ] User can delete customer where allowed
[ ] User cannot access another user's customer
```

---

# 90. Acceptance Criteria — Products

```text
[ ] User can create product
[ ] User can edit product
[ ] User can search products
[ ] User can delete product where allowed
[ ] Product can be selected while creating quote
```

---

# 91. Acceptance Criteria — Quotes

```text
[ ] User can create quote
[ ] User can select customer
[ ] User can add products
[ ] User can add custom items
[ ] User can modify quantity
[ ] User can modify price
[ ] Tax works
[ ] Discount works
[ ] Total is correct
[ ] User can save draft
[ ] User can generate quote
[ ] User can view quote
[ ] User can download PDF
[ ] User can change supported status
```

---

# 92. Acceptance Criteria — Invoice

```text
[ ] User can create invoice
[ ] Accepted quote can become invoice
[ ] Invoice items are correct
[ ] Invoice total is correct
[ ] Invoice PDF works
[ ] Invoice can be viewed
```

---

# 93. Acceptance Criteria — Payments

```text
[ ] User can record payment
[ ] Partial payment works
[ ] Full payment works
[ ] Remaining balance is correct
[ ] Paid status is correct
[ ] Overpayment is rejected
[ ] Payment history is correct
```

---

# 94. Acceptance Criteria — Responsive Web

```text
[ ] Desktop works
[ ] Tablet works
[ ] Mobile web works
[ ] Navigation works
[ ] Tables transform appropriately
[ ] Forms remain usable
[ ] No horizontal overflow
[ ] Buttons remain accessible
```

---

# 95. Acceptance Criteria — Mobile

```text
[ ] Android build works
[ ] iOS build works
[ ] Login works
[ ] Dashboard works
[ ] Customers work
[ ] Products work
[ ] Quotes work
[ ] Invoices work
[ ] Payments work
[ ] PDF viewing works
[ ] Native sharing works
[ ] Logout works
```

---

# 96. MVP Quality Gate

The MVP should not be released if any of the following remain unresolved:

```text
❌ Incorrect financial calculation
❌ Cross-user data access
❌ Duplicate invoice generation
❌ Incorrect payment balance
❌ Authentication bypass
❌ Critical API failure
❌ Critical mobile crash
❌ PDF contains incorrect financial information
```

---

# 97. Final MVP Test Flow

The most important automated flow is:

```text
REGISTER
   ↓
BUSINESS PROFILE
   ↓
CREATE CUSTOMER
   ↓
CREATE PRODUCT
   ↓
CREATE QUOTE
   ↓
ADD ITEM
   ↓
CALCULATE TOTAL
   ↓
GENERATE QUOTE
   ↓
VERIFY PDF
   ↓
ACCEPT QUOTE
   ↓
CONVERT TO INVOICE
   ↓
VERIFY INVOICE
   ↓
RECORD PARTIAL PAYMENT
   ↓
VERIFY REMAINING
   ↓
RECORD FINAL PAYMENT
   ↓
VERIFY PAID
   ↓
VERIFY PDF
```

If this workflow works reliably, the core MVP is in good shape.

---

# 98. Final QA Principle

The testing strategy should follow:

> **Test the money, test the permissions, test the workflow, then test the pixels.**

For this product, correctness and security are more important than having an enormous test suite.

---

## End of Testing & QA Specification — V1
