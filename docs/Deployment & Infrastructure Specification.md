# Quote & Invoice Builder

## Deployment & Infrastructure Specification — MVP V1

**Document Version:** 1.0
**Status:** Recommended MVP Infrastructure
**Platforms:** Responsive Web + Android + iOS
**Repository:** GitHub
**CI/CD:** GitHub Actions
**Monitoring:** Sentry
**Database:** PostgreSQL

---

# 1. Purpose

This document defines the deployment, hosting, environment, CI/CD, monitoring, backup, and production infrastructure for the Quote & Invoice Builder MVP.

The primary goals are:

* Keep infrastructure simple.
* Keep initial cost low.
* Avoid unnecessary AWS complexity.
* Make deployment repeatable.
* Support web and mobile applications.
* Provide production monitoring.
* Protect customer and financial data.
* Make it easy to scale later.

---

# 2. MVP Infrastructure Principle

The MVP should follow:

> **Start simple, keep costs low, and introduce infrastructure complexity only when the product requires it.**

Do not begin with a large AWS architecture containing:

```text
ECS
EKS
Lambda
API Gateway
RDS
ElastiCache
SQS
CloudFront
WAF
Step Functions
```

unless there is an actual requirement.

---

# 3. Recommended MVP Architecture

Recommended initial architecture:

```text
                         ┌─────────────────┐
                         │    GitHub       │
                         │  Source Code    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ GitHub Actions  │
                         │ CI/CD           │
                         └───────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌────────────┐     ┌────────────┐
       │   Web      │     │  Backend   │     │  Database  │
       │  Next.js   │────▶│ REST API   │────▶│ PostgreSQL │
       └────────────┘     └────────────┘     └────────────┘
              │                  │
              │                  │
              ▼                  ▼
       ┌────────────┐     ┌────────────┐
       │ Web Users  │     │  Sentry    │
       └────────────┘     │ Monitoring │
                          └────────────┘

              Flutter Mobile
                    │
                    ▼
               REST API
```

---

# 4. Recommended Hosting Approach

For the first version, use managed services wherever possible.

Recommended categories:

### Web

A managed Next.js hosting platform such as:

* Vercel
* Cloudflare Pages where compatible
* Another managed Next.js host

### Backend

A simple managed container/server platform such as:

* Render
* Railway
* Fly.io
* Similar managed platform

### PostgreSQL

Use managed PostgreSQL:

* Neon
* Supabase
* Railway PostgreSQL
* Render PostgreSQL
* AWS RDS later if required

### Error Monitoring

Sentry.

---

# 5. Why Not AWS Initially?

AWS is an excellent long-term option, but the MVP does not need infrastructure complexity merely because the developer is familiar with AWS.

The initial application primarily requires:

```text
Web hosting
API hosting
PostgreSQL
File storage
Monitoring
CI/CD
```

These can be provided more simply.

AWS can become the production infrastructure when:

* Traffic increases.
* Enterprise requirements appear.
* Compliance requirements demand it.
* Advanced networking is required.
* Cost analysis favors AWS.
* The product needs additional AWS services.

---

# 6. Environment Strategy

Maintain:

```text
Development
Staging
Production
```

Architecture:

```text
Developer
   ↓
Development
   ↓
GitHub PR
   ↓
CI
   ↓
Staging
   ↓
QA
   ↓
Production
```

---

# 7. Development Environment

Local development should run:

```text
PostgreSQL
Backend
Web
Flutter
```

Example:

```text
Web:
http://localhost:3000

Backend:
http://localhost:8000

PostgreSQL:
localhost:5432
```

Exact ports can be changed if required.

---

# 8. Development Database

Developers should use a local PostgreSQL database or isolated development database.

Never point normal development work at production.

---

# 9. Staging Environment

Staging should be as similar to production as practical.

Example:

```text
staging.example.com
api-staging.example.com
```

Staging should use:

* Separate database
* Separate environment variables
* Separate storage
* Separate monitoring environment where practical

---

# 10. Production Environment

Production:

```text
app.example.com
api.example.com
```

Production must have:

* HTTPS
* Production database
* Production secrets
* Monitoring
* Backups
* Logging
* Error tracking

---

# 11. Environment Variables

