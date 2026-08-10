# Quote & Invoice Builder

## Database Design Document — MVP V1

**Document Version:** 1.0
**Status:** MVP
**Database:** PostgreSQL
**ORM:** Prisma
**Related Documents:** PRD V1, System Architecture Document V1

---

# 1. Purpose

This document defines the database structure for the Quote & Invoice Builder MVP.

The database must support:

* User authentication
* Business profile
* Customers
* Products/services
* Quotes
* Quote items
* Invoices
* Invoice items
* Quote-to-invoice conversion
* Payment status tracking
* Basic dashboard reporting

The database must be designed for:

* Data integrity
* User data isolation
* Financial accuracy
* Referential integrity
* Future extensibility
* Simple maintenance

---

# 2. Database Principles

The database implementation must follow these rules:

1. PostgreSQL is the single source of truth.
2. Every business-owned record must belong to a user/business.
3. Use UUIDs for primary keys.
4. Use database constraints wherever possible.
5. Use `NUMERIC/DECIMAL` for monetary values.
6. Never use floating-point types for money.
7. Use foreign keys for relationships.
8. Use unique constraints for business numbers.
9. Use timestamps on major entities.
10. Use migrations for all schema changes.
11. Avoid unnecessary database normalization complexity.
12. Avoid storing calculated values that can become inconsistent unless there is a clear reason.
13. Soft delete should not be introduced everywhere in V1.
14. Never physically delete financial records that have business/legal significance unless explicitly allowed by the business rules.
15. Database queries must always enforce user/business ownership.

---

# 3. Entity Overview

The MVP contains the following core entities:

```text
User
 │
 └── BusinessProfile
 │
 ├── Customer
 │
 ├── Product
 │
 ├── Quote
 │     │
 │     └── QuoteItem
 │
 └── Invoice
       │
       └── InvoiceItem
```

---

# 4. Entity Relationship Diagram

```text
┌──────────────────┐
│      User        │
│──────────────────│
│ id PK            │
│ email UNIQUE     │
│ name             │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │
         │ 1:1
         ▼
┌────────────────────────┐
│   BusinessProfile      │
│────────────────────────│
│ id PK                  │
│ user_id FK UNIQUE      │
│ business_name          │
│ logo_url               │
│ owner_name             │
│ email                  │
│ phone                  │
│ address                │
│ city                   │
│ state                  │
│ country                │
│ postal_code            │
│ tax_number             │
│ website                │
│ currency               │
│ created_at             │
│ updated_at             │
└────────────────────────┘


┌──────────────────┐
│      User        │
└────────┬─────────┘
         │
    ┌────┼─────────────┬───────────────┐
    │    │             │               │
    ▼    ▼             ▼               ▼
Customer Product      Quote          Invoice
                      │ │              │ │
                      │ └─ QuoteItem   │ └─ InvoiceItem
                      │               │
                      └───────────────┘
                         conversion
```

---

# 5. ID Strategy

All application entities should use UUIDs.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Primary key:

```text
id UUID PRIMARY KEY
```

Reasons:

* Avoid predictable sequential IDs.
* Safer for APIs.
* Easier distributed-system migration later.
* Works well with PostgreSQL.
* Works well with Prisma.

The user should never see UUIDs as document numbers.

For example:

```text
Internal ID:
550e8400-e29b-41d4-a716-446655440000

User-facing Quote Number:
Q-00001
```

---

# 6. User Table

The `User` table represents an authenticated application user.

### Table

```text
users
```

### Fields

| Column        | Type         | Required | Description   |
| ------------- | ------------ | -------: | ------------- |
| id            | UUID         |      Yes | Primary key   |
| name          | VARCHAR(150) |      Yes | User name     |
| email         | VARCHAR(255) |      Yes | Login email   |
| password_hash | TEXT         |      No* | Password hash |
| created_at    | TIMESTAMP    |      Yes | Creation time |
| updated_at    | TIMESTAMP    |      Yes | Last update   |

`password_hash` depends on the selected authentication implementation.

If Auth.js manages credentials differently, the authentication-related tables should follow the chosen Auth.js adapter schema.

