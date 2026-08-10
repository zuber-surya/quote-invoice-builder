# Quote & Invoice Builder

## UI/UX Specification — MVP V1

**Document Version:** 1.0
**Status:** MVP
**Platforms:** Responsive Web + Mobile App
**UI Generation:** Google Stitch / Lovable
**Web:** Next.js + React + Tailwind CSS + shadcn/ui
**Mobile:** Flutter
**Related Documents:** PRD V1, SAD V1, DDD V1, API Specification V1

---

# 1. Purpose

This document defines the user interface and user experience for the Quote & Invoice Builder MVP.

The goal is to create an application that feels:

* Simple
* Professional
* Fast
* Modern
* Clean
* Easy for non-accounting users
* Responsive
* Mobile-friendly

The application should not feel like complicated accounting software.

The primary user should be able to create a quote within a few minutes.

---

# 2. Core UX Principle

The application should follow:

> **Create → Send → Convert → Invoice → Track Payment**

Every major UI decision should support this workflow.

---

# 3. Design Direction

### Visual Style

Recommended style:

```text
Modern
Minimal
Professional
Clean
Lightweight
Business SaaS
```

Avoid:

* Heavy gradients
* Excessive animations
* Complex dashboards
* Too many colors
* Dense tables on mobile
* Overly decorative UI

---

# 4. Suggested Visual Language

### Color System

Use a neutral foundation with one primary brand color.

Example:

```text id="1q6ezb"
Background       #F8FAFC
Surface          #FFFFFF
Primary          #2563EB
Primary Hover    #1D4ED8
Text             #0F172A
Secondary Text   #64748B
Border           #E2E8F0
Success          #16A34A
Warning          #F59E0B
Danger           #DC2626
```

The exact colors can be finalized in the design-generation stage.

The important rule is:

**Use one primary brand color and semantic colors only where necessary.**

---

# 5. Typography

Recommended:

```text
Font: Inter
```

Hierarchy:

```text
Page Title       24–32px
Section Heading  18–20px
Card Heading     16–18px
Body             14–16px
Small Text       12–14px
```

Typography should remain readable on mobile.

---

# 6. Layout Principles

Desktop:

```text
┌────────────────────────────────────────────┐
│ Header                                     │
├──────────────┬─────────────────────────────┤
│ Sidebar      │ Main Content                │
│              │                             │
│ Dashboard    │                             │
│ Customers    │                             │
│ Products     │                             │
│ Quotes       │                             │
│ Invoices     │                             │
│ Settings     │                             │
│              │                             │
└──────────────┴─────────────────────────────┘
```

Mobile:

```text
┌─────────────────────────────┐
│ Header                      │
├─────────────────────────────┤
│                             │
│ Main Content                │
│                             │
│                             │
├─────────────────────────────┤
│ Home Customers Quotes More  │
└─────────────────────────────┘
```

---

# 7. Responsive Breakpoints

The web application should support:

```text
Mobile:
320px – 767px

Tablet:
768px – 1023px

Desktop:
1024px+
```

The UI must be tested at:

```text
320px
375px
390px
414px
768px
1024px
1280px
1440px
1920px
```

---

# 8. Navigation

## Desktop Sidebar

Navigation:

```text
Logo

Dashboard

Customers

Products / Services

Quotes

Invoices

──────────────

Settings

Profile
```

Primary CTA:

```text
+ Create Quote
```

This can be placed near the top of the sidebar or header.

---

# 9. Mobile Navigation

Use a bottom navigation bar:

```text
Home
Customers
Quotes
Invoices
More
```

The most important action should be easily accessible.

Recommended floating or prominent action:

```text
+ Quote
```

---

# 10. Global Header

Desktop:

```text
┌───────────────────────────────────────────────┐
│ Page Title                    + Create Quote  │
│                               Avatar ▼       │
└───────────────────────────────────────────────┘
```

Mobile:

```text
┌──────────────────────────────┐
│ ☰    Dashboard       Avatar │
└──────────────────────────────┘
```

---

# 11. Global UI Components

Create reusable components for:

```text
Button
IconButton
Input
Textarea
Select
DatePicker
SearchInput
Dropdown
Checkbox
Radio
Switch
Modal
Drawer
Card
Badge
Table
Pagination
Tabs
Toast
Alert
ConfirmDialog
EmptyState
Skeleton
LoadingSpinner
ErrorState
FileUpload
CurrencyInput
```

