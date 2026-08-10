# Quote & Invoice Builder

## Product Requirements Document — MVP V1

**Document Version:** 1.0
**Status:** MVP
**Product Type:** Web + Responsive Web + Mobile App

---

## 1. Product Overview

**Quote & Invoice Builder** is a simple application for freelancers, small businesses, contractors, consultants, and service providers to create and manage professional quotations and invoices.

The MVP focuses on one simple workflow:

> **Customer → Quote → PDF → Invoice → Payment Status**

The application will provide a responsive web application and a mobile application using a shared backend and database.

The product should be simple enough for a small business owner to create a quotation or invoice within a few minutes without accounting knowledge.

---

# 2. Product Goals

### Primary Goals

1. Allow users to create and manage customers.
2. Allow users to maintain products/services.
3. Allow users to create professional quotations.
4. Allow users to convert quotations into invoices.
5. Allow users to generate downloadable PDF documents.
6. Allow users to track quote and invoice status.
7. Provide a simple dashboard showing business activity.
8. Provide a consistent experience across desktop, tablet, mobile web, and mobile app.

### Secondary Goals

* Keep the application easy to understand.
* Minimize data entry.
* Provide reusable customer/product information.
* Maintain a clean and professional document format.
* Build a foundation for future AI, WhatsApp, payment, and SaaS features.

---

# 3. Target Users

The MVP targets:

* Freelancers
* Consultants
* Small retailers
* Contractors
* Web/software agencies
* Designers
* Repair/service providers
* Local businesses
* Independent professionals

### Example

A web developer receives a request from a customer.

They can:

1. Select the customer.
2. Add "Website Development".
3. Enter quantity and price.
4. Add tax/discount if applicable.
5. Generate a quote.
6. Download/share the PDF.
7. When accepted, convert it into an invoice.
8. Mark the invoice as paid after receiving payment.

---

# 4. Platform Requirements

The application will have two client applications.

### Web Application

* Desktop browser
* Tablet browser
* Mobile browser
* Responsive design

### Mobile Application

* Android
* iOS

Both applications must use the same backend API and database.

### Important Principle

Business rules must not be duplicated between web and mobile.

For example, quote calculation should be handled by the backend/domain logic rather than independently implemented in two different clients.

---

# 5. MVP Scope

The MVP contains the following modules:

```text
Authentication
Business Profile
Dashboard
Customers
Products / Services
Quotes
Invoices
PDF Documents
Application Settings
```

---

# 6. User Role

V1 will have only one application role:

### Business User

A registered user can:

* Manage their business profile.
* Manage customers.
* Manage products/services.
* Create quotes.
* Manage quotes.
* Create invoices.
* Convert quotes into invoices.
* Track payment status.
* Generate PDFs.

No team/member/employee roles are required in V1.

---

# 7. Authentication

Users must be able to:

* Register
* Login
* Logout
* Reset password
* Maintain their profile

### Required User Information

```text
Name
Email
Password
```

The system should associate all business data with the authenticated user.

A user must never be able to access another user's:

* Customers
* Products
* Quotes
* Invoices
* Business information

---

# 8. Business Profile

After registration, the user can configure basic business information.

### Fields

```text
Business Name
Business Logo
Owner Name
Email
Phone
Address
City
State
Country
Postal Code
Tax/GST Number
Website
```

Tax/GST information is optional in V1.

### Usage

Business information should automatically appear on generated quotes and invoices.

---

# 9. Dashboard

The dashboard should provide a simple overview.

### Summary Cards

```text
Total Quotes
Total Invoices
Outstanding Amount
Paid Amount
```

### Recent Quotes

Display:

```text
Quote Number
Customer
Date
Amount
Status
```

### Recent Invoices

Display:

```text
Invoice Number
Customer
Date
Amount
Status
```

### Primary Action

A prominent:

**+ Create Quote**

button should be available.

---

# 10. Customer Management

Users can manage their customers.

### Customer Fields

```text
Customer Name *
Company Name
Email
Phone
Address
City
State
Country
Postal Code
Tax/GST Number
Notes
```

`Customer Name` is required.

### Customer Operations

* Create customer
* View customer
* Edit customer
* Delete customer
* Search customer
* View customer's quotes
* View customer's invoices

### Customer List

The list should display:

```text
Name
Company
Email
Phone
Number of Quotes
Number of Invoices
```

---

# 11. Product / Service Management

Users can maintain reusable products or services.

### Fields

