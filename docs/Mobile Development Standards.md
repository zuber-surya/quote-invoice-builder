# Quote & Invoice Builder

## Mobile Development Standards — MVP V1

**Document Version:** 1.0
**Status:** Mandatory Development Standard
**Platforms:** Android + iOS
**Framework:** Flutter
**Language:** Dart
**Backend:** REST API
**Database:** PostgreSQL via Backend API
**State Management:** Riverpod
**Authentication:** Backend Authentication
**PDF:** Backend-generated PDF
**Repository:** GitHub
**Related Documents:** PRD V1, SAD V1, DDD V1, API Specification V1, UI/UX Specification V1

---

# 1. Purpose

This document defines the architecture, coding standards, UI standards, API integration standards, testing requirements, and security rules for the Flutter mobile application.

The mobile application must provide the same core business capabilities as the web application:

```text
Customers
Products / Services
Quotes
Invoices
Payments
PDFs
Dashboard
Business Profile
```

The mobile application is a **client of the backend**, not an independent business system.

---

# 2. Core Principle

The most important rule is:

> **The backend is the single source of truth.**

The Flutter application must not independently implement authoritative:

* Invoice totals
* Quote totals
* Tax calculations
* Payment status
* Quote status transitions
* Invoice status transitions
* Document numbering
* Quote-to-invoice conversion

The mobile application can perform calculations for immediate UI feedback, but the backend must validate and calculate the final values.

---

# 3. Technology Stack

Recommended:

```text
Flutter
Dart
Riverpod
Dio
GoRouter
Freezed
json_serializable
Flutter Secure Storage
```

Additional packages should only be introduced when justified.

---

# 4. Architecture

Use a feature-oriented architecture.

Recommended:

```text
Presentation
     ↓
Application / State
     ↓
Domain
     ↓
Data
     ↓
REST API
```

Example:

```text
┌──────────────────────────────┐
│ Flutter UI                   │
├──────────────────────────────┤
│ Riverpod Providers           │
├──────────────────────────────┤
│ Use Cases / Services         │
├──────────────────────────────┤
│ Repositories                 │
├──────────────────────────────┤
│ API Client                   │
├──────────────────────────────┤
│ REST API                     │
└──────────────────────────────┘
```

---

# 5. Project Structure

Recommended:

```text
mobile/
├── lib/
│   ├── app/
│   │   ├── app.dart
│   │   ├── router.dart
│   │   └── theme/
│   │
│   ├── core/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── logging/
│   │   ├── storage/
│   │   ├── utils/
│   │   └── widgets/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   ├── business_profile/
│   │   └── settings/
│   │
│   └── main.dart
│
├── test/
├── integration_test/
├── assets/
└── pubspec.yaml
```

---

# 6. Feature Structure

Each feature should be self-contained.

Example:

```text
features/quotes/
├── data/
│   ├── models/
│   ├── datasources/
│   └── repositories/
│
├── domain/
│   ├── entities/
│   └── services/
│
└── presentation/
    ├── providers/
    ├── screens/
    ├── widgets/
    └── forms/
```

Do not put every application file into one global `screens/` folder.

---

# 7. Separation of Concerns

### UI

Responsible for:

* Rendering
* User interaction
* Visual state
* Navigation

### Providers

Responsible for:

* State
* Loading
* Error
* Data lifecycle

### Services / Use Cases

Responsible for:

* Business workflows
* Application operations

### Repositories

Responsible for:

* Data access abstraction

### API Client

Responsible for:

* HTTP
* Authentication headers
* Serialization
* API errors

---

# 8. Flutter UI Principle

Do not copy the desktop web UI into Flutter.

The mobile application must be designed for:

* Touch
* Smaller screens
* One-handed interaction
* Native navigation
* Native sharing
* Mobile keyboard
* Mobile date selection

---

# 9. Responsive Mobile Layout

Support common phone sizes:

```text
320px
360px
375px
390px
414px
430px
```

Also support tablets where practical.

The application must not assume a single screen size.

---

# 10. Orientation

Portrait should be the primary orientation.

Landscape support may be added later.

The core MVP workflows must work correctly in portrait mode.

---

