# JobTrack AI

**Track every job application on a kanban board and let AI do the repetitive work.**
Analyze job descriptions, score your match, write tailored cover letters and prepare for interviews.

[Live demo](https://jobtrackai-rho.vercel.app/)

---

## Overview

JobTrack AI is a full-stack web app for managing a job search. Applications live on a drag-and-drop board (Wishlist → Applied → Interview → Offer → Rejected). Paste a job description into any card and the AI extracts the key details, scores how well it matches your profile, drafts a cover letter and generates interview questions.

The browser never talks to the database or the AI provider directly. Every request goes through an authenticated API layer that verifies the user, validates input and enforces usage limits.

## Features

**Job tracking**
- Kanban board with drag-and-drop status changes and optimistic updates (rolls back if the server rejects the change)
- Slide-over drawer to add and edit applications: company, role, location, link, status, skills, notes
- Search by company, role or skill, with a `⌘K` / `Ctrl+K` shortcut
- Stats cards and an **Insights** page: pipeline funnel, average match score, most requested skills
- Skeleton loaders, empty states, toasts

**AI assistant (Google Gemini)**
- **Analyze job:** extracts company, role, location and key skills, then returns a match score, reasons and skill gaps based on your profile
- **Cover letter:** a short, tailored letter you can copy in one click
- **Interview prep:** six role-specific questions with answer tips

**Accounts and access**
- Email/password and Google sign-in (Firebase Authentication)
- Per-user data isolation in Firestore
- Bring your own Gemini API key (optional) so heavy users are not limited by the shared quota
- Free daily AI quota for users without a key, stored in Firestore
- Admin role with unlimited AI use

**UI and UX**
- Clean SaaS-style layout with sidebar navigation, responsive down to mobile
- Light and dark theme driven by design tokens (no flash on load)
- Accessible dialogs, labels, keyboard support and focus states

## Tech stack

| Framework - Next.js 14 (App Router, Route Handlers), React 18 |
| Styling - Tailwind CSS, CSS variable design tokens, Framer Motion, lucide-react |
| Drag and drop - @hello-pangea/dnd |
| Auth - Firebase Authentication (client SDK) + ID token verification (firebase-admin) |
| Database - Cloud Firestore, accessed only from the server |
| AI - Google Gemini API (REST) with retry and model fallback |
| Validation - Zod |
| Language - JavaScript |

## Architecture

```
Browser (React)
   │  Authorization: Bearer <Firebase ID token>
   │  x-gemini-key: <optional user key>
   ▼
Next.js API routes ──► verify token (firebase-admin)
   │                   validate input (Zod)
   │                   rate limit + daily quota
   ├──► Firestore   users/{uid}/applications, users/{uid}.profile
   └──► Gemini      retry on 429/500/503, fall back to a lighter model
```

Key design decisions:
- **Server-only database access.** `firestore.rules` denies all direct client reads and writes. All data goes through the API, which scopes every query to the verified `uid`.
- **Secrets stay on the server.** The Firebase admin credentials and the shared Gemini key are never sent to the browser.
- **Resilient AI calls.** Requests retry on busy or rate-limited responses and fall back to a secondary model. Failed calls refund the user's daily quota.
- **Optimistic UI.** Moves and edits update instantly and roll back on failure.

## API reference

All routes require a valid Firebase ID token in the `Authorization` header.

| Method | Route | Description |

| `GET` | `/api/applications` | List the signed-in user's applications |
| `POST` | `/api/applications` | Create an application |
| `PATCH` | `/api/applications/:id` | Update fields (for example `status`) |
| `DELETE` | `/api/applications/:id` | Delete an application |
| `GET` | `/api/profile` | Get profile (skills and summary used by the AI) |
| `PUT` | `/api/profile` | Save profile |
| `POST` | `/api/ai` | Run `analyze`, `coverLetter` or `interviewPrep` |

## Getting started

### Prerequisites
- Node.js 18.17 or newer
- A Google account (for Firebase and a free Gemini key)

### 1. Clone and install

```bash
git clone https://github.com/srinivasa36/jobtrack-ai.git
cd jobtrack-ai
npm install
```

### 2. Set up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (the free Spark plan is enough).
2. **Authentication → Get started:** enable **Email/Password** and **Google**.
3. **Firestore Database → Create database:** choose a location and **Production mode**. Then open the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules) and publish.
4. **Project settings → General → Your apps:** add a **Web app** and copy its config values.
5. **Project settings → Service accounts → Generate new private key:** download the JSON file. Keep it private and never commit it.

