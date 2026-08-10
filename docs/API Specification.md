# Quote & Invoice Builder

## API Specification — MVP V1

**Document Version:** 1.0
**Status:** MVP
**API Style:** REST
**Backend:** Next.js API / Route Handlers
**Database:** PostgreSQL
**ORM:** Prisma
**Authentication:** Auth.js
**Related Documents:** PRD V1, System Architecture V1, Database Design V1

---

# 1. Purpose

This document defines the REST API for the Quote & Invoice Builder MVP.

The API will be consumed by:

* Next.js responsive web application
* Flutter mobile application
* Future integrations such as WhatsApp, AI, email, and payment services

The API must provide a consistent interface for:

* Authentication
* Business profile
* Customers
* Products/services
* Quotes
* Invoices
* Dashboard
* PDF generation

---

# 2. API Principles

The API must follow these principles:

1. RESTful resource-oriented design.
2. HTTPS in production.
3. JSON request/response format unless otherwise specified.
4. Authentication required for protected endpoints.
5. Authorization required for every business-owned resource.
6. Validate all input on the server.
7. Never trust client-calculated financial totals.
8. Return consistent error responses.
9. Use HTTP status codes correctly.
10. Do not expose database implementation details.
11. Use pagination for list endpoints.
12. Use UUIDs for internal resource IDs.
13. Use quote/invoice numbers for user-facing document identification.
14. Keep API responses predictable for web and mobile clients.
15. Business logic belongs in services, not route handlers.

---

# 3. Base URL

Development:

```text
http://localhost:3000/api
```

Production:

```text
https://<production-domain>/api
```

The production domain must be configured through environment variables.

Example:

```text
NEXT_PUBLIC_API_URL
```

For the Next.js web application, internal server-side calls may use application services directly where appropriate rather than unnecessarily calling its own HTTP API.

The Flutter application will always communicate through the public API.

---

# 4. API Versioning

V1 endpoints should use:

```text
/api/v1/
```

Example:

```text
/api/v1/customers
/api/v1/quotes
/api/v1/invoices
```

This allows future versions to coexist.

Example future:

```text
/api/v2/quotes
```

Do not implement multiple API versions in V1.

---

# 5. Authentication

Authentication will use the application's authentication system.

Protected API requests must identify the current authenticated user.

Example:

```text
Authorization: Bearer <token>
```

The exact authentication mechanism for web sessions may differ from the mobile API authentication mechanism.

The API implementation must abstract authentication behind a common server-side function:

```text
getCurrentUser()
```

Example:

```typescript
const user = await getCurrentUser();

if (!user) {
  throw new UnauthorizedError();
}
```

---

# 6. Authentication Requirements

Protected endpoints must:

1. Identify the authenticated user.
2. Reject unauthenticated requests.
3. Retrieve the user's internal ID.
4. Use that ID for all ownership queries.
5. Never accept `user_id` from the client as the source of authorization.

Bad:

```json
{
  "userId": "some-user-id"
}
```

The server must determine the user from authentication.

---

# 7. HTTP Status Codes

Use standard HTTP status codes.

| Status | Usage                                  |
| ------ | -------------------------------------- |
| 200    | Successful request                     |
| 201    | Resource created                       |
| 204    | Successful deletion/no content         |
| 400    | Invalid request                        |
| 401    | Not authenticated                      |
| 403    | Not authorized                         |
| 404    | Resource not found                     |
| 409    | Conflict                               |
| 422    | Validation/business validation failure |
| 429    | Rate limit                             |
| 500    | Unexpected server error                |

---

# 8. Standard Success Response

Single resource:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example"
  }
}
```

List:

```json
{
  "success": true,
  "data": [
    {}
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Action:

```json
{
  "success": true,
  "data": {
    "message": "Quote converted to invoice successfully."
  }
}
```

---

# 9. Standard Error Response

All API errors should follow:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message."
  }
}
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer was not found."
  }
}
```

---

# 10. Validation Error Response

For field validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {
      "name": "Name is required.",
      "email": "Invalid email address."
    }
  }
}
```

The frontend should be able to map field errors directly to form fields.

---

# 11. Error Codes