### Constraints

```text
PRIMARY KEY (id)
UNIQUE (email)
```

Email should be treated case-insensitively.

---

# 7. Business Profile Table

Each user has one business profile in V1.

### Table

```text
business_profiles
```

### Fields

| Column        | Type         | Required | Description        |
| ------------- | ------------ | -------: | ------------------ |
| id            | UUID         |      Yes | Primary key        |
| user_id       | UUID         |      Yes | Owner              |
| business_name | VARCHAR(200) |      Yes | Business name      |
| logo_url      | TEXT         |       No | Logo storage URL   |
| owner_name    | VARCHAR(150) |       No | Owner/contact name |
| email         | VARCHAR(255) |       No | Business email     |
| phone         | VARCHAR(30)  |       No | Business phone     |
| address       | TEXT         |       No | Address            |
| city          | VARCHAR(100) |       No | City               |
| state         | VARCHAR(100) |       No | State              |
| country       | VARCHAR(100) |       No | Country            |
| postal_code   | VARCHAR(20)  |       No | Postal code        |
| tax_number    | VARCHAR(100) |       No | GST/tax number     |
| website       | VARCHAR(255) |       No | Website            |
| currency      | CHAR(3)      |      Yes | ISO currency code  |
| created_at    | TIMESTAMP    |      Yes | Creation time      |
| updated_at    | TIMESTAMP    |      Yes | Last update        |

### Constraints

```text
PRIMARY KEY (id)
UNIQUE (user_id)
FOREIGN KEY (user_id) REFERENCES users(id)
```

Default currency:

```text
INR
```

---

# 8. Customer Table

Stores customers belonging to a business user.

### Table

```text
customers
```

### Fields

| Column       | Type         | Required | Description    |
| ------------ | ------------ | -------: | -------------- |
| id           | UUID         |      Yes | Primary key    |
| user_id      | UUID         |      Yes | Owner          |
| name         | VARCHAR(200) |      Yes | Customer name  |
| company_name | VARCHAR(200) |       No | Company        |
| email        | VARCHAR(255) |       No | Email          |
| phone        | VARCHAR(30)  |       No | Phone          |
| address      | TEXT         |       No | Address        |
| city         | VARCHAR(100) |       No | City           |
| state        | VARCHAR(100) |       No | State          |
| country      | VARCHAR(100) |       No | Country        |
| postal_code  | VARCHAR(20)  |       No | Postal code    |
| tax_number   | VARCHAR(100) |       No | Tax/GST number |
| notes        | TEXT         |       No | Internal notes |
| created_at   | TIMESTAMP    |      Yes | Creation time  |
| updated_at   | TIMESTAMP    |      Yes | Last update    |

### Constraints

```text
PRIMARY KEY (id)

FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
```

---

# 9. Customer Indexes

Recommended indexes:

```text
INDEX customers_user_id_idx
INDEX customers_user_id_name_idx
INDEX customers_user_id_email_idx
```

These support:

* Customer listing
* Search
* Filtering
* User isolation

Search behavior should be handled at the application/database query layer.

---

# 10. Product Table

Stores reusable products and services.

### Table

```text
products
```

### Fields

| Column      | Type          | Required | Description          |
| ----------- | ------------- | -------: | -------------------- |
| id          | UUID          |      Yes | Primary key          |
| user_id     | UUID          |      Yes | Owner                |
| name        | VARCHAR(200)  |      Yes | Product/service name |
| description | TEXT          |       No | Description          |
| unit        | VARCHAR(50)   |      Yes | Unit                 |
| price       | NUMERIC(15,2) |      Yes | Default price        |
| tax_rate    | NUMERIC(5,2)  |      Yes | Tax percentage       |
| created_at  | TIMESTAMP     |      Yes | Creation time        |
| updated_at  | TIMESTAMP     |      Yes | Last update          |

Example:

```text
Name: Website Development
Unit: Project
Price: 25000.00
Tax Rate: 18.00
```

### Constraints

```text
price >= 0
tax_rate >= 0
tax_rate <= 100
```