### 3. Get a Gemini API key

Create a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 4. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |

| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web config |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Yes* | Whole service-account JSON, base64-encoded (most reliable) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Yes* | Alternative to the base64 variable |
| `GEMINI_API_KEY` | Yes | Shared key used for users without their own |
| `GEMINI_MODEL` | No | Default `gemini-flash-latest` |
| `GEMINI_FALLBACK_MODELS` | No | Comma-separated fallbacks, default `gemini-flash-lite-latest` |
| `DAILY_SHARED_AI_LIMIT` | No | AI actions per user per day on the shared key, default `5` |
| `ADMIN_UIDS` | No | Comma-separated Firebase UIDs with unlimited AI use |

\* Provide either the base64 variable or the three separate variables.

To create the base64 value:

```bash
# macOS
base64 -i service-account.json | pbcopy
# Linux
base64 -w0 service-account.json
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json")) | Set-Clipboard
```

### 5. Run

```bash
npm run dev
```

Open (http://localhost:3000), create an account, add your skills under **My profile**, then add your first application and paste a job description.

## Deployment (Vercel)

1. Push the repository to GitHub and import it in [Vercel](https://vercel.com).
2. Add every environment variable from the table above.
3. Deploy, then add your Vercel domain in **Firebase → Authentication → Settings → Authorized domains** so Google sign-in works.

## Project structure

```
app/
  api/
    ai/route.js               AI actions, quota, admin and BYOK logic
    applications/route.js     list + create
    applications/[id]/route.js  update + delete
    profile/route.js          get + save profile
  login/page.js               sign in / sign up
  page.js                     dashboard (board and insights)
  layout.js, globals.css      root layout, theme tokens
components/                   AppShell, Board, ApplicationCard, ApplicationDrawer,
                              Insights, StatsBar, ProfileModal, ui primitives
context/AuthContext.jsx       Firebase auth state
hooks/                        useApplications (optimistic updates), useTheme
lib/
  api.js, firebase.js         client helpers
  aiKey.js, constants.js, utils.js
  server/                     firebaseAdmin, http (auth middleware), schemas (Zod),
                              ai (Gemini client), admin
firestore.rules               deny all direct client access
```

## Security notes

- Every API route verifies the Firebase ID token and uses the verified `uid`, never an ID sent by the client.
- Firestore rules block direct browser access; only the server (admin SDK) reads and writes data.
- All input is validated with Zod; AI requests are rate-limited per user.
- A user's own Gemini key is stored only in their browser, sent over HTTPS with each AI request and never stored or logged by the server.
- Admins are identified by Firebase UID (`ADMIN_UIDS`), which cannot be spoofed or self-registered.
- Never commit `.env.local` or the service-account JSON.

## Known limitations

- Card order inside a column is not saved; only moves between columns are persisted.
- The per-minute rate limiter is in memory, so it is best-effort on serverless hosting. The daily quota is stored in Firestore and is reliable.
- Gemini free-tier limits apply to the shared key. Heavy usage may need a paid plan.
- A user's own key lives in browser storage. A production system could encrypt and store keys on the server instead.

## Roadmap

- [ ] Persist card order within columns
- [ ] Follow-up reminders and due dates
- [ ] Import a job from a URL
- [ ] Admin dashboard with usage stats
- [ ] Export applications to CSV
- [ ] Unit and end-to-end tests


## Author

**Srinivas A**, front-end developer based in Bengaluru.