Web:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL
SENTRY_DSN
```

Backend:

```text
DATABASE_URL
AUTH_SECRET
APP_URL
CORS_ORIGINS
SENTRY_DSN
STORAGE_ENDPOINT
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
```

Mobile:

```text
API_BASE_URL
```

The exact variables depend on the final implementation.

---

# 12. Secret Management

Never commit:

```text
.env
.env.local
.env.production
```

containing real secrets.

GitHub must never contain:

```text
Database passwords
API keys
Authentication secrets
Storage credentials
Private tokens
```

---

# 13. `.env.example`

Commit:

```text
.env.example
```

Example:

```text
DATABASE_URL=
AUTH_SECRET=
APP_URL=
CORS_ORIGINS=
SENTRY_DSN=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Values must be placeholders.

---

# 14. Web Deployment

The web application should be deployed automatically from GitHub.

Recommended flow:

```text
Git Push
   ↓
GitHub
   ↓
CI
   ↓
Build
   ↓
Deploy
```

---

# 15. Web Preview Deployments

Pull requests should ideally create preview deployments.

Example:

```text
feature/quote-creation
        ↓
Pull Request
        ↓
Preview URL
        ↓
QA
```

This is especially useful when UI is generated using Stitch/Lovable and then implemented by Claude Code.

---

# 16. Backend Deployment

Backend deployment should be automated.

Flow:

```text
GitHub
   ↓
CI
   ↓
Build
   ↓
Tests
   ↓
Deploy Backend
```

Do not deploy code that fails mandatory tests.

---

# 17. Backend Health Check

Expose:

```text
GET /health
```

Expected:

```json
{
  "status": "ok"
}
```

The health endpoint should not expose sensitive information.

---

# 18. Database Health

Do not expose detailed database connection information publicly.

The health system may internally verify:

```text
API process
Database connectivity
Required dependencies
```

but the public response should remain minimal.

---

# 19. PostgreSQL

Use PostgreSQL as the primary production database.

Requirements:

* Managed service
* Automated backups
* Encryption at rest where available
* TLS connections
* Restricted access
* Separate credentials per environment

---

# 20. Database Access

Production PostgreSQL should not be publicly accessible to everyone.

Prefer:

```text
Backend
   ↓
Private/secured database connection
   ↓
PostgreSQL
```

Only authorized infrastructure should connect.

---

# 21. Database Credentials

Use a dedicated database user for the application.

Do not use the PostgreSQL superuser for normal application queries.

---

# 22. Database Backups

Production must have automated backups.

Minimum objective:

```text
Daily backup
```

Prefer managed point-in-time recovery where affordable.

---

# 23. Backup Retention

Initial MVP recommendation:

```text
Daily backups
+
7–30 day retention
```

The exact retention period should be determined based on hosting cost and business requirements.

---

# 24. Backup Restoration

A backup is not considered reliable until restoration has been tested.

At least periodically:

```text
Backup
 ↓
Restore to temporary database
 ↓
Verify schema
 ↓
Verify data
```

---

# 25. Database Migrations

All schema changes must use Prisma migrations.

Example:

```text
prisma migrate dev
```

for development.

Production migrations must be applied in a controlled deployment process.

---

# 26. Migration Rules

Never:

* Manually change production tables without documentation.
* Delete production data through migration accidentally.
* Apply untested migrations directly to production.
* Rewrite old migrations after they have been deployed.

---

# 27. Production Migration Flow

```text
Developer
   ↓
Create Prisma Migration
   ↓
Local Test
   ↓
CI
   ↓
Staging
   ↓
QA
   ↓
Production
```

---

# 28. Migration Safety

Before a migration affecting existing data:

1. Understand affected records.
2. Test on a copy/staging database.
3. Determine whether data migration is required.
4. Verify backup availability.
5. Deploy carefully.

---

# 29. File Storage

Business logos and generated PDFs should not be stored permanently on the application server filesystem.

Use object storage.

Suitable options:

* Cloudflare R2
* AWS S3
* Supabase Storage
* Another S3-compatible storage provider

---

# 30. Object Storage Structure

Recommended:

```text
bucket/
├── businesses/
│   └── {businessId}/
│       └── logo/
│
├── quotes/
│   └── {quoteId}/
│       └── pdf/
│
└── invoices/
    └── {invoiceId}/
        └── pdf/
```

The exact structure may evolve.

---

# 31. File Naming

Do not use user-provided filenames directly as storage keys.

Prefer generated identifiers:

```text
businesses/{businessId}/logo/{uuid}.webp
```

or equivalent.

---

# 32. File Upload Security

Validate:

```text
File type
File size
File extension
Content type
```

Initial logo formats:

```text
PNG
JPEG
WEBP
```

---

