<!-- Copilot instructions for code-playground repository -->
# Copilot instructions — code-playground

This project is a two-part web app: a Nuxt frontend and a Hono + Drizzle TypeScript backend. Use these notes to be productive quickly.

- **Big picture**: Backend (backend/) is an HTTP API and judge service. Frontend (frontend/) is a Nuxt 4 app that consumes `/api/*` endpoints. Code execution is proxied to an external Piston API (or a local wrapper) and results are stored in Postgres.

## Environment Setup

**Prerequisites:**
- Node.js 18+ (check with `node --version`)
- Docker & Docker Compose (for containerized development)
- PostgreSQL client tools (optional, for direct DB access)

**Quick Start:**
```bash
# Clone repo and navigate to project
git clone git@github.com:javadderoom/code-playground.git
cd code-playground

# Backend setup
cd backend
npm install
cp .env.example .env  # Create .env with DATABASE_URL and other vars
npm run dev

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

**Environment Variables:**
- `DATABASE_URL` — PostgreSQL connection string (defaults to `postgres://user:password@db:5432/code_db`)
- `PORT` — Backend server port (default: 4000)
- `NODE_ENV` — Environment mode (`development`, `test`, `production`)
- `PISTON_URL` — Piston API endpoint (defaults to `https://emkc.org/api/v2/piston`)
- For local development on Windows, use `DATABASE_URL=postgres://user:password@localhost:5432/code_db`
- For Docker environments, use `DATABASE_URL=postgres://user:password@db:5432/code_db`

## API Endpoints Reference

**Auth Routes** (`/auth`)
- `POST /auth/register` — Register new user (email, username, password)
- `POST /auth/login` — Login user (returns JWT token)

**Problems Routes** (`/api/problems`)
- `GET /api/problems` — Get all problems with pagination
- `GET /api/problems/:slug` — Get single problem by slug with test cases

**Judge Routes** (`/api/judge`)
- `POST /api/judge/execute` — Debug code execution (does not save submission)
- `POST /api/judge/submit` — Submit solution (saves to database, runs full test suite)

- **Key files**:
  - `backend/src/app.ts` — main Hono app and route registration (`/api/auth`, `/api/problems`, `/api/judge`).
  - `backend/src/index.ts` — dev/server entry (uses `tsx` for `npm run dev`).
  - `backend/src/routes/judge.ts` — judge endpoints; `/execute` (debug) and `/submit` routes with Zod validation.
  - `backend/src/lib/piston.ts` — wrapper to call Piston (use this for execution logic).
  - `backend/src/db/schema.ts` — Drizzle schema with enums (difficultyEnum) and DB connection (note Docker host differences).
  - `backend/src/db/types.ts` — Database type helpers and validation functions.
  - `backend/DATABASE_SCHEMA.md` — Comprehensive documentation of tables, relationships, and data flow.
  - `backend/src/db/seed.ts` — database seeding with environment variable loading.
  - `frontend/nuxt.config.ts` — Nuxt config with Material Icons CDN integration and shadcn/ui aliases.
  - `frontend/app/assets/css/main.scss` — global styles with Material Icons import and shadcn/ui CSS variables.
  - `frontend/lib/utils.ts` — shadcn/ui utility functions (cn function for class merging).
  - `frontend/components/ui/` — shadcn/ui components directory.
  - `frontend/types/types.d.ts` — TypeScript interfaces for API responses and data structures.
  - `frontend/stores/` — Pinia stores for state management.

- **Why some structural decisions matter**:
  - Source uses ESM and TypeScript; runtime imports include `.js` suffixes in the source (e.g. `import './middleware/cors.js'`) to align with ESM runtime resolution when running with `tsx`/Node. **Do NOT use `.js` extensions in new imports** - this was a one-time exception for existing middleware imports.
  - DB connection string defaults to `postgres://user:password@db:5432/code_db` — inside Docker the host is `db`; on Windows/local it is typically `localhost`. See `backend/src/db/index.ts`.