These should be part of the shared design system.

---

# 12. Button Types

### Primary

Used for:

* Create Quote
* Save
* Generate Quote
* Create Invoice

### Secondary

Used for:

* Cancel
* Back
* Preview

### Destructive

Used for:

* Delete

### Ghost

Used for:

* Secondary actions
* Table actions

---

# 13. Status Badges

Quotes:

```text
Draft       Neutral
Sent        Blue
Accepted    Green
Rejected    Red
Expired     Gray
```

Invoices:

```text
Draft            Neutral
Unpaid           Warning
Partially Paid   Blue
Paid             Green
Overdue          Red
```

Do not rely only on colors.

The status text must always be visible.

---

# 14. Global States

Every major page must support:

### Loading

Use skeletons rather than blank screens.

### Empty

Example:

```text
No customers yet

Add your first customer to start creating quotes.

[ + Add Customer ]
```

### Error

Example:

```text
Something went wrong

We couldn't load your customers.

[ Try Again ]
```

### Success

Use a short toast:

```text
Customer created successfully.
```

---

# 15. Authentication Screens

## Login

Route:

```text
/login
```

UI:

```text
┌─────────────────────────────┐
│                             │
│       Quote & Invoice       │
│                             │
│ Welcome back                │
│ Sign in to continue         │
│                             │
│ Email                       │
│ [____________________]      │
│                             │
│ Password                    │
│ [____________________]      │
│                             │
│ [        Sign In        ]   │
│                             │
│ Forgot password?            │
│                             │
│ Don't have an account?      │
│ Create account              │
└─────────────────────────────┘
```

---

# 16. Registration

Route:

```text
/register
```

Fields:

```text
Name
Email
Password
Confirm Password
```

CTA:

```text
Create Account
```

After registration:

```text
Registration
     ↓
Business Profile Setup
     ↓
Dashboard
```

---

# 17. Business Profile Setup

After first login:

```text
Set up your business

Business Name *
Owner Name
Phone
Email
Address
City
State
Postal Code
Tax/GST Number
Website
Logo
Currency
```

Primary action:

```text
Save & Continue
```

Default:

```text
Currency = INR
```

---

# 18. Dashboard

Route:

```text
/dashboard
```

### Desktop

```text
Good morning, Zuber

Here's what's happening with your business.

                    [ + Create Quote ]

┌──────────────┐ ┌──────────────┐
│ Total Quotes │ │ Total Invoice│
│     25       │ │      18      │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Paid         │ │ Outstanding  │
│ ₹1,25,000    │ │ ₹45,000      │
└──────────────┘ └──────────────┘

Recent Quotes
────────────────────────────────────
Q-00025  ABC Ltd    ₹25,000   Sent
Q-00024  XYZ Ltd    ₹18,000   Accepted

Recent Invoices
────────────────────────────────────
INV-00018 ABC Ltd   ₹30,000   Unpaid
INV-00017 XYZ Ltd   ₹20,000   Paid
```

---

# 19. Dashboard Mobile

```text
Good morning

[ + Create Quote ]

┌───────────────────┐
│ Outstanding       │
│ ₹45,000            │
└───────────────────┘

┌───────────────────┐
│ Paid              │
│ ₹1,25,000          │
└───────────────────┘

Recent Quotes

Q-00025
ABC Ltd
₹25,000
Sent

Q-00024
XYZ Ltd
₹18,000
Accepted
```

Cards should stack vertically.

---

# 20. Customers List

Route:

```text
/customers
```

Desktop:

```text
Customers                         [ + Add Customer ]

[ Search customers... ]

┌─────────────────────────────────────────────┐
│ Name       Company      Phone      Actions  │
├─────────────────────────────────────────────┤
│ Ahmed      ABC Ltd      +91...     •••      │
│ John       XYZ Ltd      +91...     •••      │
└─────────────────────────────────────────────┘
```

---

# 21. Customers Mobile

Replace the table with cards.

```text
Customers

[ Search... ]

┌─────────────────────────────┐
│ Ahmed Khan                  │
│ ABC Traders                 │
│ +91 98765xxxxx              │
│                             │
│ 4 Quotes · 2 Invoices       │
│                         ›   │
└─────────────────────────────┘
```