# 33. PDF Storage

Generated PDFs should be associated with the relevant document.

Example:

```text
Quote
 └── PDF file

Invoice
 └── PDF file
```

The database should retain metadata where useful:

```text
fileId
storageKey
createdAt
```

---

# 34. PDF Access

Do not make private invoices publicly accessible through permanent public URLs.

Prefer:

```text
Authenticated request
       ↓
Backend authorization
       ↓
Temporary/signed URL
       ↓
PDF
```

or stream the file through an authorized endpoint.

---

# 35. PDF Regeneration

The application should support regenerating a PDF when business rules permit.

However, finalized financial documents should have clear versioning/audit considerations if they can change.

For MVP, avoid complex document versioning unless required.

---

# 36. Domain Configuration

Production should use a real domain.

Recommended:

```text
app.example.com
api.example.com
```

Staging:

```text
staging.example.com
api-staging.example.com
```

The exact domain is project-specific.

---

# 37. HTTPS

Production must use HTTPS.

Do not run production authentication or financial APIs over plain HTTP.

---

# 38. CORS

Backend CORS should allow only approved origins.

Example:

```text
Production:
https://app.example.com

Staging:
https://staging.example.com
```

Do not use:

```text
*
```

for production authenticated APIs unless there is a documented reason.

---

# 39. Mobile API Access

Flutter should communicate with:

```text
https://api.example.com
```

in production.

Never ship:

```text
http://localhost:8000
```

in a production build.

---

# 40. API Versioning

Use:

```text
/api/v1/
```

for MVP.

Example:

```text
/api/v1/customers
/api/v1/products
/api/v1/quotes
/api/v1/invoices
/api/v1/payments
```

This gives the API room to evolve.

---

# 41. API Compatibility

Avoid breaking existing clients.

Before changing an API:

```text
Backend
   ↓
Web
   ↓
Mobile
```

must all be considered.

---

# 42. Rate Limiting

Initial rate limiting should be applied to sensitive/expensive operations.

Examples:

```text
Login
Password reset
PDF generation
File upload
Expensive API operations
```

Do not implement unnecessarily complicated distributed rate limiting for MVP.

---

# 43. Authentication Security

Production authentication must use:

* HTTPS
* Secure cookies/tokens
* Strong secrets
* Expiration
* Proper logout handling
* Server-side authorization

---

# 44. Security Headers

Production web should configure appropriate security headers, such as:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Frame protections
Strict-Transport-Security
```

The exact policy should be tested against the application.

Do not blindly deploy an overly restrictive CSP that breaks the application.

---

# 45. Sentry

Sentry should be configured for:

```text
Web
Backend
Mobile
```

Capture:

* Unhandled exceptions
* Important API failures
* Mobile crashes
* Relevant performance information

---

# 46. Sentry Environments

Separate:

```text
development
staging
production
```

Do not mix development errors into the production project without environment tagging.

---

# 47. Sentry Data Privacy

Do not send:

```text
Passwords
Authentication tokens
Database credentials
Full sensitive documents
```

to Sentry.

Use scrubbing/redaction where necessary.

---

# 48. Application Logging

Backend logs should include:

```text
timestamp
level
requestId
route
method
status
duration
userId where appropriate
errorCode
```

---

# 49. Production Logs

Do not rely on local files as the only production logging mechanism.

Production logs should be available through the hosting platform or centralized logging service.

---

# 50. Request Correlation

Use a request ID.

Example:

```text
Mobile/Web
   │
   │ X-Request-ID
   ▼
Backend
   │
   ├── Application Logs
   │
   └── Sentry
```

This makes troubleshooting much easier.

---

# 51. Monitoring

At minimum monitor:

```text
API uptime
API error rate
Database availability
Application exceptions
PDF generation failures
Authentication failures
Payment failures
Mobile crashes
```

---

# 52. Health Monitoring

The application should periodically verify:

```text
GET /health
```

External uptime monitoring can be added using an inexpensive/free service.

---

# 53. Alerting

Alerts should be configured for meaningful failures.

Examples:

```text
High API error rate
Application crashes
Database unavailable
Repeated PDF failures
```

Avoid alerting on every minor warning.

---

# 54. GitHub Actions

GitHub Actions should handle CI.

Recommended workflows:

```text
.github/workflows/
├── web-ci.yml
├── backend-ci.yml
├── mobile-ci.yml
└── deploy.yml
```

The exact structure can be consolidated if simpler.

---

# 55. Web CI

Example pipeline:

```text
Checkout
 ↓