- **Developer workflows & commands** (run inside the subfolder):
  - Backend dev: `cd backend && npm install && npm run dev` (uses `tsx watch src/index.ts`).
  - Backend build: `cd backend && npm run build`.
  - Backend unit tests: `cd backend && npm run test` (Vitest). Integration tests: `cd backend && npm run test:integration` — this runs `docker-compose up -d` and waits briefly.
  - Frontend dev: `cd frontend && npm install && npm run dev` (Nuxt dev).
  - Frontend build: `cd frontend && npm run build`.

## Testing & Quality Assurance

**Backend Testing:**
```bash
cd backend

# Run unit tests
npm run test

# Run with UI
npm run test -- --ui

# Run integration tests (requires Docker)
npm run test:integration

# Run specific test file
npm run test -- auth.test.ts
```

**Frontend Testing:**
```bash
cd frontend

# Run unit tests
npm run test

# Run e2e tests (Playwright)
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

**Test Patterns:**
- Backend: Unit tests in `*.test.ts` files; integration tests in `test/` directories using Docker Compose
- Frontend: Component tests in `test/` and `tests/` directories; e2e tests with Playwright
- Use Vitest `describe`, `it`, `expect` for assertions
- Mock Piston API calls and database operations in unit tests
- Integration tests require full Docker stack to be running

- **Patterns & conventions to follow**:
  - **Do NOT use `.js` extensions in new imports** - use `.ts` extensions instead for TypeScript imports.
  - Use `drizzle-orm` query builder and the `schema.ts` definitions when modifying DB code.
  - Routes are small Hono routers exported as default; register new route files via `app.route()` in `backend/src/app.ts`.
  - API validation uses Zod schemas for request/response validation.
  - Tests use `vitest`; integration-style tests may require Docker (see `test:integration`).
  - Frontend uses Material Icons for UI elements (imported via Google Fonts CDN).
  - UI components use shadcn/ui (Vue) with Tailwind CSS for consistent design system.

- **Integration points / external deps to watch**:
  - Piston execution: judge code calls `https://emkc.org/api/v2/piston/execute` (see `/api/judge`). Consider rate limits and timeouts.
  - Redis/BullMQ referenced in `package.json` — background queue code may exist or be added; be mindful of `ioredis` configuration.
  - Postgres is the canonical data store (Drizzle + `pg`).
  - Pinia stores: state management across components; auto-imported composables like `useUserStore()`.
  - Material Icons: UI icons loaded via Google Fonts CDN in `nuxt.config.ts`.
  - shadcn/ui: Component library with CSS variables and utility functions in `lib/utils.ts`.
  - Markdown rendering: uses `marked` parser with `DOMPurify` sanitization for problem descriptions.

- **Frontend State Management (Pinia)**:
  - **Store Structure**: Individual stores in `frontend/stores/` contain state + actions; root store (`stores/index.ts`) contains reactive state via `storeToRefs` AND exposes actions directly.
  - **Import Pattern**: Vue components ONLY import `useRootStore` - never import individual stores directly.
  - **Root Store**: Contains state refs AND actions; actions accessed directly from root store, state accessed via `rootStore.state`.
  - **Example**: `rootStore.state.problem` (reactive problem data), `rootStore.fetchProblem()` (actions).

## Frontend Components Library

**Available shadcn/ui Components** (in `frontend/components/ui/`):
- `Button.vue` — Standard button with variants (default, destructive, ghost, outline, secondary)
- `Card.vue`, `CardContent.vue`, `CardHeader.vue`, `CardTitle.vue` — Card layout components
- Custom components in `frontend/components/`:
  - `CodeEditor.vue` — Monaco Editor integration for code input with syntax highlighting