# 11. Design System

Create a centralized Flutter theme.

Example:

```text
app/
└── theme/
    ├── app_colors.dart
    ├── app_text_styles.dart
    ├── app_spacing.dart
    ├── app_radius.dart
    └── app_theme.dart
```

Do not define colors and spacing independently in every widget.

---

# 12. Colors

Use the same visual language as the web application.

Recommended foundation:

```text
Background
Surface
Primary
Text
Secondary Text
Border
Success
Warning
Danger
```

The exact color values should come from the final design system.

---

# 13. No Hardcoded Colors

Avoid:

```dart
color: Colors.blue
```

throughout the application.

Prefer:

```dart
color: AppColors.primary
```

or the Material theme.

---

# 14. No Hardcoded Spacing

Avoid random values:

```dart
padding: EdgeInsets.all(13)
```

throughout the application.

Prefer centralized spacing tokens:

```dart
AppSpacing.md
```

The exact spacing system can be finalized during implementation.

---

# 15. Typography

Use the same typography hierarchy as the web application.

Recommended:

```text
Large heading
Page heading
Section heading
Body
Caption
Button
```

Use a consistent font family.

---

# 16. Reusable UI Components

Create reusable components for:

```text
AppButton
AppTextField
AppDropdown
AppDateField
AppCard
AppBadge
AppDialog
AppBottomSheet
AppSearchField
AppEmptyState
AppErrorState
AppLoading
AppCurrencyField
AppStatusBadge
```

Do not duplicate these components across features.

---

# 17. Buttons

Button types:

```text
Primary
Secondary
Outlined
Text
Danger
```

Use the centralized theme.

Important actions should be visually obvious.

---

# 18. Touch Targets

Interactive controls should be comfortably touchable.

Target:

```text
~44px minimum
```

Avoid tiny icon-only controls for important actions.

---

# 19. Navigation

Use `GoRouter` or the project's approved routing system.

Recommended routes:

```text
/login
/register
/dashboard
/customers
/customers/:id
/customers/new
/products
/products/new
/quotes
/quotes/new
/quotes/:id
/invoices
/invoices/new
/invoices/:id
/settings
/business-profile
```

---

# 20. Bottom Navigation

Primary navigation:

```text
Home
Customers
Quotes
Invoices
More
```

The navigation should remain consistent.

---

# 21. Create Quote Action

The primary action should be easily accessible.

Possible design:

```text
              + Quote
```

or:

```text
Bottom navigation
+
Floating Action Button
```

Avoid placing the primary action several navigation levels deep.

---

# 22. Riverpod

Use Riverpod consistently for application state.

Recommended categories:

```text
AuthProvider
DashboardProvider
CustomersProvider
ProductsProvider
QuotesProvider
InvoicesProvider
BusinessProfileProvider
```

Do not mix several unrelated state-management libraries.

---

# 23. Provider Responsibilities

Providers should manage:

```text
Loading
Loaded
Error
Refresh
Mutation state
```

Example:

```text
Quote List Provider
    │
    ├── loading
    ├── data
    ├── error
    └── refresh
```

---

# 24. Avoid Business Logic in Widgets

Bad:

```dart
onPressed: () async {
  // 100 lines of quote creation logic
}
```

Preferred:

```dart
onPressed: () {
  ref
      .read(quoteFormProvider.notifier)
      .createQuote();
}
```

The widget should remain focused on presentation and interaction.

---

# 25. API Client

Use a centralized HTTP client.

Recommended:

```text
core/api/
├── api_client.dart
├── api_exception.dart
├── api_response.dart
└── interceptors/
```

Dio is recommended for:

* Interceptors
* Authentication
* Request IDs
* Error handling
* Timeouts

---

# 26. API Repository

Repositories should abstract API details.

Example:

```dart
abstract class QuoteRepository {
  Future<Quote> getQuote(String id);

  Future<List<Quote>> getQuotes();

  Future<Quote> createQuote(CreateQuoteRequest request);

  Future<void> deleteQuote(String id);
}
```

The UI should not call Dio directly.

---

# 27. API Flow

```text
Screen
  ↓
Provider
  ↓
Use Case / Service
  ↓
Repository
  ↓
API Client
  ↓
REST API
```