```text
Name *
Description
Unit
Price *
Tax %
```

Example:

```text
Name: Website Development
Description: Business website development
Unit: Project
Price: ₹25,000
Tax: 18%
```

### Operations

* Create
* View
* Edit
* Delete
* Search

Products/services can be selected when creating a quote or invoice.

---

# 12. Quote Management

Quotes are one of the primary features of the MVP.

Users can:

* Create quote
* View quote
* Edit draft quote
* Delete draft quote
* Duplicate quote
* Download PDF
* Share/download PDF
* Change quote status
* Convert accepted quote into invoice

---

# 13. Quote Number

The system should automatically generate a unique quote number.

Example:

```text
Q-00001
Q-00002
Q-00003
```

The numbering mechanism should be configurable in the future, but V1 can use sequential numbering.

---

# 14. Create Quote

A quote contains:

### Header

```text
Quote Number
Quote Date
Expiry Date
Customer
```

### Items

Each quote item contains:

```text
Product / Service
Description
Quantity
Unit
Unit Price
Discount
Tax %
Line Total
```

### Summary

```text
Subtotal
Discount
Tax
Grand Total
```

### Additional Information

```text
Notes
Terms & Conditions
```

---

# 15. Quote Calculation

The application must calculate totals consistently.

Basic calculation:

```text
Line Subtotal = Quantity × Unit Price

Subtotal = Sum of Line Subtotals

Discount = Applicable Discount

Taxable Amount = Subtotal - Discount

Tax = Taxable Amount × Tax Rate

Grand Total = Taxable Amount + Tax
```

All monetary calculations must use appropriate decimal handling and must not rely on floating-point arithmetic that can cause rounding errors.

The backend should be the authoritative source for final totals.

---

# 16. Quote Status

V1 quote statuses:

```text
Draft
Sent
Accepted
Rejected
Expired
```

### Status Flow

```text
Draft
  │
  ▼
Sent
  │
  ├──► Accepted
  │       │
  │       ▼
  │    Invoice
  │
  ├──► Rejected
  │
  └──► Expired
```

Only an accepted quote can be converted directly into an invoice.

---

# 17. Quote PDF

Users should be able to generate a professional PDF.

The PDF should contain:

### Business

```text
Business Logo
Business Name
Address
Phone
Email
Tax/GST Number
```

### Customer

```text
Customer Name
Company
Address
Email
Phone
Tax/GST Number
```

### Quote

```text
Quote Number
Quote Date
Expiry Date
```

### Items

```text
Item
Description
Qty
Unit Price
Discount
Tax
Amount
```

### Summary

```text
Subtotal
Discount
Tax
Grand Total
```

### Footer

```text
Notes
Terms & Conditions
Thank You message
```

The PDF should be readable on both desktop and mobile devices.

---

# 18. Invoice Management

Users can:

* Create invoice
* View invoice
* Edit invoice where permitted
* Delete draft invoice
* Download PDF
* Track payment status
* Mark invoice as paid

---

# 19. Invoice Number

Invoices should have unique sequential numbers.

Example:

```text
INV-00001
INV-00002
INV-00003
```

---

# 20. Create Invoice

Invoice fields:

### Header

```text
Invoice Number
Invoice Date
Due Date
Customer
```

### Items

```text
Product / Service
Description
Quantity
Unit
Unit Price
Discount
Tax %
Line Total
```

### Summary

```text
Subtotal
Discount
Tax
Grand Total
```

### Additional Information

```text
Notes
Terms & Conditions
```

---

# 21. Quote → Invoice

The user can convert an accepted quote into an invoice.

Example:

```text
Quote Q-00021
       │
       │ Convert
       ▼
Invoice INV-00018
```

The invoice should copy:

* Customer
* Items
* Quantities
* Prices
* Discounts
* Taxes
* Notes
* Terms

The quote and resulting invoice should maintain a relationship.

---

# 22. Invoice Payment Status

V1 only needs basic payment tracking.

Statuses:

```text
Unpaid
Partially Paid
Paid
Overdue
```

For V1, payment recording can remain simple.

### Payment Information

```text
Payment Status
Paid Amount
Payment Date
Payment Notes
```

No payment gateway is required.

---

# 23. Invoice PDF

Invoice PDFs should contain:

```text
Business Information
Customer Information
Invoice Number
Invoice Date
Due Date
Items
Subtotal
Discount
Tax
Grand Total
Payment Status
Notes
Terms & Conditions
```

