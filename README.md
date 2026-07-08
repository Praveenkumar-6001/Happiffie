# Happiffie Frontend

React frontend for the Happiffie AI celebration marketplace.

## Features

- Login/register screen with stored JWT session and role.
- Vendor registration collects business profile, services, cities, pricing, and availability.
- Role-based redirect after login:
  - Customer opens customer planning panel.
  - Vendor opens vendor operations panel.
  - Admin opens admin monitoring panel.
- Role-based panels for customer, vendor, and admin workflows.
- Customer event requirement capture with AI text extraction.
- Vendor recommendation view integrated with the backend matching API.
- Invitation sending and vendor accept/reject flow.
- Customer booking, billing, payment confirmation, and review flow.
- Admin dashboard for customers, vendors, reachout procedure, requirements, bookings, billing, payments, reviews, and AI acceptance metrics.

## Setup

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

API base URL is configured in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

Run the backend first from:

```text
D:\happiffie\Happiffie
```

Backend Swagger:

```text
http://localhost:3001/api-docs
```

Frontend dev server:

```text
http://localhost:5173
```

## Demo Login

Use any password with the current mock backend.

```text
Customer: ananya.customer@happiffie.test
Vendor:   temple.bloom@happiffie.test
Admin:    admin@happiffie.test
```

The frontend stores the session in `localStorage` under:

```text
happiffie_session
```

Logout clears the stored session.
