# Travel Log

A full-stack Nuxt application for keeping a personal travel journal on a map. You sign in with GitHub, drop locations on an interactive map (searching places by name via OpenStreetMap), and attach dated log entries with uploaded images to each location. It's a complete reference for wiring Nuxt 4 together with Drizzle/Turso, Better Auth, MapLibre, and S3-compatible image storage — useful if you want a working example of those pieces in one codebase rather than a starter you have to assemble yourself.

## Prerequisites

- **Node.js >= 22.13**
- **pnpm 11.5.2** (the repo pins it via `packageManager`; `corepack enable` will use the right version)
- **Docker** — for the local S3 (MinIO) container that stores uploaded images
- **A GitHub OAuth app** — sign-in is GitHub-only (create one at GitHub → Settings → Developer settings → OAuth Apps)

## Quickstart

```bash
git clone <repo-url>
cd travel-log-project
pnpm install

cp .env.example .env   # then fill in the values below

docker compose up -d   # starts MinIO (local S3) — create the bucket named in S3_BUCKET via the console at the MINIO_CONSOLE_PORT
pnpm db:migrate        # applies Drizzle migrations to local.db
pnpm dev               # http://localhost:3000
```

Environment variables are validated on startup ([lib/env.ts](lib/env.ts)) — the app throws immediately and lists what's missing, so you can't run with a half-filled `.env`.

## Configuration

All config is environment variables. The three that matter most, by subsystem:

| Variable                                              | What it controls                                                                                                                                                                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TURSO_DATABASE_URL`                                  | Database location. `file:local.db` for local SQLite; an `libsql://…` URL for [Turso](https://turso.tech) in production (where `TURSO_AUTH_TOKEN` becomes required).                                                           |
| `AUTH_GITHUB_CLIENT_ID` / `AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth credentials for sign-in. Paired with `BETTER_AUTH_SECRET` (session signing key) and `BETTER_AUTH_URL` (your app's base URL, e.g. `http://localhost:3000`).                                                       |
| `S3_ENDPOINT` + `S3_BUCKET`                           | Where uploaded log images go. Point at the local MinIO container in dev or any S3-compatible service in production. `S3_ACCESS_KEY`, `S3_ACCESS_SECRET`, `S3_REGION`, and `S3_BUCKET_URL` (public read URL) complete the set. |

Optional: `NUXT_NOMINATIM_USER_AGENT` identifies the app to OpenStreetMap's place-search API (has a default in [nuxt.config.ts](nuxt.config.ts)).

## Project structure

```
app/         Nuxt frontend (Vue 3)
  pages/       file-based routes; /dashboard/** is the authenticated app
  components/  UI, location, and map components
  stores/      Pinia stores (auth, locations, map)
  layouts/     default + dashboard layouts
server/      Nitro backend
  api/         REST endpoints for locations, logs, images, auth, place search
  middleware/  auth.ts protects /dashboard routes
  utils/       S3 client, authenticated-handler helper
lib/
  db/          Drizzle schema, queries, and SQL migrations
  auth.ts      Better Auth config (GitHub provider, Drizzle adapter)
  env.ts       Zod-validated environment schema (source of truth for required vars)
```

The data model is three tables — `location` → `location_log` → `location_log_image` — each scoped to the signed-in user.

## Local development

```bash
pnpm dev          # dev server with HMR at http://localhost:3000
pnpm lint         # ESLint (antfu config); pnpm lint:fix to autofix
pnpm db:generate  # generate a migration after changing lib/db/Schema
pnpm db:migrate   # apply migrations
pnpm db:studio    # Drizzle Studio — browse the database
pnpm db:shell     # open a SQL shell against local.db
```

A pre-commit hook (Husky + lint-staged) runs the linter on staged files. Production builds use `pnpm build` and `pnpm preview`.