---

# 11. Product Indexes

```text
INDEX products_user_id_idx
INDEX products_user_id_name_idx
```

---

# 12. Quote Table

The `quotes` table stores quotation headers.

### Table

```text
quotes
```

### Fields

| Column               | Type          | Required | Description              |
| -------------------- | ------------- | -------: | ------------------------ |
| id                   | UUID          |      Yes | Primary key              |
| user_id              | UUID          |      Yes | Owner                    |
| customer_id          | UUID          |      Yes | Customer                 |
| quote_number         | VARCHAR(50)   |      Yes | User-facing quote number |
| quote_date           | DATE          |      Yes | Quote date               |
| expiry_date          | DATE          |       No | Expiry date              |
| status               | ENUM          |      Yes | Quote status             |
| subtotal             | NUMERIC(15,2) |      Yes | Subtotal                 |
| discount_amount      | NUMERIC(15,2) |      Yes | Discount                 |
| tax_amount           | NUMERIC(15,2) |      Yes | Tax                      |
| total_amount         | NUMERIC(15,2) |      Yes | Grand total              |
| notes                | TEXT          |       No | Notes                    |
| terms                | TEXT          |       No | Terms                    |
| converted_invoice_id | UUID          |       No | Resulting invoice        |
| created_at           | TIMESTAMP     |      Yes | Creation time            |
| updated_at           | TIMESTAMP     |      Yes | Last update              |

---

# 13. Quote Status

Use a PostgreSQL enum or application-controlled enum.

Recommended values:

```text
DRAFT
SENT
ACCEPTED
REJECTED
EXPIRED
```

Avoid storing arbitrary strings for statuses.

---

# 14. Quote Number

Example:

```text
Q-00001
Q-00002
Q-00003
```

Quote numbers must be unique within the business.

For V1:

```text
UNIQUE(user_id, quote_number)
```

This allows different businesses to have:

```text
User A → Q-00001
User B → Q-00001
```

without conflict.

---

# 15. Quote Item Table

Stores individual items within a quote.

### Table

```text
quote_items
```

### Fields

| Column          | Type          | Required | Description          |
| --------------- | ------------- | -------: | -------------------- |
| id              | UUID          |      Yes | Primary key          |
| quote_id        | UUID          |      Yes | Parent quote         |
| product_id      | UUID          |       No | Original product     |
| name            | VARCHAR(200)  |      Yes | Snapshot name        |
| description     | TEXT          |       No | Snapshot description |
| unit            | VARCHAR(50)   |      Yes | Snapshot unit        |
| quantity        | NUMERIC(12,3) |      Yes | Quantity             |
| unit_price      | NUMERIC(15,2) |      Yes | Price                |
| discount_amount | NUMERIC(15,2) |      Yes | Item discount        |
| tax_rate        | NUMERIC(5,2)  |      Yes | Tax rate             |
| tax_amount      | NUMERIC(15,2) |      Yes | Item tax             |
| line_total      | NUMERIC(15,2) |      Yes | Final line total     |
| sort_order      | INTEGER       |      Yes | Display order        |
| created_at      | TIMESTAMP     |      Yes | Creation time        |

---

# 16. Why Quote Items Store Snapshots

A quote item should copy product information at the time the quote is created.

Example:

```text
Product
Website Development
₹25,000
```

Later, the product price changes:

```text
Website Development
₹35,000
```

The old quote must still show:

```text
Website Development
₹25,000
```

Therefore, `quote_items` stores:

* Name
* Description
* Unit
* Unit price
* Tax rate

as snapshots.

`product_id` is optional and represents the original product reference.

---

# 17. Quote Relationships

```text
User
 │
 └── Quotes
       │
       ├── Customer
       │
       └── QuoteItems
              │
              └── Product (optional)
```

---

# 18. Invoice Table

Stores invoice headers.

### Table

```text
invoices
```

### Fields

