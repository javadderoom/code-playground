<!-- Copilot instructions for code-playground repository -->
# Copilot instructions — code-playground

This project is a two-part web app: a Nuxt frontend and a Hono + Drizzle TypeScript backend. Use these notes to be productive quickly.

- **Big picture**: Backend (backend/) is an HTTP API and judge service. Frontend (frontend/) is a Nuxt 4 app that consumes `/api/*` endpoints. Code execution is proxied to an external Piston API (or a local wrapper) and results are stored in Postgres.

- **Key files**:
  - `backend/src/app.ts` — main Hono app and route registration (`/api/problems`, `/api/judge`).
  - `backend/src/index.ts` — dev/server entry (uses `tsx` for `npm run dev`).
  - `backend/src/routes/judge.ts` — judge endpoints; shows the judging loop and Piston integration.
  - `backend/src/lib/piston.ts` — wrapper to call Piston (use this for execution logic).
  - `backend/src/db/schema.ts` and `backend/src/db/index.ts` — Drizzle schema and DB connection (note Docker host differences).
  - `frontend/` — Nuxt app; see `frontend/package.json` scripts.
  - `frontend/stores/` — Pinia stores for state management.

- **Why some structural decisions matter**:
  - Source uses ESM and TypeScript; runtime imports include `.js` suffixes in the source (e.g. `import './middleware/cors.js'`) to align with ESM runtime resolution when running with `tsx`/Node. Preserve `.js` in new imports unless changing build config.
  - DB connection string defaults to `postgres://user:password@db:5432/code_db` — inside Docker the host is `db`; on Windows/local it is typically `localhost`. See `backend/src/db/index.ts`.

- **Developer workflows & commands** (run inside the subfolder):
  - Backend dev: `cd backend && npm install && npm run dev` (uses `tsx watch src/index.ts`).
  - Backend build: `cd backend && npm run build`.
  - Backend unit tests: `cd backend && npm run test` (Vitest). Integration tests: `cd backend && npm run test:integration` — this runs `docker-compose up -d` and waits briefly.
  - Frontend dev: `cd frontend && npm install && npm run dev` (Nuxt dev).
  - Frontend build: `cd frontend && npm run build`.

- **Patterns & conventions to follow**:
  - Keep runtime-style ESM imports with `.js` where present in source files.
  - Use `drizzle-orm` query builder and the `schema.ts` definitions when modifying DB code.
  - Routes are small Hono routers exported as default; register new route files via `app.route()` in `backend/src/app.ts`.
  - Tests use `vitest`; integration-style tests may require Docker (see `test:integration`).

- **Integration points / external deps to watch**:
  - Piston execution: judge code calls `https://emkc.org/api/v2/piston/execute` (see `/api/judge`). Consider rate limits and timeouts.
  - Redis/BullMQ referenced in `package.json` — background queue code may exist or be added; be mindful of `ioredis` configuration.
  - Postgres is the canonical data store (Drizzle + `pg`).
  - Pinia stores: state management across components; auto-imported composables like `useUserStore()`.

- **Frontend State Management (Pinia)**:
  - **Store Structure**: Individual stores in `frontend/stores/` contain state + actions; root store (`stores/index.ts`) only contains reactive state via `storeToRefs` + store references for actions.
  - **Import Pattern**: Vue components ONLY import `useRootStore` - never import individual stores directly.
  - **Root Store Pattern** (SSR-Safe):
    ```typescript
    const state = {} // Empty state to avoid serialization issues

    return {
      state, // Empty for SSR compatibility
      getUserStore: () => useUserStore(),      // Lazy store access
      getProblemStore: () => useProblemStore() // Lazy store access
    }
    ```
  - **Usage**:
    - State: `rootStore.getProblemStore().problem` (reactive data)
    - Actions: `rootStore.getProblemStore().fetchProblem(slug)`, `rootStore.getProblemStore().runCode(code)`

- **Concrete examples to reference in edits**:
  - Add an API route: follow `backend/src/routes/problems.ts` pattern and register in `backend/src/app.ts`.
  - Access DB: use `import { db } from './db/index.js'` and `import { problems, testCases } from './db/schema.js'`.
  - Create Pinia stores: use `frontend/stores/` directory; follow the pattern in `user.ts` or `problem.ts`.

- **Environment variables**:
  - `DATABASE_URL` — overrides DB connection string.
  - `PORT` — backend port (default 4000).
  - `NODE_ENV` — tests and 404 logging behavior.

- If anything in this summary is unclear or you want extra examples (test commands, sample request bodies, or notes about `piston.ts`), tell me which section to expand.

## Next steps

- **Add more problems & tests**
  - Use `backend/src/db/seed.ts` as a template to add new entries to `problems` and `testCases`.
  - Always set `functionName` to match the user-facing function in the starter code, and store test `input` as JSON ([1, 2]) plus a plain-string `expectedOutput`.

- **Extend the judge**
  - When adding new languages, implement a new driver in `backend/src/lib/drivers/` that conforms to `IDriver` from `types.ts`, then register it in `factory.ts`.
  - Keep using `executeCode` from `backend/src/lib/piston.ts` instead of calling Piston directly, so execution behavior is centralized.

- **Harden security & robustness**
  - Before exposing this publicly, add basic input validation and rate limiting around `/api/judge/*` routes, and require `DATABASE_URL` in non-dev environments.
  - For frontend markdown (problem descriptions), keep rendering via a markdown parser but ensure HTML is sanitized before using `v-html`.

- **Improve UX**
  - In the Nuxt app, prefer composables and small components as this grows: break out the problem page into components for description, editor, and results.
  - Use the existing Tailwind + `prose` styles when introducing richer problem statements (code blocks, lists, examples).