---

# 22. Add Customer

Route:

```text
/customers/new
```

Form:

```text
Customer Information

Name *
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

[ Cancel ] [ Save Customer ]
```

On mobile, fields should use the full width.

---

# 23. Customer Details

Route:

```text
/customers/:id
```

Header:

```text
Ahmed Khan
ABC Traders

[ Edit ]
```

Sections:

```text
Contact Information
Address

Quotes
Invoices
```

Quick action:

```text
+ Create Quote
```

The customer should be preselected when creating a quote from this screen.

---

# 24. Products / Services List

Route:

```text
/products
```

Desktop:

```text
Products & Services             [ + Add ]

[ Search... ]

┌─────────────────────────────────────────┐
│ Name             Price       Tax   •••  │
├─────────────────────────────────────────┤
│ Website Dev      ₹25,000     18%  •••  │
│ Hosting          ₹5,000      18%  •••  │
└─────────────────────────────────────────┘
```

Mobile:

```text
Website Development
₹25,000 · 18%

Hosting
₹5,000 · 18%
```

---

# 25. Product Form

Fields:

```text
Name *
Description

Unit *
Price *
Tax %

[ Cancel ] [ Save Product ]
```

Example:

```text
Name:
Website Development

Unit:
Project

Price:
₹25,000

Tax:
18%
```

---

# 26. Quote List

Route:

```text
/quotes
```

Header:

```text
Quotes                       [ + Create Quote ]
```

Filters:

```text
[ Search ]
[ Status ▼ ]
[ Customer ▼ ]
[ Date ]
```

Desktop:

```text
┌────────────────────────────────────────────────┐
│ Quote   Customer   Date      Amount    Status │
├────────────────────────────────────────────────┤
│ Q-00025 ABC Ltd    Aug 10    ₹25,000   Sent   │
│ Q-00024 XYZ Ltd    Aug 09    ₹18,000   Draft  │
└────────────────────────────────────────────────┘
```

---

# 27. Quote List Mobile

Use cards:

```text
Q-00025

ABC Ltd
Aug 10, 2026

₹25,000

[ Sent ]                         ›
```

---

# 28. Create Quote — Main Screen

Route:

```text
/quotes/new
```

This is the most important screen in the application.

Desktop layout:

```text
Create Quote

Customer
┌────────────────────────────────────┐
│ Select customer                ▼   │
└────────────────────────────────────┘

Quote Date          Expiry Date
[ 10 Aug 2026 ]     [ 25 Aug 2026 ]

Items
────────────────────────────────────────

Item          Qty     Price      Tax
Website Dev    1      ₹25,000    18%

[ + Add Item ]

Notes
[......................................]

Terms
[......................................]

────────────────────────────────────────

Subtotal                    ₹25,000
Discount                     ₹0
Tax                          ₹4,500
────────────────────────────────────────
Total                       ₹29,500

[ Save Draft ]     [ Generate Quote ]
```

---

# 29. Quote Item UX

When the user clicks:

```text
+ Add Item
```

show a modal/drawer.

```text
Add Item

Product / Service
[ Select product ▼ ]

Quantity
[ 1 ]

Unit Price
[ ₹25,000 ]

Discount
[ ₹0 ]

Tax
[ 18% ]

[ Cancel ] [ Add Item ]
```

If a product is selected:

```text
Name
Unit
Price
Tax
```

should automatically populate.

The user can still modify the values for this specific quote.

---

# 30. Custom Quote Item

The user should be able to create a one-time custom item without creating a permanent product.

Example:

```text
Product / Service
[ Custom Item ]

Name
[ Consultation ]

Quantity
[ 2 ]

Unit Price
[ ₹5,000 ]
```

This is important for usability.

---

# 31. Quote Calculation UX

The total section should update immediately as the user changes:

* Quantity
* Price
* Discount
* Tax

Example:

```text
Subtotal          ₹30,000
Discount           ₹2,000
Tax                ₹5,040
─────────────────────────
Total             ₹33,040
```

However, the backend remains authoritative.

---

# 32. Quote Preview

Before final generation, the user should be able to preview the document.

Desktop:

```text
[ Edit ] [ Preview ] [ Generate PDF ]
```

Mobile:

```text
[ Preview ]
```

The preview should resemble the final PDF.

---

# 33. Quote Details

Route:

```text
/quotes/:id
```

Header:

```text
Q-00025
ABC Traders

[ Sent ]

[ Edit ] [ Download PDF ] [ More ]
```

Summary:

```text
Quote Date
10 Aug 2026

Valid Until
25 Aug 2026

Total
₹29,500
```

Items:

```text
Website Development
1 × ₹25,000
Tax 18%
₹29,500
```

Actions:

```text
Mark as Accepted
Mark as Rejected
Download PDF
Convert to Invoice
```

Only valid actions should be visible based on status.

---

# 34. Quote Status UX

For a draft:

```text
Draft

[ Edit ]
[ Delete ]
[ Send/Mark as Sent ]
```

For sent:

```text
Sent

[ Mark Accepted ]
[ Mark Rejected ]
[ Download PDF ]
```

For accepted:

```text
Accepted

[ Convert to Invoice ]
[ Download PDF ]
```

For rejected:

```text
Rejected

[ Download PDF ]
```

For expired:

```text
Expired

[ Download PDF ]
```

---

# 35. Convert Quote to Invoice Confirmation

When the user clicks:

```text
Convert to Invoice
```

show:

```text
Convert Quote to Invoice?

This will create a new invoice using
the quote's customer and items.

Quote:
Q-00025

Total:
₹29,500

[ Cancel ] [ Create Invoice ]
```

After success:

```text
Invoice INV-00018 created successfully.
```

Then navigate to:

```text
/invoices/INV-00018
```

---

# 36. Invoice List

Route:

```text
/invoices
```

Header:

```text
Invoices                    [ + Create Invoice ]
```

Filters:

```text
Search
Status
Customer
Date
```

Desktop columns:

```text
Invoice
Customer
Date
Due Date
Amount
Status
Actions
```

---

# 37. Invoice Mobile

Card:

```text
INV-00018

ABC Traders

₹29,500

Due Aug 25

[ Unpaid ]                  ›
```

---

# 38. Create Invoice

Route:

```text
/invoices/new
```

Same basic structure as quote creation.

```text
Customer
Invoice Date
Due Date

Items

Subtotal
Discount
Tax
Total

Notes
Terms

[ Save Draft ]
[ Create Invoice ]
```

If opened from a quote:

```text
Customer
Items
Prices
Taxes
Notes
Terms
```

are pre-populated.

---

# 39. Invoice Details

Route:

```text
/invoices/:id
```

Header:

```text
INV-00018

ABC Traders

[ Unpaid ]

[ Download PDF ] [ Record Payment ]
```

Summary:

```text
Invoice Date
10 Aug 2026

Due Date
25 Aug 2026

Total
₹29,500

Paid
₹10,000

Remaining
₹19,500
```

---

# 40. Record Payment

Modal:

```text
Record Payment

Invoice Total
₹29,500

Already Paid
₹10,000

Remaining
₹19,500

Payment Amount
[ ₹____________ ]

Payment Date
[ 10 Aug 2026 ]

Notes
[ Cash payment ]

[ Cancel ] [ Record Payment ]
```

If amount exceeds remaining:

```text
Payment amount cannot exceed
the remaining balance of ₹19,500.
```

---

# 41. Invoice Payment Status

### Unpaid

```text
Total: ₹29,500
Paid: ₹0
Remaining: ₹29,500
```

### Partially Paid

```text
Total: ₹29,500
Paid: ₹10,000
Remaining: ₹19,500
```

### Paid

```text
Total: ₹29,500
Paid: ₹29,500
Remaining: ₹0

✓ Paid
```

---

# 42. Settings

Route:

```text
/settings
```

Sections:

```text
Business Profile
Quote Settings
Invoice Settings
Terms & Conditions
Account
```

---

# 43. Business Profile Screen

Editable fields:

```text
Business Logo
Business Name
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
Currency
```

---

# 44. Quote Settings

V1:

```text
Quote Prefix
Quote Number Start
Default Validity Days
Default Terms
```

Example:

```text
Prefix:
Q-

Starting Number:
1

Default Validity:
15 days
```

The exact numbering configuration may be simplified if implementation complexity becomes unnecessary.

---

# 45. Invoice Settings