| Column          | Type          | Required | Description                |
| --------------- | ------------- | -------: | -------------------------- |
| id              | UUID          |      Yes | Primary key                |
| user_id         | UUID          |      Yes | Owner                      |
| customer_id     | UUID          |      Yes | Customer                   |
| quote_id        | UUID          |       No | Source quote               |
| invoice_number  | VARCHAR(50)   |      Yes | User-facing invoice number |
| invoice_date    | DATE          |      Yes | Invoice date               |
| due_date        | DATE          |       No | Payment due date           |
| status          | ENUM          |      Yes | Invoice status             |
| subtotal        | NUMERIC(15,2) |      Yes | Subtotal                   |
| discount_amount | NUMERIC(15,2) |      Yes | Discount                   |
| tax_amount      | NUMERIC(15,2) |      Yes | Tax                        |
| total_amount    | NUMERIC(15,2) |      Yes | Grand total                |
| paid_amount     | NUMERIC(15,2) |      Yes | Amount paid                |
| paid_date       | DATE          |       No | Payment date               |
| payment_notes   | TEXT          |       No | Payment notes              |
| notes           | TEXT          |       No | Notes                      |
| terms           | TEXT          |       No | Terms                      |
| created_at      | TIMESTAMP     |      Yes | Creation time              |
| updated_at      | TIMESTAMP     |      Yes | Last update                |

---

# 19. Invoice Status

Recommended enum:

```text
DRAFT
UNPAID
PARTIALLY_PAID
PAID
OVERDUE
```

The application can derive `OVERDUE` from:

```text
due_date < current_date
AND paid_amount < total_amount
```

Whether `OVERDUE` is persisted or calculated should be decided during implementation.

**Recommended for V1:** calculate overdue dynamically rather than storing it as an independent state where practical.

---

# 20. Invoice Number

Example:

```text
INV-00001
INV-00002
INV-00003
```

Constraint:

```text
UNIQUE(user_id, invoice_number)
```

---

# 21. Invoice Item Table

### Table

```text
invoice_items
```

### Fields

| Column          | Type          | Required | Description          |
| --------------- | ------------- | -------: | -------------------- |
| id              | UUID          |      Yes | Primary key          |
| invoice_id      | UUID          |      Yes | Parent invoice       |
| product_id      | UUID          |       No | Original product     |
| name            | VARCHAR(200)  |      Yes | Snapshot name        |
| description     | TEXT          |       No | Snapshot description |
| unit            | VARCHAR(50)   |      Yes | Snapshot unit        |
| quantity        | NUMERIC(12,3) |      Yes | Quantity             |
| unit_price      | NUMERIC(15,2) |      Yes | Price                |
| discount_amount | NUMERIC(15,2) |      Yes | Item discount        |
| tax_rate        | NUMERIC(5,2)  |      Yes | Tax rate             |
| tax_amount      | NUMERIC(15,2) |      Yes | Item tax             |
| line_total      | NUMERIC(15,2) |      Yes | Final line total     |
| sort_order      | INTEGER       |      Yes | Display order        |
| created_at      | TIMESTAMP     |      Yes | Creation time        |

The same snapshot principle used by quote items applies to invoice items.

---

# 22. Invoice Relationships

```text
User
 │
 └── Invoice
       │
       ├── Customer
       ├── Source Quote (optional)
       └── InvoiceItems
              │
              └── Product (optional)
```

---

# 23. Quote → Invoice Relationship

A quote may produce an invoice.

Recommended relationship:

```text
quotes.converted_invoice_id
```

and:

```text
invoices.quote_id
```

However, storing the same relationship redundantly can create inconsistency.

### Recommended V1 approach

Use:

```text
invoices.quote_id
```

as the authoritative relationship.

Then:

```text
Invoice.quote_id → Quote.id
```

A quote can therefore have zero or one originating invoice.

The application can retrieve the invoice from the quote relationship.

---

# 24. Quote Conversion Rules

When converting an accepted quote into an invoice:

1. Verify the quote belongs to the current user.
2. Verify the quote exists.
3. Verify status is `ACCEPTED`.
4. Verify it has not already been converted.
5. Create invoice.
6. Copy customer.
7. Copy quote items as invoice item snapshots.
8. Recalculate totals.
9. Generate invoice number.
10. Save invoice and items in one database transaction.