Install
 ↓
Lint
 ↓
Type Check
 ↓
Unit Tests
 ↓
Build
```

---

# 56. Backend CI

Example:

```text
Checkout
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
```

---

# 57. Mobile CI

Example:

```text
Checkout
 ↓
Flutter Setup
 ↓
Dependencies
 ↓
Format Check
 ↓
Analyze
 ↓
Unit Tests
 ↓
Widget Tests
 ↓
Build Verification
```

---

# 58. Pull Request Gate

A PR should not be merged if mandatory checks fail.

Minimum:

```text
Lint
Type Check
Tests
Build
```

---

# 59. Deployment Trigger

Recommended:

```text
Pull Request
    ↓
CI only

main
    ↓
CI
    ↓
Staging/Production deployment according to workflow
```

For MVP, production deployment can require manual approval.

---

# 60. Production Deployment Approval

Recommended:

```text
main
 ↓
CI
 ↓
Staging
 ↓
QA
 ↓
Manual Approval
 ↓
Production
```

This prevents accidental production releases.

---

# 61. Deployment Rollback

Every deployment platform should provide a way to return to the previous application version.

If deployment fails:

```text
Failed Release
      ↓
Stop
      ↓
Rollback
      ↓
Investigate
```

Do not repeatedly deploy broken builds.

---

# 62. Database Rollback

Application rollback and database rollback are different.

Example:

```text
App v2
Database v2
```

rolling back to:

```text
App v1
```

may not work if App v1 cannot understand Database v2.

Therefore database migrations should favor backward-compatible changes where practical.

---

# 63. Zero-Downtime Principle

For normal deployments:

```text
Old Version
     ↓
New Version
```

should not cause unnecessary downtime.

The exact implementation depends on the hosting provider.

---

# 64. Mobile Release Infrastructure

Flutter mobile builds should be automated as the project matures.

Minimum:

```text
GitHub
 ↓
CI
 ↓
Flutter Build
```

Later:

```text
GitHub
 ↓
CI/CD
 ↓
Google Play
Apple App Store
```

---

# 65. Android

Production Android builds should eventually generate:

```text
AAB
```

for Google Play.

Debug APKs should not be used as production releases.

---

# 66. iOS

Production iOS builds require:

* Apple Developer account
* Signing certificates
* Provisioning
* App Store configuration

These credentials must never be committed to GitHub.

---

# 67. Mobile Signing Secrets

Store signing credentials using:

* GitHub Actions secrets
* Secure CI/CD secret storage
* Platform-specific secure storage

Never commit:

```text
.keystore
.p12
.p8
provisioning profiles
private signing keys
```

unless securely encrypted and managed according to an explicit release process.

---

# 68. Mobile Environment Configuration

Recommended:

```text
Development API
Staging API
Production API
```

The release build must point to the correct environment.

---

# 69. App Versioning

Use:

```text
major.minor.patch+build
```

Example:

```text
1.0.0+1
1.0.1+2
```

The exact release strategy can evolve.

---

# 70. Mobile Crash Monitoring

Sentry should capture:

```text
Android crashes
iOS crashes
Unhandled Dart exceptions
Important API failures
```

Include app version/build information.

---

# 71. Cost Control

For MVP, prioritize:

```text
Managed PostgreSQL
Managed Web Hosting
Simple Backend Hosting
Object Storage
Sentry
GitHub
```

Avoid paying for infrastructure that is not being used.

---

# 72. Cost Monitoring

Track monthly infrastructure cost.

Initial categories:

```text
Web
Backend
Database
Storage
Monitoring
Domain
Mobile developer accounts
```

---

# 73. Infrastructure Scaling

Scale only when actual usage requires it.

Possible progression:

```text
MVP
 ↓
Managed Hosting
 ↓
More Traffic
 ↓
Larger Instance
 ↓
Database Optimization
 ↓
Caching
 ↓
CDN
 ↓
Advanced Infrastructure
```

Do not start at the end of this list.

---

# 74. Future AWS Migration

If the application eventually moves to AWS:

```text
Next.js
   ↓
CloudFront / Hosting

Backend
   ↓
ECS / App Runner / Lambda depending on architecture

PostgreSQL
   ↓
RDS

Files
   ↓
S3

Monitoring
   ↓