Initial error codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CUSTOMER_NOT_FOUND
PRODUCT_NOT_FOUND
QUOTE_NOT_FOUND
INVOICE_NOT_FOUND
QUOTE_ALREADY_CONVERTED
QUOTE_NOT_ACCEPTED
INVOICE_ALREADY_PAID
INVALID_PAYMENT_AMOUNT
DUPLICATE_DOCUMENT_NUMBER
BUSINESS_PROFILE_NOT_FOUND
RESOURCE_NOT_FOUND
INVALID_STATUS_TRANSITION
PDF_GENERATION_FAILED
INTERNAL_SERVER_ERROR
RATE_LIMIT_EXCEEDED
```

New error codes should be added only when they provide useful client behavior.

---

# 12. Pagination

List APIs should support:

```text
?page=1&pageSize=20
```

Default:

```text
page = 1
pageSize = 20
```

Maximum:

```text
pageSize = 100
```

The server must enforce the maximum.

Example:

```text
GET /api/v1/customers?page=1&pageSize=20
```

---

# 13. Sorting

Where required, list endpoints may support:

```text
?sortBy=createdAt&sortOrder=desc
```

Supported fields must be explicitly whitelisted.

Never directly pass arbitrary client-provided column names into database queries.

---

# 14. Search

Search should use:

```text
?search=Ahmed
```

The server determines which fields are searchable.

Example customer search:

```text
GET /api/v1/customers?search=Ahmed
```

May search:

* Name
* Company name
* Email
* Phone

---

# 15. Authentication Endpoints

Authentication implementation may be provided by Auth.js rather than custom REST endpoints.

The application should expose only the API capabilities actually required by the chosen authentication architecture.

The mobile application must have a supported authentication flow.

The final implementation must not create duplicate authentication systems.

---

# 16. Current User

### GET `/api/v1/me`

Returns the authenticated user's basic information.

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Authentication

Required.

---

# 17. Business Profile APIs

## GET `/api/v1/business-profile`

Returns the current user's business profile.

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "ABC Services",
    "logoUrl": "https://...",
    "ownerName": "John Doe",
    "email": "john@example.com",
    "phone": "+91...",
    "address": "123 Main Street",
    "city": "Rajula",
    "state": "Gujarat",
    "country": "India",
    "postalCode": "365560",
    "taxNumber": "GST...",
    "website": "https://example.com",
    "currency": "INR"
  }
}
```

---

# 18. Update Business Profile

### PUT `/api/v1/business-profile`

### Request

```json
{
  "businessName": "ABC Services",
  "logoUrl": "https://...",
  "ownerName": "John Doe",
  "email": "john@example.com",
  "phone": "+91...",
  "address": "123 Main Street",
  "city": "Rajula",
  "state": "Gujarat",
  "country": "India",
  "postalCode": "365560",
  "taxNumber": "GST...",
  "website": "https://example.com",
  "currency": "INR"
}
```

### Response

Returns the updated business profile.

---

# 19. Customer APIs

## GET `/api/v1/customers`

Returns paginated customers.

### Query Parameters

```text
page
pageSize
search
sortBy
sortOrder
```

Example:

```text
GET /api/v1/customers?page=1&pageSize=20&search=Ahmed
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ahmed Khan",
      "companyName": "Ahmed Traders",
      "email": "ahmed@example.com",
      "phone": "+91...",
      "city": "Rajula",
      "quoteCount": 4,
      "invoiceCount": 2,
      "createdAt": "2026-08-10T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 20. Create Customer

### POST `/api/v1/customers`

### Request

```json
{
  "name": "Ahmed Khan",
  "companyName": "Ahmed Traders",
  "email": "ahmed@example.com",
  "phone": "+91...",
  "address": "Main Road",
  "city": "Rajula",
  "state": "Gujarat",
  "country": "India",
  "postalCode": "365560",
  "taxNumber": "GST...",
  "notes": "Regular customer"
}
```

### Required

```text
name
```

### Response

HTTP `201`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ahmed Khan",
    "companyName": "Ahmed Traders"
  }
}
```

---

# 21. Get Customer

### GET `/api/v1/customers/:id`