---

# 25. Transaction Requirements

The following operations must use database transactions:

### Create Quote

```text
Create Quote
+
Create Quote Items
```

### Create Invoice

```text
Create Invoice
+
Create Invoice Items
```

### Quote → Invoice

```text
Validate Quote
+
Create Invoice
+
Create Invoice Items
```

### Delete Customer

If deletion is allowed, the application must first verify whether the customer is referenced by financial documents.

---

# 26. Delete Strategy

### Customers

A customer should not be physically deleted if they have existing quotes or invoices.

Recommended V1 behavior:

```text
Customer with financial history
        │
        ▼
Do not delete
```

Instead, future versions may introduce:

```text
is_active
```

For V1, the application can simply prevent deletion and display:

> This customer cannot be deleted because they have existing documents.

### Products

Products can be deleted if they are not needed anymore because quote/invoice items contain snapshots.

Deleting a product must not modify historical documents.

---

# 27. Historical Data Protection

Historical financial documents must remain unchanged when master data changes.

Example:

```text
Product price changes
        │
        ▼
Existing Quote
        │
        └── remains unchanged
```

Similarly:

```text
Customer address changes
        │
        ▼
Existing Invoice
        │
        └── historical document remains unchanged
```

For generated PDFs, the PDF should represent the document data at the time it was generated.

---

# 28. Monetary Data Types

All money fields must use:

```text
NUMERIC(15,2)
```

Examples:

```text
price
subtotal
discount_amount
tax_amount
total_amount
paid_amount
unit_price
line_total
```

Do not use:

```text
FLOAT
REAL
DOUBLE PRECISION
```

for monetary amounts.

---

# 29. Quantity Data Type

Quantity should support fractional quantities.

Recommended:

```text
NUMERIC(12,3)
```

Examples:

```text
1
2
2.5
10.750
```

This supports products/services sold by:

* Project
* Hour
* Kg
* Meter
* Unit
* Day

---

# 30. Tax Data Type

Tax rate:

```text
NUMERIC(5,2)
```

Examples:

```text
0.00
5.00
12.00
18.00
28.00
```

The application should validate:

```text
0 <= tax_rate <= 100
```

---

# 31. Date and Time Strategy

Use:

```text
TIMESTAMP WITH TIME ZONE
```

for:

```text
created_at
updated_at
```

Use:

```text
DATE
```

for business dates:

```text
quote_date
expiry_date
invoice_date
due_date
paid_date
```

The application should handle user timezone display separately.

---

# 32. Naming Convention

Database naming convention:

```text
snake_case
```

Examples:

```text
user_id
business_name
quote_number
invoice_number
created_at
updated_at
```

Prisma model names should use PascalCase:

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

---

# 33. Standard Timestamp Fields

Every major entity should contain:

```text
created_at
updated_at
```

For example:

```text
Customer
Product
Quote
Invoice
BusinessProfile
```

`updated_at` must automatically update when the record changes.

---

# 34. Indexing Strategy

Do not add indexes to every column.

Initial indexes should focus on:

### User ownership

```text
customers.user_id
products.user_id
quotes.user_id
invoices.user_id
```

### Lookup

```text
customers.name
products.name
quotes.quote_number
invoices.invoice_number
```

### Relationships

```text
quote_items.quote_id
invoice_items.invoice_id
quotes.customer_id
invoices.customer_id
invoices.quote_id
```

### Unique identifiers

```text
users.email
quotes(user_id, quote_number)
invoices(user_id, invoice_number)
```

---

# 35. Suggested Constraints

The database should enforce important rules.

### Product

```text
price >= 0
tax_rate >= 0
tax_rate <= 100
```

### Quote Item

```text
quantity > 0
unit_price >= 0
discount_amount >= 0
tax_rate >= 0
tax_rate <= 100
```

### Invoice Item

Same rules.

### Invoice

```text
paid_amount >= 0
paid_amount <= total_amount
```

The application should also enforce these rules before database persistence.

---

# 36. Soft Delete

