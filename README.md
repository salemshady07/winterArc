# PullUp Reminder

Remember your reps. Keep going.

A fullstack rep-tracking app: add people, switch between them, adjust
remaining pull-up reps in steps of ±3, and per-person rep history — all
persisted in PostgreSQL so nothing is lost on refresh. Ships with six
instantly-switchable UI themes (Volt, Daybreak, Abyss, Ember, Ultraviolet,
Bloom) that are saved server-side and cached locally for a flicker-free load.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **PostgreSQL** via Drizzle ORM (`pg` Pool)
- **Tailwind CSS 4** + custom CSS-variable theming
- **Framer Motion** animations · **Lucide** icons

## Run locally

```bash
npm install
cp .env.example .env        # then set DATABASE_URL
npx drizzle-kit push        # create the tables
npm run dev
```

## Database

Schema lives in `src/db/schema.ts` (`people`, `settings`).
Apply changes with:

```bash
npx drizzle-kit push
# or against another database:
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

## API

| Method | Route               | Purpose                              |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/api/people`       | List everyone                        |
| POST   | `/api/people`       | Add a person `{ name }`              |
| PATCH  | `/api/people/[id]`  | Change reps `{ action: "plus"\|"minus" }` (±3, updates history) |
| GET    | `/api/theme`        | Read saved theme                     |
| PUT    | `/api/theme`        | Save theme `{ theme }`               |

## Deploy

Deployed on Vercel + Neon Postgres. Set `DATABASE_URL` in the Vercel
project's Environment Variables, then run the one-time schema push above
against the production database.