---

# 28. Authentication

Authentication tokens/session credentials must be securely stored.

Use:

```text
Flutter Secure Storage
```

Do not store authentication secrets in:

```text
SharedPreferences
plain files
local database
```

unless the value is not sensitive.

---

# 29. Authentication Flow

```text
Login
  ↓
Backend
  ↓
Authentication response
  ↓
Secure storage
  ↓
Authenticated state
  ↓
Dashboard
```

On logout:

```text
Logout
  ↓
Clear secure credentials
  ↓
Clear sensitive cached state
  ↓
Login
```

---

# 30. Token Handling

The API client should automatically attach the appropriate authentication credential.

Do not manually add tokens in every API request.

Use an interceptor or centralized request mechanism.

---

# 31. Unauthorized Response

If the backend returns:

```text
401
```

the mobile app should:

1. Clear invalid authentication state.
2. Redirect to login.
3. Avoid infinite retry loops.

---

# 32. API Timeouts

Configure sensible timeouts.

Separate:

```text
Connect timeout
Receive timeout
Send timeout
```

The exact values should be configured centrally.

Do not hardcode timeout values across repositories.

---

# 33. API Error Model

Convert backend errors into typed application exceptions.

Example:

```dart
ApiException(
  code: 'QUOTE_NOT_FOUND',
  message: 'Quote was not found.',
);
```

UI should display user-friendly messages.

---

# 34. Error Handling

The application should distinguish:

```text
Network Error
Authentication Error
Validation Error
Authorization Error
Business Rule Error
Server Error
Unknown Error
```

This allows appropriate UX.

---

# 35. Network Error UX

Example:

```text
Unable to connect

Please check your internet connection
and try again.

[ Retry ]
```

Do not show raw Dio/HTTP exceptions to users.

---

# 36. Validation Errors

Server validation errors should map to form fields where possible.

Example:

```text
Customer Name
[                       ]

Name is required.
```

---

# 37. Loading States

Every asynchronous operation must show a meaningful state.

Examples:

```text
Loading customers...
Creating quote...
Generating PDF...
Recording payment...
```

Buttons should become disabled during submission.

---

# 38. Empty States

Every list should provide an empty state.

Example:

```text
No quotes yet.

Create your first quote to get started.

[ + Create Quote ]
```

---

# 39. Skeleton Loading

For larger pages such as Dashboard and Lists, prefer skeleton/loading placeholders where appropriate.

Avoid blank screens.

---

# 40. Pull to Refresh

Use pull-to-refresh for:

* Dashboard
* Customers
* Products
* Quotes
* Invoices

The refresh should call the same repository/provider logic rather than duplicate API code.

---

# 41. Pagination

Large lists should support pagination.

Recommended initial approach:

```text
Load first page
      ↓
Scroll near bottom
      ↓
Load next page
```

The exact pagination mechanism must match the API specification.

---

# 42. Search

Search should be debounced.

Avoid sending an API request for every keystroke.

Example:

```text
A
Ah
Ahm
Ahme
Ahmed
```

should result in a controlled number of API calls.

---

# 43. Search UX

Use:

```text
[ 🔍 Search customers... ]
```

Search should:

* Show loading state
* Show empty state
* Allow clearing
* Preserve current context where appropriate

---

# 44. Customer List

Mobile design:

```text
Customers

[ Search customers ]

┌───────────────────────────┐
│ Ahmed Khan                │
│ ABC Traders               │
│ +91 98765xxxxx            │
│                           │
│ 4 Quotes · 2 Invoices     │
└───────────────────────────┘
```

Tap the card:

```text
Customer Details
```

---

# 45. Add Customer

Use a full-screen form.

Fields:

```text
Name *
Company
Email
Phone
Address
City
State
Country
Postal Code
Tax Number
Notes
```

Use the native keyboard appropriately.

---

# 46. Customer Selection

Quote creation should provide a searchable customer selector.

Example:

```text
Select Customer

[ Search ]

Ahmed Khan
ABC Traders

John Smith
XYZ Services
```

Selecting a customer should immediately update the quote.

---

