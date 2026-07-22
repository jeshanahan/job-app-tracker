# Job Application Tracker

Track job applications, interviews, contacts, follow-ups, and resumes.

## Stack

- Next.js (App Router)
- Prisma + PostgreSQL
- Auth.js (email/password + optional GitHub OAuth)
- Local file uploads (or Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env vars:

```bash
cp .env.example .env
```

Fill in at least:

- `DATABASE_URL`
- `AUTH_SECRET` (`npx auth secret`)

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Register / login (credentials + optional GitHub)
- Applications CRUD with status pipeline
- Search/filter by company, role, status, date
- Contacts, interviews, and follow-ups on each application
- Dashboard stats
- Follow-up calendar
- Resume/cover letter uploads and linking
- Daily cron stub at `/api/cron/reminders` (configure `CRON_SECRET` in production)

## Useful routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Stats overview |
| `/applications` | List + filters |
| `/applications/new` | Create |
| `/applications/[id]` | Edit, status, nested data |
| `/calendar` | Follow-ups by month |
| `/documents` | Upload library |

## Deploy notes

- Host on Vercel + Neon Postgres
- Set the same env vars in the Vercel project
- `vercel.json` schedules daily reminder cron at 08:00 UTC
- For Blob uploads in production, add `BLOB_READ_WRITE_TOKEN`
