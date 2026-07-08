# Full Flow Testing Guide

This document records the demo data and the tested Happiffie backend flow.

## Seed Demo Data

Run:

```bash
npm run prisma:generate
npm run db:seed
```

Seeded database records:

| Type | ID | Email |
| --- | --- | --- |
| Customer | `seed_customer_ananya` | `ananya.customer@happiffie.test` |
| Vendor | `seed_vendor_temple_bloom` | `temple.bloom@happiffie.test` |
| Vendor | `seed_vendor_golden_hour` | `golden.hour@happiffie.test` |
| Requirement | `seed_requirement_wedding_chennai` | `ananya.customer@happiffie.test` |
| Booking | `seed_booking_temple_bloom` | `ananya.customer@happiffie.test` |

Seeded flow:

```text
Customer -> Requirement -> AI Match -> Invitation -> Vendor Response -> Booking -> Review
```

## Verified API Flow

Backend URL:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/api-docs
```

Tested endpoints:

```text
POST  /api/v1/ai/requirements/analyze
POST  /api/v1/requirements
GET   /api/v1/matching/requirements/:requirementId/vendors
POST  /api/v1/invitations
PATCH /api/v1/invitations/:id/respond
POST  /api/v1/bookings
PATCH /api/v1/bookings/:id/confirm-payment
PATCH /api/v1/bookings/:id/complete
POST  /api/v1/reviews
```

Latest smoke test result:

```json
{
  "topVendorId": "ven_decor_1",
  "topScore": 99.4,
  "invitationStatus": "accepted",
  "paymentStatus": "paid",
  "bookingStatus": "completed"
}
```

## Frontend Check

Frontend URL:

```text
http://localhost:5173
```

Use the role buttons:

- `Customer`: Analyze requirement, save event, view recommended vendors, send invitation.
- `Vendor`: Accept or reject invitation.
- `Admin`: View marketplace metrics and update booking states.

## Important Note

The database has seeded records for checking in PostgreSQL/Supabase. The current backend API still uses the in-memory sample store for runtime API responses. The next backend step is replacing the sample store with Prisma-backed repositories so frontend-created data persists directly to the database.
