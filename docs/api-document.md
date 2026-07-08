# Happiffie API Document

Swagger UI is configured at:

```text
GET /api-docs
```

The OpenAPI document is generated from NestJS decorators in the controllers and DTOs. Bearer authentication is enabled in Swagger for secured endpoints.

## Product Flow Covered

```text
Customer creates requirement
Requirement is stored
AI extracts preferences from free text when needed
Matching engine ranks vendors
AI explains recommendation reasons
Top vendors receive invitations
Vendor accepts or rejects invitation
Customer books accepted vendor
Payment confirms booking
Customer reviews vendor
Admin monitors platform health
```

## Auth

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Register customer, vendor, or admin |
| POST | `/api/v1/auth/login` | Email/password login |
| POST | `/api/v1/auth/otp/verify` | OTP login |

## Users

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/users/me` | Current user profile |
| GET | `/api/v1/users/:id` | User by id |

## AI

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/ai/requirements/analyze` | Extract event type, city, budget, guest count, theme, date, and suggested services from free text |
| POST | `/api/v1/ai/matches/explain` | Explain why a vendor is recommended for a requirement |

Example requirement analysis payload:

```json
{
  "text": "Need a traditional South Indian wedding in Chennai for 500 guests on 2026-08-15. Budget is 500000. Prefer temple theme decor."
}
```

Example extracted response:

```json
{
  "eventType": "wedding",
  "city": "chennai",
  "budget": 500000,
  "guestCount": 500,
  "theme": "traditional south indian temple theme",
  "eventDate": "2026-08-15",
  "suggestedServices": ["event_planner", "decorator", "photographer", "makeup_artist", "flower_designer"]
}
```

## Vendors

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/vendors` | Search vendors by city, service, and max price |
| POST | `/api/v1/vendors` | Create vendor profile |
| GET | `/api/v1/vendors/:id` | Vendor details |
| PATCH | `/api/v1/vendors/:id/status` | Admin vendor moderation |

## Requirements

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/requirements` | List customer requirements |
| POST | `/api/v1/requirements` | Create event requirement |
| GET | `/api/v1/requirements/:id` | Requirement details |
| PATCH | `/api/v1/requirements/:id` | Update requirement |

## Matching

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/matching/requirements/:requirementId/vendors` | Preview ranked vendors |
| POST | `/api/v1/matching/requirements/:requirementId/run` | Run matching flow |

The matching API now uses the AI module to generate recommendation reasons from the strongest matching signals.

Weighted score:

| Factor | Weight |
| --- | ---: |
| Service/theme match | 30% |
| Budget match | 20% |
| Location match | 15% |
| Rating | 10% |
| Experience | 10% |
| Availability | 10% |
| Response rate | 5% |

## Invitations

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/invitations` | List invitations |
| POST | `/api/v1/invitations` | Send invitation |
| PATCH | `/api/v1/invitations/:id/viewed` | Mark viewed |
| PATCH | `/api/v1/invitations/:id/respond` | Accept or reject invitation |

## Bookings

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/bookings` | List bookings |
| POST | `/api/v1/bookings` | Create booking |
| PATCH | `/api/v1/bookings/:id/confirm-payment` | Confirm payment |
| PATCH | `/api/v1/bookings/:id/complete` | Complete booking |

## Reviews

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/reviews/vendors/:vendorId` | Vendor reviews |
| POST | `/api/v1/reviews` | Create review |

## Admin

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/admin/dashboard` | Platform metrics and AI matching summary |
