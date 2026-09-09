# dages-services

Lead-capture funnel for Dage's Services, built to grow into a lead-pipeline dashboard for Joe without a rewrite.

## Stack

- Vite + React
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- Netlify Functions
- React Router

React Router is pre-wired now so later `/dashboard` or `/admin` routes can attach without restructuring the app.

## Routes

- `/` — landing page
- `/thank-you` — post-submit confirmation

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` when the Supabase project is ready.

## Build

```bash
npm run build
```

Netlify uses `dist` as the publish directory and `netlify/functions` for serverless functions.