CloudWatch + Sentry
```

The current architecture should not prevent this migration.

---

# 75. Disaster Recovery

MVP disaster recovery should include:

```text
Database backups
Source code in GitHub
Infrastructure configuration
Environment configuration documentation
Object storage backups/retention
```

---

# 76. Recovery Priority

If a major failure occurs:

```text
1. Database
2. Backend API
3. File storage
4. Web application
5. Mobile release
```

The database and API are the highest priority because both clients depend on them.

---

# 77. Disaster Recovery Test

Periodically test:

```text
Can database be restored?
Can backend be redeployed?
Can web be redeployed?
Can environment variables be recreated?
Can stored files be accessed?
```

---

# 78. Production Access

Production access should be limited.

Do not share:

```text
Production database password
Production server credentials
Production API secrets
```

through normal chat messages or source code.

Use a password/secret manager.

---

# 79. Developer Access

Developers should have only the access they need.

Example:

```text
Developer
 ↓
Development

Senior/Lead
 ↓
Development + Staging

Production
 ↓
Restricted
```

---

# 80. Production Data

Never copy real production customer/invoice/payment data into local development unless there is an approved, sanitized process.

Prefer synthetic data.

---

# 81. Data Privacy

Customer information may include:

```text
Name
Email
Phone
Address
Tax information
Invoice information
Payment information
```

Treat this as sensitive business data.

Collect only what is required.

---

# 82. Data Deletion

The application should eventually provide an appropriate data deletion strategy.

For MVP, deletion rules must follow the business requirements.

Do not physically delete financial records if doing so would break accounting/document integrity.

Use archival/soft deletion where appropriate.

---

# 83. Production Database Access

Normal application users should never directly access PostgreSQL.

The flow is:

```text
Web
 ↓
Backend
 ↓
Database
```

and:

```text
Mobile
 ↓
Backend
 ↓
Database
```

---

# 84. No Direct Mobile Database Access

Flutter must never connect directly to PostgreSQL.

Bad:

```text
Flutter
 ↓
PostgreSQL
```

Correct:

```text
Flutter
 ↓
REST API
 ↓
PostgreSQL
```

---

# 85. No Direct Web Database Access

The browser must not connect directly to PostgreSQL.

Correct:

```text
Browser
 ↓
Next.js/API
 ↓
PostgreSQL
```

---

# 86. Production Architecture

Final MVP production architecture:

```text
                         Internet
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      ┌─────────────┐               ┌─────────────┐
      │ Next.js Web │               │ Flutter App │
      └──────┬──────┘               └──────┬──────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                    ┌───────────────┐
                    │ REST API      │
                    │ Backend       │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ PostgreSQL │ │  Storage   │ │  Sentry    │
       └────────────┘ └────────────┘ └────────────┘
```

---

# 87. Minimum Production Infrastructure

The MVP does not require more than:

```text
1 × Web Hosting
1 × Backend Hosting
1 × PostgreSQL
1 × Object Storage
1 × Monitoring
1 × Domain
1 × GitHub Repository
```

This is the preferred starting point.

---

# 88. Production Launch Checklist

## Application

```text
[ ] Web deployed
[ ] API deployed
[ ] Mobile production build created
[ ] Production API URL configured
```

## Database

```text
[ ] Production database created
[ ] Migrations applied
[ ] Indexes verified
[ ] Backups enabled
[ ] Restore procedure tested
```

## Security

```text
[ ] HTTPS enabled
[ ] CORS configured
[ ] Authentication verified
[ ] Authorization verified
[ ] Secrets secured
[ ] File uploads secured
[ ] Security headers configured
```

## Monitoring

```text
[ ] Sentry web configured
[ ] Sentry backend configured
[ ] Sentry mobile configured
[ ] Health monitoring configured
[ ] Logs available
```

## CI/CD

```text
[ ] GitHub Actions working
[ ] PR checks working
[ ] Staging deployment working
[ ] Production deployment working
[ ] Rollback process documented
```

---

# 89. Post-Launch Smoke Test

Immediately after production deployment:

```text
1. Open web application
2. Register/login
3. Create business profile
4. Create customer
5. Create product
6. Create quote
7. Verify total
8. Generate quote PDF
9. Convert quote to invoice
10. Record partial payment
11. Record final payment
12. Verify Paid
13. Open invoice PDF
14. Test mobile login
15. Test mobile quote creation
```

---

# 90. Final Infrastructure Principle

The infrastructure should follow:

> **Simple first, secure by default, observable in production, and ready to scale when the business actually needs it.**

Do not let infrastructure become more complicated than the product.

---

## End of Deployment & Infrastructure Specification — V1