Returns a customer and basic related information.

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ahmed Khan",
    "companyName": "Ahmed Traders",
    "email": "ahmed@example.com",
    "phone": "+91...",
    "address": "Main Road",
    "city": "Rajula",
    "state": "Gujarat",
    "country": "India",
    "postalCode": "365560",
    "taxNumber": "GST...",
    "notes": "Regular customer",
    "quoteCount": 4,
    "invoiceCount": 2
  }
}
```

---

# 22. Update Customer

### PUT `/api/v1/customers/:id`

Request:

```json
{
  "name": "Ahmed Khan",
  "companyName": "Ahmed Traders",
  "email": "ahmed@example.com",
  "phone": "+91..."
}
```

Only fields supplied according to the API contract should be updated.

---

# 23. Delete Customer

### DELETE `/api/v1/customers/:id`

A customer with existing financial documents should not be deleted.

If related quotes/invoices exist:

```text
HTTP 409
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_HAS_DOCUMENTS",
    "message": "This customer cannot be deleted because they have existing documents."
  }
}
```

---

# 24. Product APIs

## GET `/api/v1/products`

Query parameters:

```text
page
pageSize
search
sortBy
sortOrder
```

---

# 25. Create Product

### POST `/api/v1/products`

### Request

```json
{
  "name": "Website Development",
  "description": "Business website development",
  "unit": "Project",
  "price": "25000.00",
  "taxRate": "18.00"
}
```

### Validation

```text
name → required
unit → required
price >= 0
0 <= taxRate <= 100
```

### Response

HTTP `201`.

---

# 26. Get Product

### GET `/api/v1/products/:id`

Returns product details.

---

# 27. Update Product

### PUT `/api/v1/products/:id`

Request:

```json
{
  "name": "Website Development",
  "description": "Updated description",
  "unit": "Project",
  "price": "30000.00",
  "taxRate": "18.00"
}
```

Updating a product must not modify historical quote or invoice items.

---

# 28. Delete Product

### DELETE `/api/v1/products/:id`

A product can be deleted even if it was previously used in quotes/invoices because historical items contain snapshots.

Existing:

```text
quote_items.product_id
invoice_items.product_id
```

should become:

```text
NULL
```

where applicable.

---

# 29. Quote APIs

## GET `/api/v1/quotes`

Returns paginated quotes.

### Query Parameters

```text
page
pageSize
search
status
customerId
dateFrom
dateTo
sortBy
sortOrder
```

Example:

```text
GET /api/v1/quotes?status=SENT&page=1&pageSize=20
```

---

# 30. Quote List Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quoteNumber": "Q-00021",
      "customer": {
        "id": "uuid",
        "name": "Ahmed Khan"
      },
      "quoteDate": "2026-08-10",
      "expiryDate": "2026-08-25",
      "status": "SENT",
      "totalAmount": "33040.00",
      "createdAt": "2026-08-10T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 31. Get Quote

### GET `/api/v1/quotes/:id`

Returns complete quote details.

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quoteNumber": "Q-00021",
    "quoteDate": "2026-08-10",
    "expiryDate": "2026-08-25",
    "status": "SENT",
    "customer": {
      "id": "uuid",
      "name": "Ahmed Khan",
      "companyName": "Ahmed Traders",
      "email": "ahmed@example.com"
    },
    "items": [
      {
        "id": "uuid",
        "name": "Website Development",
        "description": "Business website",
        "unit": "Project",
        "quantity": "1.000",
        "unitPrice": "25000.00",
        "discountAmount": "0.00",
        "taxRate": "18.00",
        "taxAmount": "4500.00",
        "lineTotal": "29500.00",
        "sortOrder": 1
      }
    ],
    "subtotal": "25000.00",
    "discountAmount": "0.00",
    "taxAmount": "4500.00",
    "totalAmount": "29500.00",
    "notes": "Thank you.",
    "terms": "Valid for 15 days."
  }
}
```

---

# 32. Create Quote

### POST `/api/v1/quotes`

### Request

```json
{
  "customerId": "uuid",
  "quoteDate": "2026-08-10",
  "expiryDate": "2026-08-25",
  "items": [
    {
      "productId": "uuid",
      "name": "Website Development",
      "description": "Business website",
      "unit": "Project",
      "quantity": "1",
      "unitPrice": "25000.00",
      "discountAmount": "0.00",
      "taxRate": "18.00"
    }
  ],
  "notes": "Thank you.",
  "terms": "Valid for 15 days."
}
```

---

# 33. Create Quote Rules

The server must:

1. Authenticate user.
2. Validate customer ownership.
3. Validate product ownership where `productId` is provided.
4. Validate all item fields.
5. Calculate line totals.
6. Calculate subtotal.
7. Calculate discount.
8. Calculate tax.
9. Calculate total.
10. Generate quote number.
11. Create quote and items in a transaction.

The client must not be allowed to define authoritative:

```text
subtotal
taxAmount
totalAmount
```