# 47. Add Customer from Quote

A useful mobile UX:

```text
Select Customer
      │
      ├── Existing Customer
      │
      └── + Add Customer
```

If the user creates a new customer, return to quote creation with the newly created customer selected.

---

# 48. Products / Services

Product selection should be searchable.

Example:

```text
Add Item

[ Search products ]

Website Development
₹25,000 · 18%

Hosting
₹5,000 · 18%

+ Custom Item
```

---

# 49. Quote Creation

Quote creation should be a single logical workflow.

```text
Customer
   ↓
Dates
   ↓
Items
   ↓
Notes
   ↓
Terms
   ↓
Summary
   ↓
Generate
```

Avoid unnecessary multi-step wizard screens for V1.

---

# 50. Quote Item Bottom Sheet

When adding an item:

```text
Add Item

Product
[ Website Development ▼ ]

Quantity
[ 1 ]

Unit Price
[ ₹25,000 ]

Discount
[ ₹0 ]

Tax
[ 18% ]

[ Add Item ]
```

Use a bottom sheet on mobile.

---

# 51. Custom Item

Allow:

```text
+ Custom Item
```

The user can enter:

```text
Name
Description
Unit
Quantity
Price
Discount
Tax
```

This item does not have to become a permanent product.

---

# 52. Quote Items List

Each item should be displayed as a card:

```text
Website Development

1 × ₹25,000
Tax 18%

₹29,500

[ Edit ] [ Delete ]
```

Avoid dense spreadsheet-style layouts on small screens.

---

# 53. Quote Summary

Display:

```text
Subtotal
₹25,000

Discount
₹0

Tax
₹4,500

────────────────

Total
₹29,500
```

The total should be visually prominent.

---

# 54. Quote Draft

User can save:

```text
Save Draft
```

The application should return to Quote Details or Quote List according to the defined UX.

---

# 55. Quote Generation

When the user taps:

```text
Generate Quote
```

show:

```text
Generating quote...
```

After success:

```text
Quote Q-00025 created.

[ View Quote ]
[ View PDF ]
[ Share ]
```

---

# 56. Quote Details

Show:

```text
Q-00025
ABC Traders

[ Sent ]

Quote Date
10 Aug 2026

Valid Until
25 Aug 2026

Total
₹29,500
```

Then:

```text
Items
Notes
Terms
```

---

# 57. Quote Actions

Actions depend on status.

Draft:

```text
Edit
Delete
Mark Sent
```

Sent:

```text
Accept
Reject
Download PDF
```

Accepted:

```text
Convert to Invoice
Download PDF
```

---

# 58. Quote Status Changes

The mobile application should not directly modify status values arbitrarily.

Use dedicated API actions.

Example:

```text
PATCH /quotes/:id/status
```

The backend validates the transition.

---

# 59. Convert Quote

Confirmation:

```text
Convert to Invoice?

This will create an invoice using
the quote's customer and items.

Total
₹29,500

[ Cancel ] [ Create Invoice ]
```

After success:

```text
Invoice INV-00018 created.
```

Navigate to invoice details.

---

# 60. Invoice List

Use cards:

```text
INV-00018

ABC Traders

₹29,500

Due 25 Aug

[ Unpaid ]
```

Tap:

```text
Invoice Details
```

---

# 61. Invoice Details

Show prominently:

```text
INV-00018
ABC Traders

₹29,500

Unpaid

Total       ₹29,500
Paid        ₹10,000
Remaining   ₹19,500

[ Record Payment ]
```

---

# 62. Record Payment

Use bottom sheet:

```text
Record Payment

Remaining
₹19,500

Amount
[ ₹____________ ]

Payment Date
[ Today ]

Notes
[______________]

[ Record Payment ]
```

---

# 63. Payment Validation

The mobile application can provide immediate validation.

Example:

```text
Remaining balance: ₹19,500

User enters:
₹20,000

Error:
Payment cannot exceed ₹19,500.
```

The backend must perform the final validation.

---

# 64. Paid Invoice

After full payment:

```text
✓ PAID

Total
₹29,500

Paid
₹29,500

Remaining
₹0
```

The primary action should no longer be "Record Payment."