**Material Icons Integration:**
- Icons loaded via Google Fonts CDN in `nuxt.config.ts`
- Usage: `<span class="material-icons">icon_name</span>`
- Common icons: `send`, `check`, `error`, `loading`, `check_circle`, etc.
- Full icon list: [Google Material Icons](https://fonts.google.com/icons)

**Styling & Utilities:**
- Tailwind CSS for utility classes
- `lib/utils.ts` exports `cn()` function for conditional class merging
- Global styles in `app/assets/css/main.scss`
- CSS variables defined for shadcn/ui theme colors in variables.scss

- **Concrete examples to reference in edits**:
  - Add an API route: follow `backend/src/routes/auth.ts` or `backend/src/routes/problems.ts` pattern and register in `backend/src/app.ts`.
  - Access DB: use `import { db } from './db/index.js'` and `import { problems, testCases } from './db/schema.js'`.
  - Create Pinia stores: use `frontend/app/stores/` directory; follow the pattern in `user.ts` or `problem.ts`.
  - Add Zod validation: use schemas like `executeSchema` and `submitSchema` in `backend/src/routes/judge.ts`.
  - Render markdown: use `marked.parse()` with `DOMPurify.sanitize()` for safe HTML rendering.
  - Use Material Icons: add `material-icons` class and icon name (e.g., `<span class="material-icons">send</span>`).

- **Environment variables**:
  - `DATABASE_URL` — overrides DB connection string.
  - `PORT` — backend port (default 4000).
  - `NODE_ENV` — tests and 404 logging behavior.

- If anything in this summary is unclear or you want extra examples (test commands, sample request bodies, or notes about `piston.ts`), tell me which section to expand.

## Troubleshooting

**Database Connection Issues**
- **Error**: `connect ECONNREFUSED 127.0.0.1:5432`
  - Check if PostgreSQL is running: `psql -U user -d postgres`
  - Verify `DATABASE_URL` in `.env` file is correct
  - If using Docker, ensure `docker-compose up -d` was successful
  - On Windows local dev, use `localhost`; in Docker, use `db` as hostname

**Port Conflicts**
- **Error**: `Error: listen EADDRINUSE :::4000`
  - Change PORT in `.env`: `PORT=4001`
  - Or kill existing process: `netstat -ano | findstr :4000` (Windows)

**Docker Issues**
- **Error**: `no such file or directory` for `docker-compose.yml`
  - Ensure you're in the project root directory
  - Run `docker-compose up -d` from root, not from backend/ or frontend/

**Piston API Timeouts**
- If code execution is slow or timing out:
  - Check network connectivity to `https://emkc.org/api/v2/piston`
  - Consider implementing local Piston wrapper or caching
  - Increase timeout in `backend/src/lib/piston.ts` if needed

**Dependencies/Module Issues**
- **Error**: `Cannot find module`
  - Run `npm install` in the appropriate folder (backend/ or frontend/)
  - Clear node_modules: `rm -r node_modules && npm install`
  - Ensure Node.js version is 18+: `node --version`

**Git Authentication Issues**
- **Error**: `fatal: Authentication failed`
  - Use Personal Access Token instead of password (GitHub no longer supports password auth)
  - Or switch to SSH: `git remote set-url origin git@github.com:javadderoom/code-playground.git`
  - See README for detailed setup instructions

## Next steps

- **Add more problems & tests**
  - Use `backend/src/db/seed.ts` as a template to add new entries to `problems` and `testCases`.
  - Always set `functionName` to match the user-facing function in the starter code, and store test `input` as JSON ([1, 2]) plus a plain-string `expectedOutput`.

- **Extend the judge**
  - ✅ **Implemented**: Separate `/execute` (debug) and `/submit` routes for testing vs. official submissions.
  - When adding new languages, implement a new driver in `backend/src/lib/drivers/` that conforms to `IDriver` from `types.ts`, then register it in `factory.ts`.
  - Keep using `executeCode` from `backend/src/lib/piston.ts` instead of calling Piston directly, so execution behavior is centralized.

- **Harden security & robustness**
  - Before exposing this publicly, add rate limiting around `/api/judge/*` routes, and require `DATABASE_URL` in non-dev environments.
  - ✅ **Implemented**: Frontend markdown rendering uses `marked` parser with `DOMPurify` sanitization for XSS protection.
  - ✅ **Implemented**: API routes use Zod validation schemas for input validation.

- **Improve UX**
  - ✅ **Implemented**: Material Icons integration for consistent UI elements (send icons, loading states).
  - ✅ **Implemented**: Markdown rendering with syntax highlighting for problem descriptions.
  - In the Nuxt app, prefer composables and small components as this grows: break out the problem page into components for description, editor, and results.
  - Use the existing Tailwind + `prose` styles when introducing richer problem statements (code blocks, lists, examples).