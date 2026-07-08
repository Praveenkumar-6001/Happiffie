# Environment and Prisma Database Setup

This guide explains how to configure the backend `.env` file and generate Prisma for a new PostgreSQL database.

## 1. Create the `.env` file

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## 2. Configure required environment variables

Open `.env` and update these values first:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happiffie
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/happiffie

JWT_SECRET=replace-with-at-least-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

For local development, `DATABASE_URL` and `DIRECT_URL` can be the same PostgreSQL URL.

For Supabase, use:

```env
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://...supabase.co:5432/postgres
```

`DATABASE_URL` is used by the running app. `DIRECT_URL` is used by Prisma migrations.

## 3. Create a new PostgreSQL database

Login to PostgreSQL:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE happiffie;
```

Exit:

```sql
\q
```

Your `.env` should match your PostgreSQL username, password, host, port, and database name:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happiffie
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/happiffie
```

## 4. Install dependencies

```bash
npm install
```

## 5. Validate the Prisma schema

```bash
npx prisma validate
```

Expected result:

```text
The schema at prisma/schema.prisma is valid
```

## 6. Generate Prisma Client

```bash
npm run prisma:generate
```

Or directly:

```bash
npx prisma generate
```

This generates the Prisma client used by the backend to query the database.

## 7. Run the first migration

```bash
npm run prisma:migrate
```

Or directly:

```bash
npx prisma migrate dev --name init
```

This creates the database tables from `prisma/schema.prisma`.

## 8. Open Prisma Studio

Optional, but useful for checking tables and records:

```bash
npx prisma studio
```

Default Prisma Studio URL:

```text
http://localhost:5555
```

## 9. Start the backend

```bash
npm run start:dev
```

Swagger API documentation:

```text
http://localhost:3000/api-docs
```

Backend API base URL:

```text
http://localhost:3000/api/v1
```

## Common Issues

### Environment variable not found: DATABASE_URL

Make sure `.env` exists in the project root:

```text
D:\happiffie\Happiffie\.env
```

Also confirm it contains:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happiffie
```

If Prisma reports `DIRECT_URL` missing, add:

```env
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/happiffie
```

### Supabase migration takes too long

Do not run Prisma migrations through the Supabase transaction pooler URL on port `6543`.

Use the pooler URL for `DATABASE_URL`, but use the direct or session connection URL for `DIRECT_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

Then run:

```bash
npx prisma migrate dev --name init
```

### Database does not exist

Create it manually:

```sql
CREATE DATABASE happiffie;
```

### Authentication failed

Check the username and password in `DATABASE_URL`.

### Port already in use

Change the backend port:

```env
PORT=3001
```

Then restart:

```bash
npm run start:dev
```