---

# 65. Invoice PDF

PDF should be generated by the backend.

Mobile flow:

```text
Invoice Details
      ↓
Download/View PDF
      ↓
Backend generates PDF
      ↓
Mobile receives file/URL
      ↓
Native PDF viewer/share
```

---

# 66. PDF Sharing

Use native mobile sharing.

Example:

```text
Invoice Generated

[ View PDF ]

[ Share Invoice ]

[ Done ]
```

Share options depend on the device.

Do not implement custom WhatsApp integration in V1.

The native share sheet is sufficient.

---

# 67. Business Profile

Mobile business profile should support:

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
Tax Number
Website
Currency
```

---

# 68. Image Upload

Business logo:

```text
Take Photo
Choose from Gallery
Remove
```

Validate:

* File type
* File size

Upload through the backend API.

---

# 69. Settings

Mobile Settings:

```text
Business Profile
Quote Settings
Invoice Settings
Account
About
Logout
```

---

# 70. Logout

Logout should:

1. Clear authentication credentials.
2. Clear sensitive in-memory state.
3. Navigate to login.
4. Prevent access to protected screens.

---

# 71. Local Storage

Use secure storage for sensitive data.

Non-sensitive preferences may use normal local storage.

Examples of acceptable local preferences:

```text
Theme preference
Last selected filter
UI preferences
```

Do not store:

```text
Passwords
Access tokens in plain storage
Private secrets
```

---

# 72. Offline Support

Full offline functionality is **out of scope for V1**.

However, the application should:

* Detect network failures.
* Preserve form input while the user remains on the screen.
* Clearly indicate when a save failed.
* Allow retry.

Future versions may introduce offline drafts.

---

# 73. Local Caching

Caching may be used for read-only or frequently accessed data.

Examples:

```text
Customers
Products
Recent Quotes
Recent Invoices
```

However:

> Cached data must never override server-authoritative financial data.

---

# 74. Cache Invalidation

After mutations:

```text
Create Customer
    ↓
Refresh/invalidate customer list

Create Quote
    ↓
Refresh/invalidate quote list

Convert Invoice
    ↓
Refresh quote/invoice state

Record Payment
    ↓
Refresh invoice details
```

Do not show stale financial information after a mutation.

---

# 75. Money Formatting

Create one formatter:

```dart
formatCurrency(amount, currency)
```

Do not duplicate currency formatting throughout the application.

Example:

```text
₹29,500.00
```

---

# 76. Date Formatting

API:

```text
2026-08-10
```

Mobile UI:

```text
10 Aug 2026
```

Use a centralized date formatter.

---

# 77. Quantity Formatting

Use centralized quantity formatting.

Avoid inconsistent output such as:

```text
1
1.0
1.000
```

unless the business requirement requires it.

---

# 78. Financial Precision

Do not use floating-point arithmetic for authoritative financial operations.

If calculations are required for UI preview, use an appropriate decimal representation.

The backend remains authoritative.

---

# 79. Model Serialization

Use typed models.

Recommended:

```text
Freezed
json_serializable
```

Example conceptual model:

```dart
@freezed
class Customer with _$Customer {
  const factory Customer({
    required String id,
    required String name,
    String? email,
    String? phone,
  }) = _Customer;

  factory Customer.fromJson(Map<String, dynamic> json) =>
      _$CustomerFromJson(json);
}
```

Do not manually cast dynamic JSON throughout widgets.

---

# 80. API DTOs vs Domain Models

Where practical, distinguish between:

```text
API DTO
Domain Model
UI State
```

Do not allow raw API JSON maps to flow throughout the UI.

---

# 81. Null Safety

Dart null safety must remain enabled.

Avoid:

```dart
String value = data['value'];
```

without validation.

Prefer typed models.

---

# 82. `dynamic`

Avoid unnecessary `dynamic`.

If API data is dynamic:

```text
JSON
 ↓
Deserializer
 ↓
Typed Model
 ↓