Do not implement a global soft-delete system in V1.

Avoid adding:

```text
deleted_at
```

to every table simply as a standard pattern.

Use explicit business rules.

This keeps the database simpler.

---

# 37. Prisma Model Structure

The final Prisma schema should conceptually resemble:

```text
User
 ├── BusinessProfile
 ├── Customers
 ├── Products
 ├── Quotes
 └── Invoices

Customer
 ├── Quotes
 └── Invoices

Product
 ├── QuoteItems
 └── InvoiceItems

Quote
 ├── Customer
 ├── QuoteItems
 └── Invoice

Invoice
 ├── Customer
 ├── Quote
 └── InvoiceItems
```

The exact Prisma syntax will be implemented after the API/domain decisions are finalized.

---

# 38. Conceptual Prisma Schema

The following is the intended model structure, not yet the final implementation:

```prisma
model User {
  id              String          @id @default(uuid())
  name            String
  email           String          @unique
  passwordHash    String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  businessProfile BusinessProfile?
  customers       Customer[]
  products        Product[]
  quotes          Quote[]
  invoices        Invoice[]
}

model BusinessProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  businessName String
  logoUrl     String?
  ownerName   String?
  email       String?
  phone       String?
  address     String?
  city        String?
  state       String?
  country     String?
  postalCode  String?
  taxNumber   String?
  website     String?
  currency    String   @default("INR")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Customer {
  id          String    @id @default(uuid())
  userId      String
  name        String
  companyName String?
  email       String?
  phone       String?
  address     String?
  city        String?
  state       String?
  country     String?
  postalCode  String?
  taxNumber   String?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  quotes   Quote[]
  invoices Invoice[]

  @@index([userId])
  @@index([userId, name])
}

model Product {
  id          String   @id @default(uuid())
  userId      String
  name        String
  description String?
  unit        String
  price       Decimal  @db.Decimal(15, 2)
  taxRate     Decimal  @db.Decimal(5, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  quoteItems   QuoteItem[]
  invoiceItems InvoiceItem[]

  @@index([userId])
  @@index([userId, name])
}

model Quote {
  id               String      @id @default(uuid())
  userId           String
  customerId       String
  quoteNumber      String
  quoteDate        DateTime    @db.Date
  expiryDate       DateTime?   @db.Date
  status           QuoteStatus  @default(DRAFT)
  subtotal         Decimal     @db.Decimal(15, 2)
  discountAmount   Decimal     @db.Decimal(15, 2)
  taxAmount        Decimal     @db.Decimal(15, 2)
  totalAmount      Decimal     @db.Decimal(15, 2)
  notes            String?
  terms            String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  customer    Customer   @relation(fields: [customerId], references: [id])
  items       QuoteItem[]
  invoice     Invoice?

  @@unique([userId, quoteNumber])
  @@index([userId])
  @@index([customerId])
}

model QuoteItem {
  id              String   @id @default(uuid())
  quoteId         String
  productId       String?
  name            String
  description     String?
  unit            String
  quantity        Decimal  @db.Decimal(12, 3)
  unitPrice       Decimal  @db.Decimal(15, 2)
  discountAmount  Decimal  @db.Decimal(15, 2)
  taxRate         Decimal  @db.Decimal(5, 2)
  taxAmount       Decimal  @db.Decimal(15, 2)
  lineTotal       Decimal  @db.Decimal(15, 2)
  sortOrder       Int
  createdAt       DateTime @default(now())

  quote   Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([quoteId])
}

model Invoice {
  id              String         @id @default(uuid())
  userId          String
  customerId      String
  quoteId         String?        @unique
  invoiceNumber   String
  invoiceDate     DateTime       @db.Date
  dueDate         DateTime?      @db.Date
  status          InvoiceStatus  @default(UNPAID)
  subtotal        Decimal        @db.Decimal(15, 2)
  discountAmount  Decimal        @db.Decimal(15, 2)
  taxAmount       Decimal        @db.Decimal(15, 2)
  totalAmount     Decimal        @db.Decimal(15, 2)
  paidAmount      Decimal        @db.Decimal(15, 2)
  paidDate        DateTime?      @db.Date
  paymentNotes   String?
  notes           String?
  terms           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  customer Customer      @relation(fields: [customerId], references: [id])
  quote    Quote?        @relation(fields: [quoteId], references: [id])
  items    InvoiceItem[]

  @@unique([userId, invoiceNumber])
  @@index([userId])
  @@index([customerId])
}

model InvoiceItem {
  id              String   @id @default(uuid())
  invoiceId       String
  productId       String?
  name            String
  description     String?
  unit            String
  quantity        Decimal  @db.Decimal(12, 3)
  unitPrice       Decimal  @db.Decimal(15, 2)
  discountAmount  Decimal  @db.Decimal(15, 2)
  taxRate         Decimal  @db.Decimal(5, 2)
  taxAmount       Decimal  @db.Decimal(15, 2)
  lineTotal       Decimal  @db.Decimal(15, 2)
  sortOrder       Int
  createdAt       DateTime @default(now())

  invoice Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([invoiceId])
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

enum InvoiceStatus {
  DRAFT
  UNPAID
  PARTIALLY_PAID
  PAID
}
```