The document should have a professional business appearance.

---

# 24. Search and Filtering

Basic search should be available.

### Customers

Search by:

```text
Name
Company
Email
Phone
```

### Products

Search by:

```text
Name
Description
```

### Quotes

Search/filter by:

```text
Quote Number
Customer
Status
Date
```

### Invoices

Search/filter by:

```text
Invoice Number
Customer
Status
Date
```

Advanced reporting/filtering is not required in V1.

---

# 25. Responsive Requirements

The web application must support:

### Desktop

```text
1280px+
```

### Tablet

```text
768px – 1279px
```

### Mobile

```text
320px – 767px
```

The UI must not require horizontal scrolling for normal application usage.

Tables should transform appropriately on small screens.

For example, a desktop customer table can become customer cards on mobile.

---

# 26. Mobile Application

The mobile application should provide the core functionality.

### Mobile V1 Screens

```text
Login
Dashboard
Customers
Customer Details
Products
Quotes
Create Quote
Quote Details
Invoices
Invoice Details
Business Profile
Settings
```

The mobile app should use the same backend API and authentication system as the web application.

---

# 27. Mobile-Specific Requirements

The mobile application should optimize for quick actions.

The dashboard should prominently provide:

```text
+ Create Quote
+ Add Customer
```

The user should be able to create a basic quote without navigating through many screens.

PDFs should be:

* Viewable
* Downloadable
* Shareable through the mobile operating system's share functionality

---

# 28. Notifications

V1 does not require a complex notification system.

However, the architecture should allow future support for:

* Invoice due reminders
* Quote expiry reminders
* Payment reminders

Push notifications can be added in a later version.

---

# 29. Settings

Basic settings should include:

```text
Business Profile
Quote Settings
Invoice Settings
Terms & Conditions
Default Tax
Currency
Account
Logout
```

### Currency

V1 can initially support one configured currency per user.

Default:

```text
INR (₹)
```

The architecture should allow additional currencies later.

---

# 30. Data Ownership

Each authenticated user owns their business data.

All database queries must enforce ownership.

Example:

```text
User A
 ├── Customers
 ├── Products
 ├── Quotes
 └── Invoices

User B
 ├── Customers
 ├── Products
 ├── Quotes
 └── Invoices
```

User A must never be able to access User B's records.

---

# 31. Validation

Required validation should exist on both client and server.

Examples:

```text
Customer name → Required

Product name → Required

Product price → Required and >= 0

Quote customer → Required

Quote item quantity → > 0

Quote item price → >= 0

Invoice due date → Valid date
```

Server-side validation is mandatory even if client-side validation exists.

---

# 32. Error Handling

The application should provide user-friendly error messages.

Example:

Instead of:

```text
500 Internal Server Error
```

show:

```text
Unable to create the quote.
Please try again.
```

Technical errors should be logged internally.

The application should never expose:

* Stack traces
* Database errors
* API secrets
* Internal implementation details

to end users.

---

# 33. Audit / Activity

Full audit logging is not required in V1.

However, the system should store basic timestamps:

```text
created_at
updated_at
```

for major entities.

Future versions can introduce detailed activity history.

---

# 34. Security Requirements

The application must:

* Hash passwords securely.
* Protect authenticated APIs.
* Validate authorization on every protected resource.
* Prevent cross-user data access.
* Validate all user input.
* Store secrets only in environment variables.
* Never expose database credentials to the frontend.
* Use HTTPS in production.
* Implement secure authentication/session handling.
* Apply reasonable API rate limiting where appropriate.

---

# 35. Performance Requirements

The application should feel responsive for normal small-business usage.

Target:

```text
Normal page interaction: < 1 second where practical
API response: < 500ms for normal CRUD operations where practical
PDF generation: < 5 seconds under normal conditions
```

These are initial targets, not strict SLA commitments.

---

# 36. Accessibility

The application should follow basic accessibility principles:

* Keyboard navigation
* Visible focus states
* Proper labels
* Semantic HTML
* Accessible buttons
* Sufficient text contrast
* Meaningful error messages
* Screen-reader-friendly form controls

---

# 37. Out of Scope — V1

The following features must **not** be implemented during the initial MVP:

### AI

* AI quote generation
* AI invoice generation
* AI customer assistant
* AI document extraction

### WhatsApp

* WhatsApp chatbot
* WhatsApp quote generation
* WhatsApp invoice generation
* WhatsApp automated reminders