Application
```

Do not keep dynamic maps around unnecessarily.

---

# 83. Widget Size

Widgets should remain focused.

If a screen becomes very large, extract:

```text
Header
Summary
ItemList
ItemCard
ActionBar
```

Do not create giant widget files containing the entire application workflow.

---

# 84. Reusable Forms

Customer form should be reusable for:

```text
Create Customer
Edit Customer
```

Product form:

```text
Create Product
Edit Product
```

Do not duplicate form widgets.

---

# 85. Quote Form Reuse

The quote form should support:

```text
Create
Edit Draft
```

through configuration/state rather than duplicate screens.

---

# 86. Invoice Form Reuse

Same principle:

```text
Create Invoice
Edit Draft Invoice
```

should use reusable components.

---

# 87. Accessibility

Support:

* Semantic labels
* Screen readers
* Sufficient contrast
* Touch targets
* Dynamic text where practical
* Keyboard navigation where applicable on tablets/web
* Clear focus/selection states

---

# 88. Keyboard Handling

Forms should handle:

* Keyboard opening
* Keyboard dismissal
* Scroll-to-focused-field
* Numeric keyboards for numeric fields
* Email keyboard for email fields

Example:

```text
Quantity → numeric keyboard
Price → numeric/decimal keyboard
Email → email keyboard
```

---

# 89. Form Navigation

Use appropriate keyboard actions:

```text
Next
Next
Next
Done
```

Avoid forcing users to manually close the keyboard between every field.

---

# 90. Confirmation Dialogs

Destructive actions:

```text
Delete Customer
Delete Product
Delete Draft Quote
Delete Draft Invoice
```

must require confirmation.

---

# 91. Toasts / Snackbars

Use short messages.

Example:

```text
Quote created successfully.
```

Avoid large blocking dialogs for ordinary success messages.

---

# 92. Error Messages

Use human-readable messages.

Bad:

```text
DioException [connection error]
```

Good:

```text
Unable to connect. Please try again.
```

---

# 93. Logging

Use structured application logging.

Development may log:

```text
API request
API response
Navigation
State transitions
```

Production logging must not expose:

```text
Passwords
Access tokens
Private secrets
Sensitive customer information unnecessarily
```

---

# 94. Crash Reporting

Integrate a crash/error monitoring platform such as Sentry for production.

Capture:

* Unhandled exceptions
* API failures where useful
* Crash information
* App version
* Device/platform information

Do not send unnecessary sensitive data.

---

# 95. Request ID

The mobile API client should support the backend's request ID mechanism.

Example:

```text
X-Request-ID
```

This allows:

```text
Mobile Error
      ↓
Request ID
      ↓
Backend Logs
      ↓
Sentry
```

to be correlated.

---

# 96. Environment Configuration

Support:

```text
Development
Staging
Production
```

API URLs must not be hardcoded throughout the application.

Example concept:

```text
API_BASE_URL
```

should be centrally configured.

---

# 97. Build Configuration

Production builds must not use:

```text
localhost
development API
debug logging
test credentials
```

---

# 98. Security

The mobile application must:

* Use HTTPS in production.
* Secure authentication credentials.
* Avoid logging secrets.
* Validate API responses.
* Handle authentication expiration.
* Avoid storing sensitive information unnecessarily.
* Use secure device storage.
* Avoid exposing API secrets in the application.

---

# 99. API Secrets

Never embed server-side secrets in Flutter.

Bad:

```text
DATABASE_PASSWORD
SENTRY_SERVER_SECRET
PRIVATE_STORAGE_KEY
```

The mobile application only receives credentials intended for the mobile client.

---

# 100. Certificate Pinning

Certificate pinning is not required for MVP V1 unless the security requirements justify it.

Do not add unnecessary complexity before launch.

---

# 101. Testing Strategy

Testing should include:

```text
Unit Tests
Widget Tests
Integration Tests
```

---

# 102. Unit Tests

Mandatory for:

* Formatting
* Validation
* State transitions
* Payment calculations used for UI
* Repository behavior
* Error mapping

---

# 103. Widget Tests

Test important reusable widgets:

```text
CustomerForm
ProductForm
QuoteItemForm
QuoteSummary
PaymentForm
StatusBadge
```

---

# 104. Integration Tests

The critical flow must be tested:

```text
Login
 ↓
Dashboard
 ↓