---

# 39. Important Prisma Schema Notes

The conceptual schema above must be reviewed during implementation for compatibility with the authentication adapter.

In particular:

* Auth.js may require additional authentication tables depending on the selected provider/adapter.
* Authentication tables should not be manually simplified if the library requires them.
* The application domain tables remain separate from authentication implementation details.

The final Prisma schema should be generated only after the authentication strategy is finalized.

---

# 40. Quote Calculation Model

For each quote item:

```text
gross = quantity × unit_price

discounted_amount = gross - discount_amount

tax_amount = discounted_amount × tax_rate / 100

line_total = discounted_amount + tax_amount
```

Quote totals:

```text
subtotal
    = sum(gross)

discount_amount
    = sum(item discounts)

tax_amount
    = sum(item taxes)

total_amount
    = subtotal - discount_amount + tax_amount
```

The exact calculation strategy must be implemented consistently throughout the application.

---

# 41. Invoice Calculation Model

Invoice calculations follow the same model.

```text
subtotal
discount
tax
total
```

The backend must recalculate totals whenever an invoice is created or modified.

The frontend's calculated total is only a preview.

---

# 42. Payment Calculation

For V1:

```text
remaining_amount =
    total_amount - paid_amount
```

Status:

```text
paid_amount = 0
    → UNPAID

0 < paid_amount < total_amount
    → PARTIALLY_PAID

paid_amount = total_amount
    → PAID
```

The backend should validate:

```text
paid_amount >= 0
paid_amount <= total_amount
```

---

# 43. Data Ownership Rule

Every query involving business data must include ownership validation.

Example:

```text
SELECT *
FROM quotes
WHERE id = :quoteId
AND user_id = :currentUserId
```

Never:

```text
SELECT *
FROM quotes
WHERE id = :quoteId
```

followed by an assumption that the ID is sufficient.

This rule is critical for preventing cross-account data access.

---

# 44. Referential Integrity

Recommended behavior:

### User → Business Profile

```text
User deleted
    ↓
Business Profile deleted
```

### User → Customers

```text
User deleted
    ↓
Customers deleted
```

### User → Products

```text
User deleted
    ↓
Products deleted
```

### Quote → Quote Items

```text
Quote deleted
    ↓
Quote Items deleted
```

### Invoice → Invoice Items

```text
Invoice deleted
    ↓
Invoice Items deleted
```

### Product → Historical Item

```text
Product deleted
    ↓
Historical Quote/Invoice item remains
```

Therefore:

```text
product_id → ON DELETE SET NULL
```

where appropriate.

---

# 45. Financial Document Deletion

Financial documents should not be casually deleted.

Recommended V1 rules:

### Draft Quote

Can be deleted.

### Sent Quote

Prefer status changes rather than deletion.

### Accepted Quote

Must not be deleted if it has generated an invoice.

### Invoice

Invoices should not be physically deleted after being issued.

For V1, the UI can simply disable/delete-restrict invoices that are no longer drafts.