```text
Invoice Prefix
Invoice Number Start
Default Payment Terms
Default Notes
```

Example:

```text
Prefix:
INV-

Starting Number:
1

Payment Terms:
15 days
```

---

# 46. Account Settings

```text
Name
Email
Password
Logout
```

Danger zone:

```text
Delete Account
```

Account deletion should require confirmation.

---

# 47. Mobile App Navigation

Recommended:

```text
┌─────────────────────────────┐
│                             │
│          Content            │
│                             │
│                             │
├─────────────────────────────┤
│ Home │ Customers │ Quotes   │
│      │           │ Invoices │
│      │           │ More     │
└─────────────────────────────┘
```

Primary create action should remain easily accessible.

---

# 48. Mobile Dashboard

Priority order:

```text
1. Create Quote
2. Outstanding Amount
3. Paid Amount
4. Recent Quotes
5. Recent Invoices
```

Do not put large analytics charts in V1.

---

# 49. Mobile Quote Creation

The mobile quote creation experience should use a single scrollable form.

```text
Create Quote

Customer
[ Select Customer ]

Quote Date
[ Today ]

Expiry
[ 25 Aug ]

Items
──────────────

Website Development
1 × ₹25,000

[ + Add Item ]

Subtotal
₹25,000

Tax
₹4,500

Total
₹29,500

[ Save Draft ]

[ Generate Quote ]
```

---

# 50. Mobile Item Entry

Use a bottom sheet rather than a large desktop-style modal.

```text
Add Item

Product
[ Website Development ▼ ]

Quantity
[ 1 ]

Price
[ ₹25,000 ]

Discount
[ ₹0 ]

Tax
[ 18% ]

[ Add Item ]
```

---

# 51. Mobile PDF Sharing

After generating the PDF:

```text
Quote Generated

Q-00025
₹29,500

[ View PDF ]

[ Share ]

[ Done ]
```

Use the native mobile share mechanism.

---

# 52. Mobile Invoice Payment

The payment button should be prominent.

```text
INV-00018

₹29,500

Unpaid

[ Record Payment ]
```

The payment form should use large touch-friendly controls.

---

# 53. Touch Target Requirements

Mobile interactive elements should have comfortable touch targets.

Recommended:

```text
Minimum ~44px
```

Avoid tiny icon-only controls for important actions.

---

# 54. Forms

Forms must:

* Have visible labels.
* Show required fields.
* Show inline validation.
* Preserve user input after validation errors.
* Clearly show errors.
* Disable submission while saving.
* Prevent accidental duplicate submissions.

Example:

```text
Customer Name *

[ Ahmed Khan ]

✓ Looks good
```

---

# 55. Loading States

During save:

```text
[ Saving... ]
```

The button should be disabled.

After success:

```text
✓ Customer saved
```

Use skeleton loading for lists and dashboard data.

---

# 56. Error States

Example:

```text
Unable to load quotes.

Please check your connection and try again.

[ Try Again ]
```

Do not show raw API errors.

---

# 57. Confirmation Dialogs

Use confirmation dialogs for destructive actions.

Example:

```text
Delete Customer?

This action cannot be undone.

[ Cancel ] [ Delete Customer ]
```

For financial documents:

```text
Delete Invoice?

Issued invoices cannot be deleted.
```

Prefer preventing the action rather than showing a confusing confirmation.

---

# 58. Toast Notifications

Use short messages.

Success:

```text
Quote created successfully.
```

Error:

```text
Unable to create quote.
```

Payment:

```text
Payment recorded successfully.
```

Avoid:

```text
Your request has been successfully processed and
the record has been persisted in the database.
```

---

# 59. Empty States

Customers:

```text
No customers yet

Add your first customer to start creating quotes.

[ + Add Customer ]
```

Products:

```text
No products or services yet

Add commonly used services to create quotes faster.

[ + Add Product ]
```

Quotes:

```text
No quotes yet

Create your first quote.

[ + Create Quote ]
```

Invoices:

```text
No invoices yet

Invoices will appear here after you create them.

[ + Create Invoice ]
```

---

# 60. Accessibility

The UI must support:

* Keyboard navigation
* Focus indicators
* Semantic HTML
* Form labels
* Accessible dialogs
* Accessible dropdowns
* Screen reader-friendly buttons
* Sufficient contrast
* Error messages associated with fields