The server calculates them.

---

# 34. Quote Item Rules

For each item:

```text
quantity > 0
unitPrice >= 0
discountAmount >= 0
0 <= taxRate <= 100
```

The API should reject invalid items.

---

# 35. Update Quote

### PUT `/api/v1/quotes/:id`

Only editable quotes should be modified.

Recommended V1 rule:

```text
DRAFT → editable
SENT → limited/no editing
ACCEPTED → not editable
REJECTED → not editable
EXPIRED → not editable
```

If a user needs to modify a sent quote, they should create a new quote or return it to draft through an explicitly supported workflow.

For the basic MVP, editing should be limited to `DRAFT`.

---

# 36. Delete Quote

### DELETE `/api/v1/quotes/:id`

Only draft quotes can be deleted.

If not draft:

```text
HTTP 409
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "QUOTE_NOT_DRAFT",
    "message": "Only draft quotes can be deleted."
  }
}
```

---

# 37. Change Quote Status

### PATCH `/api/v1/quotes/:id/status`

### Request

```json
{
  "status": "SENT"
}
```

Allowed transitions:

```text
DRAFT → SENT

SENT → ACCEPTED
SENT → REJECTED
SENT → EXPIRED
```

Additional transitions should not be introduced without a business requirement.

---

# 38. Quote Status Validation

Invalid:

```text
DRAFT → ACCEPTED
```

Invalid:

```text
ACCEPTED → DRAFT
```

Invalid:

```text
REJECTED → ACCEPTED
```

The service layer must validate state transitions.

---

# 39. Generate Quote PDF

### GET `/api/v1/quotes/:id/pdf`

The endpoint generates or retrieves the quote PDF.

Possible response:

```text
Content-Type: application/pdf
```

The endpoint must verify that the quote belongs to the authenticated user.

The PDF must use the current business profile and quote data.

---

# 40. Quote PDF Download

The API should return a PDF response or a secure temporary download URL.

For V1, either approach is acceptable.

Preferred architecture:

```text
GET /api/v1/quotes/:id/pdf
        │
        ▼
PDF Service
        │
        ▼
PDF Response
```

The implementation must not expose private storage credentials.

---

# 41. Convert Quote to Invoice

### POST `/api/v1/quotes/:id/convert-to-invoice`

No request body required.

### Requirements

The server must verify:

* Quote exists.
* Quote belongs to current user.
* Quote status is `ACCEPTED`.
* Quote has not already been converted.

### Response

HTTP `201`

```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "uuid",
      "invoiceNumber": "INV-00018",
      "quoteId": "uuid",
      "status": "UNPAID",
      "totalAmount": "29500.00"
    }
  }
}
```

---

# 42. Quote Conversion Transaction

The conversion must occur in one database transaction.

```text
BEGIN
   │
   ├── Validate quote
   ├── Check not converted
   ├── Generate invoice number
   ├── Create invoice
   ├── Copy quote items
   ├── Recalculate totals
   └── Commit
```

If any operation fails:

```text
ROLLBACK
```

No partial invoice should remain.

---

# 43. Invoice APIs

## GET `/api/v1/invoices`

Query parameters:

```text
page
pageSize
search
status
customerId
dateFrom
dateTo
sortBy
sortOrder
```

---

# 44. Invoice List Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-00018",
      "customer": {
        "id": "uuid",
        "name": "Ahmed Khan"
      },
      "invoiceDate": "2026-08-10",
      "dueDate": "2026-08-25",
      "status": "UNPAID",
      "totalAmount": "29500.00",
      "paidAmount": "0.00",
      "remainingAmount": "29500.00"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 45. Get Invoice

### GET `/api/v1/invoices/:id`

Returns complete invoice details.

The response should include:

* Invoice information
* Customer
* Source quote
* Items
* Totals
* Payment status
* Remaining amount

---

# 46. Create Invoice

### POST `/api/v1/invoices`

### Request

```json
{
  "customerId": "uuid",
  "quoteId": null,
  "invoiceDate": "2026-08-10",
  "dueDate": "2026-08-25",
  "items": [
    {
      "productId": "uuid",
      "name": "Website Development",
      "description": "Business website",
      "unit": "Project",
      "quantity": "1",
      "unitPrice": "25000.00",
      "discountAmount": "0.00",
      "taxRate": "18.00"
    }
  ],
  "notes": "Thank you.",
  "terms": "Payment due within 15 days."
}
```