Create Customer
 ↓
Create Product
 ↓
Create Quote
 ↓
View Quote
 ↓
Convert Invoice
 ↓
Record Payment
 ↓
Paid
```

---

# 105. Test Naming

Good:

```text
shows validation error when customer name is empty
shows remaining balance after payment
redirects to login after session expiration
shows invoice as paid after full payment
```

Avoid:

```text
test1
test2
works
```

---

# 106. Mocking API

Unit/widget tests should mock repositories/API clients.

Do not require a live production backend for every widget test.

---

# 107. Integration Environment

Integration tests should use a controlled test backend/database or approved test environment.

Never run integration tests against production.

---

# 108. Git Standards

Use the same Git standards as the web application.

Examples:

```text
feat: add mobile customer list
feat: add quote creation
fix: handle expired authentication
test: add payment flow tests
refactor: extract quote repository
```

---

# 109. Branch Naming

Examples:

```text
feature/mobile-auth
feature/mobile-customers
feature/mobile-quotes
feature/mobile-invoices
fix/mobile-payment-validation
```

---

# 110. Pull Requests

Every mobile PR should contain:

```text
Summary
Screens changed
API changes
Testing performed
Screenshots/video where useful
Known limitations
```

---

# 111. CI Pipeline

GitHub Actions should run:

```text
Flutter format check
 ↓
Flutter analyze
 ↓
Unit tests
 ↓
Widget tests
 ↓
Build verification
```

Integration tests can run in a dedicated workflow.

---

# 112. Formatting

Use:

```text
dart format
```

Do not commit inconsistently formatted Dart code.

---

# 113. Static Analysis

Use:

```text
flutter analyze
```

Warnings and errors should be addressed.

Do not suppress analyzer warnings simply to make CI pass.

---

# 114. Dependency Rules

Before adding a Flutter package:

1. Check whether Flutter/Dart already provides the functionality.
2. Check package maintenance.
3. Check compatibility.
4. Check security.
5. Check package size/impact.
6. Confirm the package is necessary.

---

# 115. No Duplicate Packages

Do not use multiple packages for the same purpose.

Example:

```text
Package A → State Management
Package B → State Management
```

Choose one approved solution.

---

# 116. Deep Links

The application should be designed so deep-link support can be added later.

Examples:

```text
quote-builder://quotes/uuid
quote-builder://invoices/uuid
```

Full deep-link implementation is optional for V1 unless required.

---

# 117. Push Notifications

Push notifications are out of scope for MVP V1.

Future examples:

```text
Invoice overdue
Quote accepted
Payment received
```

These should be designed later.

---

# 118. WhatsApp Integration

Direct WhatsApp automation is out of scope for V1.

For V1:

```text
Generate PDF
     ↓
Native Share
     ↓
User chooses WhatsApp/email/etc.
```

This provides a simple and useful experience without requiring WhatsApp API integration.

---

# 119. Offline Mode

Do not implement full offline synchronization in V1.

If future offline mode is required, it should be designed as a separate architecture involving:

```text
Local Database
Sync Queue
Conflict Resolution
Server Reconciliation
```

Do not partially implement offline sync without a complete strategy.

---

# 120. Performance

Avoid:

* Excessive rebuilds
* Huge widget trees
* Large images
* Unnecessary API calls
* Unbounded lists
* Heavy animations

Use:

```text
ListView.builder
```

for long lists.

---

# 121. Memory

Dispose of:

* Controllers
* Focus nodes
* Streams
* Timers
* Animation controllers

where appropriate.

Riverpod lifecycle management should be used consistently.

---

# 122. Image Handling

Business logos should be:

* Resized appropriately
* Compressed where practical
* Validated
* Cached when useful

Avoid loading huge original images into memory unnecessarily.

---

# 123. PDF Handling

Do not generate complex financial PDFs directly in Flutter.

Backend remains responsible for authoritative PDF generation.

Flutter handles:

```text
Request PDF
Receive file/URL
Open
Share
```

---

# 124. Mobile Share

Use native platform sharing.

Example workflow:

```text
Quote
 ↓
PDF
 ↓
Share
 ↓