Do not use color as the only indicator of status.

---

# 61. Animation

Animations should be subtle.

Allowed:

* Modal transitions
* Drawer transitions
* Toast appearance
* Loading indicators
* Small hover states

Avoid:

* Excessive page animations
* Large motion effects
* Animated dashboards
* Slow transitions

The application should feel fast.

---

# 62. Responsive Tables

Tables should not simply overflow horizontally on mobile.

Desktop:

```text
Table
```

Mobile:

```text
Card List
```

For example:

```text
Desktop:
Quote | Customer | Date | Amount | Status

Mobile:
Q-00025
ABC Ltd
₹29,500
Sent
```

---

# 63. Desktop Quote Creation Layout

Use a two-column layout where appropriate:

```text
┌─────────────────────────────────────────────────────┐
│ Create Quote                                        │
├──────────────────────────────┬──────────────────────┤
│ Quote Form                   │ Summary              │
│                              │                      │
│ Customer                     │ Subtotal             │
│ Dates                        │ Discount             │
│ Items                        │ Tax                  │
│ Notes                        │ ─────────────        │
│ Terms                        │ Total                │
│                              │                      │
│                              │ [Generate Quote]     │
└──────────────────────────────┴──────────────────────┘
```

On mobile this becomes one column.

---

# 64. Sticky Summary

On desktop quote/invoice creation screens, the summary can remain visible while editing items.

On mobile:

```text
Total
₹29,500
```

may be displayed in a sticky bottom action bar.

---

# 65. Mobile Bottom Action Bar

For important creation screens:

```text
┌─────────────────────────────┐
│ Total       ₹29,500         │
│ [ Save Draft ] [ Generate ] │
└─────────────────────────────┘
```

The action bar must not hide form fields or navigation.

---

# 66. PDF Visual Design

Generated PDFs should have a professional but simple appearance.

Suggested structure:

```text
┌─────────────────────────────────────────┐
│ LOGO       BUSINESS NAME                │
│            Address / Phone / Email      │
├─────────────────────────────────────────┤
│ QUOTE                                   │
│ Q-00025                                 │
│ Date: 10 Aug 2026                       │
│ Valid Until: 25 Aug 2026                │
├─────────────────────────────────────────┤
│ BILL TO                                 │
│ ABC Traders                             │
│ Ahmed Khan                              │
├─────────────────────────────────────────┤
│ Item        Qty   Price   Tax   Amount │
├─────────────────────────────────────────┤
│ Website     1    25,000   18%  29,500 │
├─────────────────────────────────────────┤
│                       Subtotal  25,000 │
│                       Tax        4,500 │
│                       TOTAL     29,500 │
├─────────────────────────────────────────┤
│ Notes                                   │
│ Terms                                   │
└─────────────────────────────────────────┘
```

---

# 67. UI Component Architecture

Components should be reusable.

Example:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Badge
│   └── Card
│
├── layout/
│   ├── Sidebar
│   ├── Header
│   ├── MobileNav
│   └── PageHeader
│
├── customers/
│   ├── CustomerForm
│   ├── CustomerCard
│   └── CustomerList
│
├── products/
│   ├── ProductForm
│   └── ProductList
│
├── quotes/
│   ├── QuoteForm
│   ├── QuoteItemForm
│   ├── QuoteSummary
│   ├── QuoteCard
│   └── QuoteStatusBadge
│
└── invoices/
    ├── InvoiceForm
    ├── InvoiceSummary
    ├── InvoiceCard
    └── PaymentForm
```

---

# 68. Design System Rules

The project must avoid:

```text
Inline CSS
Random colors
Random font sizes
Duplicated buttons
Duplicated forms
Page-specific versions of common components
```

Use centralized:

```text
Design tokens
CSS variables
Tailwind configuration
Reusable components
```

---

# 69. Form Component Reuse

Customer forms should be reused for:

```text
Create Customer
Edit Customer
```

Product forms:

```text
Create Product
Edit Product
```

Quote item form:

```text
Add Item
Edit Item
```

Do not create separate duplicated components for each screen.

---

# 70. UI Data Flow

The web UI should follow:

```text
UI
 ↓
Feature Hook / Action
 ↓
API Client
 ↓
REST API
 ↓
Service
 ↓
