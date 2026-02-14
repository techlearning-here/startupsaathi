# LaunchMitra / Lean MVP — Frontend (Next.js)

Next.js 14 App Router app for the Lean MVP. Deploy to **Vercel**.

## Setup

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # Edit with Supabase and API URL
```

## Run locally

```bash
pnpm dev
```

- App: http://localhost:3000
- Set `NEXT_PUBLIC_API_URL=http://localhost:8000` to talk to local backend.

## Build

```bash
pnpm build
pnpm start
```

## Project layout

- `src/app/` — App Router: landing, login, dashboard, profile
- `src/lib/supabase/` — Supabase client (auth, optional RLS)
- `src/components/` — Add shared UI (header, forms) here

See `docs/lean_mvp/` for feature list and TDD flow.
