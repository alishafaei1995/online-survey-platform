# Online Survey Platform

A full-stack, bilingual (Persian/English) survey and assessment platform built with the MERN stack. Beyond basic form-building, it includes a pluggable psychometric assessment engine (DISC, 9-Box), a lightweight 360°-style rater/participant invitation system, role-based team management, and a Docker-based production deployment pipeline with an offline update mechanism.

## Highlights

- **No-code survey builder** — 7 question types (single/multiple choice, Likert, text, numeric, date, matrix), drag-and-drop reordering, conditional show/hide logic, per-question validation rules, survey duplication, and start/end scheduling.
- **Bilingual & RTL-first** — every piece of content (titles, questions, options, messages) is stored as `{ fa, en }`; the UI fully mirrors for Arabic-script layout via `react-i18next` and a Jalali (Persian) date picker for date fields.
- **Pluggable assessment engine** — survey "models" (currently DISC and a 9-Box talent grid) are config-driven item banks with scoring rules (weighted/reverse-scored dimensions) and derived-result logic (e.g. dominant style, performance/potential quadrant), instantiated into editable survey drafts from a single template picker.
- **360°-style participant invitations** — for rater-based models, admins maintain a participant directory and generate per-person invite links (subject + rater + relationship), tracked through to completion — alongside standard anonymous link/QR distribution for regular surveys.
- **Analytics dashboard** — participation & completion rates, per-question frequency/matrix/numeric breakdowns, date-range filtering, and CSV/Excel export (including computed assessment scores).
- **Respondent integrity controls** — duplicate-submission prevention via signed respondent tokens, IP-hash-based rate limiting, anonymous-response toggle.
- **Role-based team management** — admin vs. member roles, capped active-user roster, self-protection guards (can't deactivate/delete yourself or the admin), per-user survey ownership scoping.
- **Production-ready deployment** — multi-stage Dockerfile (static frontend build served by the API in production), Docker Compose stack (app + MongoDB), hardened container config (non-root user, read-only filesystem, dropped Linux capabilities, resource limits), plus a scripted offline update/rollback workflow for air-gapped environments.

## Tech Stack

**Frontend:** React 19 · Vite · Tailwind CSS v4 · react-i18next · react-router-dom · recharts · react-hook-form + zod · @dnd-kit

**Backend:** Node.js · Express · MongoDB (Mongoose) · JWT auth · bcrypt · ExcelJS · json2csv · qrcode

**Infra:** Docker / Docker Compose · PowerShell deployment & update scripts

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend
```bash
cd server
npm install
copy .env.example .env   # edit MONGODB_URI, JWT_SECRET, etc.
npm run seed              # creates the initial admin user
npm run dev                # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev                # http://localhost:5173 (proxies /api to the backend)
```

Open `http://localhost:5173` and sign in with the seeded admin credentials.

### Docker (production-style, single command)
```bash
cp .env.production.example .env   # set JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
docker compose up -d --build
```
This builds the frontend, serves it directly from the Express API, and runs MongoDB as a sibling container — no separate web server or Node install required on the host.

## Environment Variables (`server/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` (production also enables serving the built frontend) |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret — change this in production |
| `CLIENT_URL` | Frontend origin (used for CORS and share links) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seeded admin account, created by `npm run seed` |

## Project Structure

```
server/   Express API + MongoDB (Mongoose models, controllers, routes, services)
client/   React (Vite) + Tailwind CSS, i18next (fa/en, RTL-aware)
scripts/  Deployment helpers: build an update package, apply it, start in production mode
```

## License

MIT