Native Share Sheet
```

This automatically supports installed apps.

---

# 125. App Lifecycle

Handle:

* App backgrounding
* App resume
* Authentication expiration
* Network changes where needed

Do not assume the application remains active indefinitely.

---

# 126. Session Expiration

If a session expires:

```text
API → 401
      ↓
Clear auth
      ↓
Redirect Login
```

Do not repeatedly retry unauthorized requests.

---

# 127. Error Recovery

Where possible, provide:

```text
Retry
Refresh
Back
Login
```

depending on the error.

Do not trap the user in an error screen.

---

# 128. UI Definition of Done

Every mobile screen is complete when:

```text
[ ] UI implemented
[ ] Responsive to supported screen sizes
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Error state implemented
[ ] Validation implemented
[ ] Accessibility considered
[ ] Navigation implemented
[ ] API integration completed
[ ] Tests added
[ ] No hardcoded API URLs
[ ] No sensitive data logged
```

---

# 129. Feature Definition of Done

For each feature:

```text
[ ] API contract understood
[ ] Models created
[ ] Repository created
[ ] Provider/state created
[ ] Screen created
[ ] Reusable widgets created
[ ] Error handling implemented
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Tests implemented
[ ] API integration verified
```

---

# 130. Production Release Checklist

Before releasing the mobile application:

```text
[ ] Production API configured
[ ] HTTPS verified
[ ] Authentication verified
[ ] Secure storage verified
[ ] Customers verified
[ ] Products verified
[ ] Quotes verified
[ ] Quote calculations verified
[ ] Quote PDF verified
[ ] Invoice conversion verified
[ ] Payments verified
[ ] Invoice PDF verified
[ ] Native sharing verified
[ ] Sentry/crash reporting configured
[ ] No debug logs
[ ] No test credentials
[ ] No localhost URLs
[ ] Flutter analyze passes
[ ] Tests pass
[ ] Release build succeeds
```

---

# 131. Claude Code Mobile Development Rules

Claude Code must:

1. Read the mobile and API documentation before implementation.
2. Inspect existing code before creating new files.
3. Reuse existing widgets.
4. Reuse existing providers.
5. Reuse existing repositories.
6. Never duplicate API logic.
7. Never put API calls directly into widgets.
8. Never put large business logic inside widgets.
9. Never hardcode API URLs.
10. Never store secrets in the app.
11. Never disable analyzer rules to hide problems.
12. Never bypass backend validation.
13. Never create an independent financial calculation system.
14. Add tests for important logic.
15. Run formatting.
16. Run static analysis.
17. Run relevant tests.
18. Avoid unrelated code changes.
19. Keep the implementation appropriate for MVP.
20. Document significant architectural changes.

---

# 132. Shared Backend Principle

Web and mobile must use the same backend:

```text
                 ┌───────────────┐
                 │ REST API      │
                 └───────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        ┌─────▼─────┐         ┌─────▼─────┐
        │ Next.js   │         │ Flutter   │
        │ Web       │         │ Mobile    │
        └───────────┘         └───────────┘
```

There must not be:

```text
Web Backend
+
Mobile Backend
```

for the same business functionality.

---

# 133. Shared Business Rules

The backend owns:

```text
Quote numbering
Invoice numbering
Tax calculations
Discount calculations
Payment validation
Payment status
Quote status
Invoice status
Quote conversion
Authorization
```

Both clients consume these rules.

---

# 134. Mobile vs Web Responsibilities

### Web

Optimized for:

* Desktop
* Keyboard/mouse
* Large tables
* Larger forms
* Business administration

### Mobile

Optimized for:

* Touch
* Quick actions
* One-handed usage
* Customer lookup
* Quote creation
* PDF sharing
* Payment recording

The functionality remains consistent while the UX differs.

---

# 135. Final Mobile Development Principle

The mobile application should feel like:

> **A fast business tool you can use from anywhere.**

It should not feel like a shrunken desktop application.

The MVP should prioritize:

```text
Open App
   ↓
Create Quote
   ↓
Share Quote
   ↓
Convert to Invoice
   ↓
Record Payment
```

Everything else is secondary.

---

## End of Mobile Development Standards — V1