### Payments

* Stripe
* Razorpay
* PayPal
* Payment links
* Online payment processing

### Accounting

* Full accounting
* Ledger
* Balance sheet
* Profit & loss
* GST filing
* Tax return filing

### Inventory

* Stock management
* Warehouses
* Purchase orders
* Suppliers

### Team Management

* Employees
* Team members
* Role permissions
* Multi-user organizations

### Advanced Features

* Recurring invoices
* Subscription billing
* Customer portal
* Advanced analytics
* Expense management
* Multi-company support
* Multi-currency
* Advanced reporting
* Email marketing

---

# 38. Future Roadmap

After V1 is stable:

### V1.1

* Email quote/invoice
* Invoice reminders
* Better PDF templates
* Custom document branding

### V1.2

* WhatsApp sharing
* Payment links
* Online payment tracking
* Recurring invoices

### V2

* AI quote creation
* AI invoice creation
* Natural-language commands
* WhatsApp AI assistant

Example:

> "Create a quote for Ahmed for 2 AC units at ₹35,000 each."

### V3

* Team management
* Customer portal
* Inventory
* Expenses
* Accounting integrations
* Business analytics

---

# 39. Core User Flow

The primary MVP flow is:

```text
Register
   │
   ▼
Business Profile
   │
   ▼
Dashboard
   │
   ▼
Add Customer
   │
   ▼
Add Product/Service
   │
   ▼
Create Quote
   │
   ▼
Generate PDF
   │
   ▼
Send/Share Quote
   │
   ▼
Customer Accepts
   │
   ▼
Convert to Invoice
   │
   ▼
Generate Invoice PDF
   │
   ▼
Receive Payment
   │
   ▼
Mark as Paid
```

---

# 40. MVP Acceptance Criteria

The MVP will be considered complete when a user can successfully:

### Authentication

* [ ] Register
* [ ] Login
* [ ] Logout
* [ ] Reset password

### Business

* [ ] Create/update business profile
* [ ] Upload business logo

### Customers

* [ ] Create customer
* [ ] Edit customer
* [ ] Delete customer
* [ ] Search customer
* [ ] View customer details

### Products

* [ ] Create product/service
* [ ] Edit product/service
* [ ] Delete product/service
* [ ] Search product/service

### Quotes

* [ ] Create quote
* [ ] Add multiple items
* [ ] Calculate subtotal
* [ ] Calculate discount
* [ ] Calculate tax
* [ ] Calculate total
* [ ] Save draft
* [ ] Change status
* [ ] Generate PDF
* [ ] Download PDF
* [ ] Share PDF
* [ ] Convert accepted quote to invoice

### Invoices

* [ ] Create invoice
* [ ] Add multiple items
* [ ] Calculate totals
* [ ] Set due date
* [ ] Generate PDF
* [ ] Download PDF
* [ ] Track payment status
* [ ] Mark invoice as paid

### Dashboard

* [ ] Display quote count
* [ ] Display invoice count
* [ ] Display outstanding amount
* [ ] Display paid amount
* [ ] Display recent documents

### Responsive

* [ ] Desktop works correctly
* [ ] Tablet works correctly
* [ ] Mobile web works correctly
* [ ] No unnecessary horizontal scrolling

### Mobile

* [ ] Login works
* [ ] Dashboard works
* [ ] Customer management works
* [ ] Product management works
* [ ] Quote creation works
* [ ] Invoice viewing works
* [ ] PDF sharing works

---

# 41. MVP Definition of Done

The MVP is ready for initial users when:

1. Core functionality works without critical errors.
2. Users can create a quote in under a few minutes.
3. Users can convert an accepted quote to an invoice.
4. Generated PDFs are professional and accurate.
5. Financial calculations are correct.
6. User data is isolated securely.
7. Web UI works on desktop, tablet, and mobile.
8. Core mobile functionality works on Android and iOS.
9. Critical errors are logged.
10. Production environment configuration is documented.
11. Database migrations are reproducible.
12. Core business logic has automated tests.
13. No critical security vulnerabilities are known.
14. No major UI blocker exists on supported screen sizes.

---

# 42. Guiding Product Principle

The MVP should follow one rule:

> **Simple enough that a small business owner can create and send a professional quote without needing accounting knowledge.**

Do not add features merely because they are technically interesting.

Every V1 feature should support:

**Create → Send → Convert → Invoice → Track Payment**

---

## End of PRD — V1