Database
```

Mobile:

```text
Flutter UI
 ↓
Controller / Provider
 ↓
Repository
 ↓
API Client
 ↓
REST API
```

---

# 71. Navigation Rules

After creating a customer:

```text
Save Customer
      ↓
Customer Details
```

After creating a quote:

```text
Create Quote
      ↓
Quote Details
```

After converting a quote:

```text
Convert
   ↓
Invoice Details
```

After recording full payment:

```text
Payment
   ↓
Invoice Details
```

---

# 72. Unsaved Changes

Quote/invoice forms should warn users before leaving if there are significant unsaved changes.

Example:

```text
You have unsaved changes.

Are you sure you want to leave?

[ Stay ] [ Leave ]
```

This can be implemented after the core functionality if necessary.

---

# 73. Mobile Offline Strategy

Full offline functionality is **out of scope for V1**.

If the network is unavailable:

```text
Unable to connect.

Please check your internet connection
and try again.
```

Future versions can support offline drafts.

---

# 74. Performance UX

The UI should:

* Load important content first.
* Use skeleton states.
* Avoid unnecessary API calls.
* Paginate large lists.
* Debounce search inputs.
* Avoid loading full document histories unnecessarily.
* Lazy-load heavy PDF/preview functionality.

---

# 75. Google Stitch / Lovable Design Generation Strategy

Do not ask the UI generator to build the entire application in one prompt.

Generate in stages.

### Stage 1

Design system + application shell.

### Stage 2

Dashboard.

### Stage 3

Customers.

### Stage 4

Products.

### Stage 5

Quotes.

### Stage 6

Invoices.

### Stage 7

Settings.

### Stage 8

Mobile responsive refinement.

---

# 76. Stitch/Lovable Master UI Prompt

Use the following as the initial design-generation prompt:

> Design a modern, minimal SaaS application called "Quote & Invoice Builder" for freelancers and small businesses.
>
> The application allows users to manage customers and products/services, create professional quotations, convert accepted quotations into invoices, generate PDFs, and track invoice payment status.
>
> The design must feel simple and approachable rather than like complex accounting software.
>
> Use a clean professional SaaS visual language, generous whitespace, subtle borders, rounded cards, clear typography, accessible form controls, and one primary brand color with neutral backgrounds.
>
> Use responsive layouts for desktop, tablet, and mobile.
>
> Desktop should use a sidebar navigation with Dashboard, Customers, Products & Services, Quotes, Invoices, and Settings.
>
> Mobile should use a compact header and bottom navigation.
>
> The primary action throughout the application should be "Create Quote".
>
> Design reusable UI components including buttons, inputs, selects, date pickers, cards, tables, badges, dialogs, drawers, empty states, loading states, and error states.
>
> Quote and invoice creation screens should prioritize simplicity and fast data entry.
>
> Do not create complex charts, accounting modules, inventory management, payment gateways, AI features, CRM features, or unnecessary enterprise functionality.
>
> Generate polished production-quality UI screens with realistic sample data.

---

# 77. Dashboard Design Prompt

> Create a responsive dashboard for a simple Quote & Invoice Builder SaaS application.
>
> Show a clean greeting, primary "Create Quote" action, four summary cards for Total Quotes, Total Invoices, Paid Amount, and Outstanding Amount, followed by Recent Quotes and Recent Invoices.
>
> Keep the dashboard simple and useful. Do not use complex analytics charts.
>
> Desktop should use a left sidebar. Mobile should use a bottom navigation.
>
> Use realistic small-business sample data and clear status badges.

---

# 78. Customers Design Prompt

> Create responsive customer management screens for a modern Quote & Invoice Builder application.
>
> Include Customer List, Add Customer form, Edit Customer form, and Customer Details.
>
> Desktop should use a clean data table. Mobile should transform the table into cards.
>
> Include search, add customer action, contact information, quote count, invoice count, and clear empty/loading/error states.
>
> The design should be minimal, professional, and optimized for quick data entry.

---

# 79. Products Design Prompt

> Create responsive Products & Services management screens for a Quote & Invoice Builder SaaS application.
>
> Include product/service list and create/edit form.
>
> Each item should display name, description, unit, price, and tax percentage.
>
> Desktop should use a compact table and mobile should use cards.
>
> Include search, add product action, validation states, empty state, loading state, and confirmation for deletion.

---

# 80. Quote Design Prompt

> Create the main Quote Builder experience for a modern small-business Quote & Invoice application.
>
> The screen must make it extremely easy to create a quote.
>
> Include customer selection, quote date, expiry date, dynamic line items, add item action, quantity, unit price, discount, tax, notes, terms, subtotal, discount, tax, and total.
>
> Desktop should use a two-column layout with the form on the left and a sticky summary on the right.
>
> Mobile should use a single-column layout with a sticky bottom total/action bar.
>
> Provide a product selection drawer/modal for adding items.
>
> Also support custom one-time items.
>
> Include Save Draft and Generate Quote actions.
>
> Make the experience fast, clean, and professional.

---

# 81. Invoice Design Prompt

> Create responsive invoice management screens for a simple Quote & Invoice Builder SaaS.
>
> Include invoice list, invoice details, create invoice, and record payment.
>
> Show invoice number, customer, invoice date, due date, total, paid amount, remaining amount, and payment status.
>
> Use clear status badges for Unpaid, Partially Paid, Paid, and Overdue.
>
> Provide a prominent Record Payment action.
>
> Mobile screens should use cards and large touch-friendly actions.
>
> Keep the design simple and avoid complex accounting functionality.

---

# 82. Mobile Design Prompt

> Create a mobile-first version of the Quote & Invoice Builder application for Android and iOS.
>
> Use bottom navigation with Home, Customers, Quotes, Invoices, and More.
>
> Make Create Quote the primary action.
>
> Optimize customer selection, adding quote items, viewing totals, generating PDFs, sharing PDFs, viewing invoices, and recording payments for one-handed mobile use.
>
> Use large touch targets, simple forms, bottom sheets for item entry, sticky bottom actions where appropriate, and clean cards.
>
> Do not simply shrink the desktop UI. Redesign the interactions for mobile.

---

# 83. Screen Inventory

The V1 UI should contain approximately:

### Authentication

```text
1. Login
2. Register
3. Forgot Password
```

### Setup

```text
4. Business Profile Setup
```

### Dashboard

```text
5. Dashboard
```

### Customers

```text
6. Customer List
7. Add/Edit Customer
8. Customer Details
```

### Products

```text
9. Product List
10. Add/Edit Product
```

### Quotes

```text
11. Quote List
12. Create Quote
13. Quote Details
14. Quote Preview
15. Add Quote Item
```

### Invoices

```text
16. Invoice List
17. Create Invoice
18. Invoice Details
19. Record Payment
```

### Settings

```text
20. Settings
21. Business Profile
22. Quote Settings
23. Invoice Settings
24. Account Settings
```

Some of these should be implemented as dialogs/drawers rather than separate routes.

---

# 84. Mobile Screen Inventory

Core mobile screens:

```text
Login
Dashboard
Customers
Customer Details
Add Customer
Products
Quotes
Create Quote
Quote Details
Invoices
Invoice Details
Record Payment
Settings
Business Profile
```

---

# 85. UI Definition of Done

The UI is complete when:

* [ ] All required V1 screens exist.
* [ ] Desktop layout works.
* [ ] Tablet layout works.
* [ ] Mobile web layout works.
* [ ] Mobile application screens are defined.
* [ ] Navigation is consistent.
* [ ] Forms have validation states.
* [ ] Loading states exist.
* [ ] Empty states exist.
* [ ] Error states exist.
* [ ] Success states exist.
* [ ] Destructive actions require confirmation.
* [ ] Quote creation is easy to use.
* [ ] Invoice payment flow is clear.
* [ ] PDF preview/download actions are accessible.
* [ ] Touch targets are appropriate.
* [ ] Accessibility basics are implemented.
* [ ] No unnecessary UI complexity exists.

---

# 86. Final UX Principle

The user should never have to think:

> "How do I create an invoice?"

The interface should naturally guide them:

```text
Dashboard
    ↓
Create Quote
    ↓
Select Customer
    ↓
Add Items
    ↓
Generate Quote
    ↓
Accepted
    ↓
Convert to Invoice
    ↓
Record Payment
    ↓
Paid
```

The product should feel like a **simple business document tool**, not a full accounting platform.

---

## End of UI/UX Specification — V1