---

# 47. Create Invoice Rules

The backend must:

1. Authenticate user.
2. Validate customer.
3. Validate product references.
4. Validate items.
5. Calculate all totals.
6. Generate invoice number.
7. Set `paidAmount = 0`.
8. Set initial status to `UNPAID`.
9. Save invoice and items in a transaction.

---

# 48. Update Invoice

### PUT `/api/v1/invoices/:id`

For V1, only draft invoices should be fully editable.

Once an invoice is issued as `UNPAID`, editing financial values should be restricted.

Recommended:

```text
DRAFT → editable
UNPAID → financial fields locked
PARTIALLY_PAID → locked
PAID → locked
```

This prevents historical financial records from being silently changed.

---

# 49. Delete Invoice

### DELETE `/api/v1/invoices/:id`

Only draft invoices can be deleted.

Issued invoices must not be physically deleted.

---

# 50. Record Payment

### POST `/api/v1/invoices/:id/payment`

### Request

```json
{
  "amount": "10000.00",
  "paymentDate": "2026-08-10",
  "notes": "Cash payment"
}
```

The backend validates:

```text
amount > 0
```

and:

```text
newPaidAmount <= totalAmount
```

---

# 51. Payment Response

```json
{
  "success": true,
  "data": {
    "invoiceId": "uuid",
    "totalAmount": "29500.00",
    "paidAmount": "10000.00",
    "remainingAmount": "19500.00",
    "status": "PARTIALLY_PAID",
    "paidDate": null
  }
}
```

When fully paid:

```json
{
  "success": true,
  "data": {
    "invoiceId": "uuid",
    "totalAmount": "29500.00",
    "paidAmount": "29500.00",
    "remainingAmount": "0.00",
    "status": "PAID",
    "paidDate": "2026-08-10"
  }
}
```

---

# 52. Payment Validation

Reject:

```text
amount <= 0
```

Reject:

```text
amount + existingPaidAmount > totalAmount
```

Example:

```text
Invoice total = ₹30,000
Already paid = ₹20,000

Maximum new payment = ₹10,000
```

A payment of ₹15,000 must be rejected.

---

# 53. Invoice PDF

### GET `/api/v1/invoices/:id/pdf`

Response:

```text
Content-Type: application/pdf
```

The PDF should contain:

* Business information
* Customer information
* Invoice number
* Invoice date
* Due date
* Items
* Subtotal
* Discount
* Tax
* Grand total
* Payment status
* Paid amount
* Remaining amount
* Notes
* Terms

---

# 54. Dashboard API

### GET `/api/v1/dashboard`

Returns dashboard summary.

### Response

```json
{
  "success": true,
  "data": {
    "totalQuotes": 25,
    "totalInvoices": 18,
    "paidAmount": "125000.00",
    "outstandingAmount": "45000.00",
    "recentQuotes": [],
    "recentInvoices": []
  }
}
```

---

# 55. Dashboard Calculation

The dashboard should calculate:

```text
totalQuotes
    = number of user's quotes

totalInvoices
    = number of user's invoices

paidAmount
    = sum(invoice.paidAmount)

outstandingAmount
    = sum(invoice.totalAmount - invoice.paidAmount)
```

All queries must be scoped to the authenticated user.

---

# 56. Dashboard Recent Documents

Return a small number of recent records.

Recommended:

```text
5 recent quotes
5 recent invoices
```

Do not return the entire document history from the dashboard API.

---

# 57. File Upload API

Business logo upload may be supported through:

### POST `/api/v1/business-profile/logo`

The API should:

1. Authenticate user.
2. Validate file type.
3. Validate file size.
4. Upload to storage.
5. Save the resulting URL/reference.
6. Return the updated profile.

Supported initial formats:

```text
PNG
JPEG
WEBP
```

Maximum file size should be configured through application settings.

---

# 58. File Security

Uploaded files must be validated by:

* MIME type
* File extension
* File size

Never trust only the file extension.

Private storage should use temporary/signed URLs where required.

---

# 59. API Ownership Rules

For every resource:

```text
Customer
Product
Quote
Invoice
Business Profile
```

the API must verify ownership.

Example:

```text
currentUserId
      │
      ▼
resource.userId
      │
      ├── match → continue
      │
      └── mismatch → 404/403
```

For security and resource enumeration prevention, returning `404` for resources outside the user's scope is generally preferred.

