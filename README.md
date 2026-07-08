# Happiffie Backend

Happiffie is an AI-powered celebration marketplace backend for planning weddings, birthdays, engagements, corporate events, baby showers, and receptions. The backend captures customer requirements, ranks matching vendors, sends invitations, supports vendor responses, creates bookings, and collects reviews.

## Current Progress

- Reviewed the product engineering assessment PDF and mapped the requested product modules into backend APIs.
- Added a NestJS backend scaffold with modular feature folders.
- Added Swagger/OpenAPI setup at `/api-docs`.
- Added request/response DTOs with validation and Swagger examples.
- Added customer requirement APIs.
- Added vendor profile/search APIs.
- Added weighted AI matching logic using the assessment factors:
  service/theme match, budget, location, rating, experience, availability, and response rate.
- Added AI module endpoints for free-text requirement extraction and recommendation explanation.
- Added invitation, booking, review, user, and admin dashboard APIs.
- Added a Prisma PostgreSQL schema for the core database models.
- Added `.env.example` with backend, database, cache, JWT, AI, payment, storage, and notification configuration placeholders.

## Tech Stack

- NestJS
- TypeScript
- Swagger/OpenAPI via `@nestjs/swagger`
- Prisma schema for PostgreSQL
- Redis, OpenAI, Razorpay, AWS S3, and Firebase placeholders for later integration

## Project Structure

```text
src/
  common/
  modules/
    admin/
    ai/
    auth/
    bookings/
    invitations/
    matching/
    requirements/
    reviews/
    users/
    vendors/
prisma/
  schema.prisma
docs/
  api-document.md
```

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

The API runs with the global prefix from `API_PREFIX`, defaulting to:

```text
http://localhost:3000/api/v1
```

Swagger documentation:

```text
http://localhost:3000/api-docs
```

## Main API Areas

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/otp/verify`
- `POST /api/v1/ai/requirements/analyze`
- `POST /api/v1/ai/matches/explain`
- `GET /api/v1/vendors`
- `POST /api/v1/vendors`
- `GET /api/v1/requirements`
- `POST /api/v1/requirements`
- `GET /api/v1/matching/requirements/:requirementId/vendors`
- `POST /api/v1/matching/requirements/:requirementId/run`
- `POST /api/v1/invitations`
- `PATCH /api/v1/invitations/:id/respond`
- `POST /api/v1/bookings`
- `PATCH /api/v1/bookings/:id/confirm-payment`
- `POST /api/v1/reviews`
- `GET /api/v1/admin/dashboard`

## Database

The Prisma schema includes:

- `User`
- `Vendor`
- `VendorProfile`
- `Requirement`
- `Match`
- `Invitation`
- `Response`
- `Booking`
- `Review`
- `VendorAvailability`
- `Portfolio`

Run Prisma after configuring `DATABASE_URL`:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Detailed environment and Prisma setup steps are available in [docs/env-and-prisma-setup.md](docs/env-and-prisma-setup.md).

Seed demo data:

```bash
npm run db:seed
```

Full flow testing notes are available in [docs/testing-full-flow.md](docs/testing-full-flow.md).

## Notes

The current services use an in-memory sample store so the API documentation and matching flow can run before database integration. The Prisma schema is ready for the next step: replacing the sample store with real repositories and migrations.

The AI module currently uses local deterministic extraction and explanation logic, so it works without an API key. `OPENAI_API_KEY` is already present in `.env.example` for replacing the local implementation with an OpenAI call later.
