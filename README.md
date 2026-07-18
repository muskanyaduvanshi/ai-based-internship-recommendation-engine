# AI-Based Internship Recommendation Engine

A React + TypeScript + Vite single-page app that recommends internships to students using a hybrid
(content-based + collaborative) scoring engine, and uses the Google Gemini API for resume analysis,
an AI career coach, career-path generation, live internship search (Google Search grounding), and an
interactive "Day 1" internship simulator. Includes a separate recruiter portal for posting jobs and
managing applicants.

> **Note:** This is a frontend-only application — there is no backend server or database. All data
> (students, recruiters, jobs, applications, interactions) is persisted in the browser's **localStorage**,
> seeded once from `data/mockData.ts` on first launch. See "Data persistence" below.

## Prerequisites

- Node.js 18+ (Node 22 recommended)
- A Google Gemini API key: https://aistudio.google.com/app/apikey

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your real Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   The app runs at http://localhost:3000

## Build for Production

```bash
npm run build   # outputs to /dist
npm run preview # preview the production build locally
```

## Environment Variables

| Variable         | Required | Description                                                                 |
|------------------|----------|-------------------------------------------------------------------------------|
| `GEMINI_API_KEY` | Yes      | Your Google Gemini API key. Read from `.env.local` at build time by Vite and injected as `process.env.API_KEY` / `process.env.GEMINI_API_KEY` (see `vite.config.ts`). Without it, all AI features (resume analysis, AI coach, career paths, live search, simulator) will show a friendly "API Key not configured" message instead of crashing. |

`.env.local` is git-ignored (matches the `*.local` pattern in `.gitignore`) so your key won't be committed.

## Deployment

This is a static Vite app, so it can be deployed to any static host (Vercel, Netlify, Cloudflare Pages,
GitHub Pages, S3+CloudFront, etc.):

1. Set the `GEMINI_API_KEY` environment variable in your hosting provider's dashboard (build-time env var).
2. Build command: `npm run build`
3. Output/publish directory: `dist`

**Security note:** Because `GEMINI_API_KEY` is inlined into the client-side JS bundle at build time
(`vite.config.ts` uses `define` to replace `process.env.API_KEY`), the key is visible to anyone who
inspects the deployed site's JavaScript. For a public production deployment, proxy Gemini calls through
your own backend endpoint instead of calling the API directly from the browser, so the key never ships to
the client.

## Data persistence

All app data lives in the browser's `localStorage` (see `services/apiService.ts`), under these keys:
`pmis_students`, `pmis_recruiters`, `pmis_internships`, `pmis_jobs`, `pmis_applications`,
`pmis_interactions`, `pmis_initialized` (one-time seed flag), and `pmis_session` (who's logged in).

- **First launch in a browser:** localStorage is empty, so it's seeded once from `data/mockData.ts`.
- **Every launch after that:** data is read from localStorage only — `mockData.ts` is never consulted
  again, so newly registered students/recruiters, new jobs, and new applications are never overwritten.
- **Login sessions** are stored in `pmis_session` and restored automatically on page load/browser reopen.
  Logging out clears only this key — it never touches any stored account or data.
- Data is scoped per-browser (not shared across devices/browsers) and cleared if the user clears their
  browser's site data.

To reset the app back to the original demo data, clear localStorage for the site (e.g. DevTools →
Application → Local Storage → clear) or run `localStorage.clear()` in the browser console.

## Adding a real backend later 

`services/apiService.ts` centralizes every read/write behind the same function signatures a real backend
would use (`fetchStudents`, `createStudent`, `postJob`, `updateApplicationStatus`, etc.). To move to a real
Node/Express + database backend, replace the localStorage read/write calls in that file with real `fetch`
calls — the rest of the app (React components, recommendation engine, Gemini integration) will keep
working unchanged.

## Tech Stack

- React 19 + TypeScript, built with Vite 6
- Tailwind CSS (via CDN script in `index.html`)
- `@google/genai` (official Gemini SDK)