---

# 60. Preventing ID Enumeration

Never expose whether another user's resource exists.

Example:

```text
GET /api/v1/invoices/{someone-elses-id}
```

should return:

```text
404 INVOICE_NOT_FOUND
```

rather than:

```text
403 This belongs to another user
```

This avoids leaking resource existence.

---

# 61. Request Validation

Use a schema validation library.

Recommended:

```text
Zod
```

Example:

```typescript
const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
});
```

Every write endpoint must validate input using schemas.

---

# 62. Validation Architecture

Recommended:

```text
HTTP Request
     │
     ▼
Zod Schema
     │
     ▼
Validated DTO
     │
     ▼
Application Service
     │
     ▼
Repository
```

Do not pass raw request bodies directly into Prisma.

---

# 63. DTO Principle

API request/response models should be separated from Prisma database models.

Do not automatically expose entire database records.

Bad:

```text
return prisma.customer.findUnique(...)
```

Preferred:

```text
const customer = await customerService.getCustomer(...);

return customerResponseMapper(customer);
```

This prevents accidental exposure of internal fields.

---

# 64. Date Format

API dates should use ISO 8601.

Date:

```text
2026-08-10
```

Timestamp:

```text
2026-08-10T08:30:00Z
```

Clients must not depend on server-specific date formatting.

---

# 65. Money Format

For financial APIs, monetary values should preferably be returned as strings.

Example:

```json
{
  "totalAmount": "29500.00",
  "taxAmount": "4500.00"
}
```

This avoids floating-point precision issues in JavaScript and Dart clients.

---

# 66. Currency

The API should return the configured currency.

Example:

```json
{
  "currency": "INR",
  "totalAmount": "29500.00"
}
```

V1 defaults to:

```text
INR
```

---

# 67. API Security

The API must implement:

* Authentication
* Authorization
* Input validation
* Rate limiting where appropriate
* Secure headers
* HTTPS in production
* Safe error responses
* Request size limits
* File upload limits

---

# 68. Rate Limiting

Rate limiting should initially protect:

* Login/authentication endpoints
* Password reset
* File uploads
* PDF generation
* Expensive endpoints

Do not implement an unnecessarily complicated distributed rate-limiting system in V1.

---

# 69. Logging

Each API request/error should have sufficient information for debugging.

Recommended:

```text
requestId
userId
method
path
statusCode
duration
errorCode
timestamp
```

Do not log:

```text
password
auth token
secret
full sensitive request bodies
```

---

# 70. API Request ID

Each request should have a request ID.

Example:

```text
X-Request-ID: 8a6f...
```

If the client provides a valid request ID, the server may reuse it.

Otherwise, generate one.

The request ID should appear in server logs and error-monitoring events.

---

# 71. API Error Logging

Example internal log:

```text
ERROR
requestId=abc123
userId=user123
endpoint=/api/v1/quotes
errorCode=PDF_GENERATION_FAILED
message=Unable to generate PDF
```

The client receives only:

```json
{
  "success": false,
  "error": {
    "code": "PDF_GENERATION_FAILED",
    "message": "Unable to generate the quote PDF."
  }
}
```

---

# 72. API Folder Structure

Recommended:

```text
web/
├── app/
│   └── api/
│       └── v1/
│           ├── me/
│           ├── business-profile/
│           ├── customers/
│           ├── products/
│           ├── quotes/
│           ├── invoices/
│           └── dashboard/
│
├── services/
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── quote.service.ts
│   ├── invoice.service.ts
│   ├── dashboard.service.ts
│   └── pdf.service.ts
│
├── schemas/
│   ├── customer.schema.ts
│   ├── product.schema.ts
│   ├── quote.schema.ts
│   └── invoice.schema.ts
│
├── repositories/
│   ├── customer.repository.ts
│   ├── product.repository.ts
│   ├── quote.repository.ts
│   └── invoice.repository.ts
│
└── lib/
    ├── auth/
    ├── errors/
    ├── logging/
    └── response/
```

The exact Next.js routing structure may vary depending on implementation, but the separation of concerns must remain.

---

# 73. Endpoint Summary

## User

```text
GET    /api/v1/me
```

## Business Profile

```text
GET    /api/v1/business-profile
PUT    /api/v1/business-profile
POST   /api/v1/business-profile/logo
```

## Customers

```text
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id
DELETE /api/v1/customers/:id
```

## Products