Future versions can implement proper void/cancel functionality.

---

# 46. Dashboard Data

The dashboard does not require a separate dashboard table.

Metrics should be calculated from existing tables.

Examples:

```text
Total Quotes
COUNT(quotes)

Total Invoices
COUNT(invoices)

Paid Amount
SUM(invoices.paid_amount)

Outstanding Amount
SUM(invoices.total_amount - invoices.paid_amount)
```

For V1, these queries are sufficient.

Caching is not required initially.

---

# 47. Database Performance

The expected V1 dataset is relatively small.

Do not prematurely introduce:

* Redis
* Elasticsearch
* Read replicas
* Database sharding
* Materialized dashboards
* Complex caching

PostgreSQL should comfortably handle the initial workload.

Performance optimization should be based on actual measurements.

---

# 48. Database Backup

Production PostgreSQL must have:

* Automated backups
* Point-in-time recovery where supported
* Backup retention appropriate to the hosting provider

Backup configuration is an infrastructure responsibility and should be documented separately.

---

# 49. Migration Rules

Claude Code must follow these rules:

1. Never manually modify production schema.
2. Every schema change requires a migration.
3. Migration names must be descriptive.
4. Existing production data must be considered before destructive migrations.
5. Never casually drop columns containing financial data.
6. Test migrations locally before deployment.
7. Database seed data must not contain real customer information.

---

# 50. Seed Data

Development may include sample data:

```text
Demo Business
Demo Customer
Website Development
Consulting Service
Sample Quote
Sample Invoice
```

Seed data must:

* Be clearly marked as demo data.
* Never contain real personal information.
* Never be used as production data.

---

# 51. Database Testing

Automated tests should verify:

### Relationships

* User → Business Profile
* User → Customer
* User → Product
* Customer → Quote
* Quote → Quote Items
* Quote → Invoice
* Invoice → Invoice Items

### Constraints

* Unique quote number per user
* Unique invoice number per user
* Valid monetary values
* Valid tax rates
* Valid quantities

### Security

* User A cannot access User B's records.

### Financial Logic

* Correct subtotal
* Correct discount
* Correct tax
* Correct total
* Correct paid amount
* Correct remaining amount

---

# 52. Final V1 Database

The production domain database should remain approximately:

```text
users
business_profiles

customers
products

quotes
quote_items

invoices
invoice_items
```

Authentication-specific tables may be added by the authentication provider/adapter.

No additional business tables should be introduced unless required by an approved V1 requirement.

---

# 53. Final Relationship Summary

```text
                         USER
                          │
            ┌─────────────┼──────────────┐
            │             │              │
            ▼             ▼              ▼
     BUSINESS PROFILE  CUSTOMERS      PRODUCTS
                          │              │
                     ┌────┴────┐         │
                     ▼         ▼         │
                   QUOTES   INVOICES      │
                     │         │          │
                     ▼         ▼          │
                 QUOTE ITEMS  INVOICE ITEMS
                     │         │
                     └────┬────┘
                          │
                          ▼
                       PRODUCT
                     (optional
                      reference)
```

Historical quote/invoice item data remains independent of future product changes.

---

# 54. Database Definition of Done

The database implementation is complete when:

* [ ] PostgreSQL database is configured.
* [ ] Prisma is configured.
* [ ] Initial migration is created.
* [ ] Authentication schema is integrated.
* [ ] All V1 domain tables exist.
* [ ] Foreign keys are configured.
* [ ] Required indexes exist.
* [ ] Unique constraints exist.
* [ ] Monetary fields use `NUMERIC`.
* [ ] Quote/invoice status enums exist.
* [ ] Quote numbering is concurrency-safe.
* [ ] Invoice numbering is concurrency-safe.
* [ ] User ownership is enforced.
* [ ] Historical item snapshots work.
* [ ] Quote → Invoice relationship works.
* [ ] Financial calculations are tested.
* [ ] Database seed is available for development.
* [ ] Migration process is documented.
* [ ] Production backup strategy is documented.

---

## End of Database Design Document — V1