```text
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Quotes

```text
GET    /api/v1/quotes
POST   /api/v1/quotes
GET    /api/v1/quotes/:id
PUT    /api/v1/quotes/:id
DELETE /api/v1/quotes/:id

PATCH  /api/v1/quotes/:id/status
GET    /api/v1/quotes/:id/pdf

POST   /api/v1/quotes/:id/convert-to-invoice
```

## Invoices

```text
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
PUT    /api/v1/invoices/:id
DELETE /api/v1/invoices/:id

POST   /api/v1/invoices/:id/payment
GET    /api/v1/invoices/:id/pdf
```

## Dashboard

```text
GET    /api/v1/dashboard
```

---

# 74. V1 API Flow

The main business flow is:

```text
POST /customers
       │
       ▼
POST /products
       │
       ▼
POST /quotes
       │
       ▼
GET /quotes/:id/pdf
       │
       ▼
PATCH /quotes/:id/status
       │
       │ ACCEPTED
       ▼
POST /quotes/:id/convert-to-invoice
       │
       ▼
GET /invoices/:id/pdf
       │
       ▼
POST /invoices/:id/payment
       │
       ▼
PAID
```

---

# 75. API Testing Requirements

Every endpoint must have tests for:

### Authentication

* Unauthenticated request rejected.

### Authorization

* User cannot access another user's resource.

### Validation

* Invalid input rejected.
* Required fields enforced.
* Invalid numbers rejected.

### Business Rules

* Invalid quote status transition rejected.
* Non-accepted quote cannot become invoice.
* Converted quote cannot be converted twice.
* Payment cannot exceed invoice total.
* Paid invoice cannot be modified.

### Successful Operations

* CRUD works.
* Quote calculations work.
* Invoice calculations work.
* PDF endpoint works.
* Quote conversion works.

---

# 76. Critical API Test Cases

The following scenarios are mandatory.

### Test 1 — User Isolation

```text
User A creates Customer A.

User B attempts:
GET /customers/customerA
```

Expected:

```text
404 CUSTOMER_NOT_FOUND
```

---

### Test 2 — Quote Calculation

Input:

```text
Quantity = 2
Unit Price = 10,000
Discount = 1,000
Tax = 18%
```

Expected:

```text
Subtotal = 20,000
Discount = 1,000
Taxable = 19,000
Tax = 3,420
Total = 22,420
```

---

### Test 3 — Quote Conversion

```text
DRAFT
  ↓
Cannot convert

SENT
  ↓
Cannot convert

ACCEPTED
  ↓
Can convert
```

---

### Test 4 — Duplicate Conversion

```text
ACCEPTED QUOTE
      ↓
Invoice created
      ↓
Second conversion attempt
```

Expected:

```text
409 QUOTE_ALREADY_CONVERTED
```

---

### Test 5 — Payment

Invoice:

```text
Total = ₹30,000
```

Payment:

```text
₹10,000
```

Expected:

```text
Paid = ₹10,000
Remaining = ₹20,000
Status = PARTIALLY_PAID
```

Second payment:

```text
₹20,000
```

Expected:

```text
Paid = ₹30,000
Remaining = ₹0
Status = PAID
```

---

# 77. API Definition of Done

The API implementation is complete when:

* [ ] All V1 endpoints exist.
* [ ] Authentication is enforced.
* [ ] Authorization is enforced.
* [ ] User ownership is enforced.
* [ ] Request validation exists.
* [ ] Response format is consistent.
* [ ] Error format is consistent.
* [ ] Pagination works.
* [ ] Search works where required.
* [ ] Quote calculations are server-side.
* [ ] Invoice calculations are server-side.
* [ ] Quote → Invoice conversion is transactional.
* [ ] Payment validation works.
* [ ] PDF endpoints work.
* [ ] Request IDs are supported.
* [ ] Errors are logged.
* [ ] Sentry integration is supported.
* [ ] Critical endpoints have automated tests.
* [ ] API documentation is maintained.

---

# 78. API Design Principle

The API should remain intentionally small.

The V1 API exists primarily to support:

```text
Customers
Products
Quotes
Invoices
Payments
PDFs
Dashboard
```

Do not create endpoints for features that are not part of the V1 PRD.

Future functionality such as:

```text
AI
WhatsApp
Email
Online Payments
Subscriptions
Teams
Inventory
Accounting
```

should receive their own API design when those features are approved.

---

## End of API Specification — V1
