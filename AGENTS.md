# Repository Guidelines

## Project Structure & Module Organization
AquaSync is a small multi-part product platform.

- `web/`: Next.js App Router frontend with pages in `app/`, shared UI in `components/`, Supabase helpers in `lib/`, and static assets in `public/`.
- `server/`: Node.js CommonJS backend. Entry points are `src/server.js` and `src/app.js`; routes live in `src/routes/`, Socket.IO in `src/socket/`, simulator logic in `src/simulator/`, and Supabase config in `src/config/`.
- `docs/`: planning, API, architecture, database, proposal, and UI documentation.
- `mobile/`: reserved for the Flutter mobile app; it is currently empty.

Before editing the frontend, read `web/AGENTS.md`; this repo uses a newer Next.js version with local docs under `web/node_modules/next/dist/docs/`.

## Build, Test, and Development Commands
Run commands from the relevant package directory.

- `cd web && npm run dev`: start the Next.js development server.
- `cd web && npm run build`: build the production frontend.
- `cd web && npm run start`: serve the built frontend.
- `cd web && npm run lint`: run ESLint for the frontend.
- `cd server && npm run dev`: start the backend with `nodemon`.
- `cd server && npm start`: run the backend with Node.

If dependencies are missing, run `npm install` inside `web/` or `server/`.

## Coding Style & Naming Conventions
Use 2-space indentation, double quotes, and semicolons. Frontend components use PascalCase filenames such as `PurchaseButton.tsx`; route files follow Next.js names like `page.tsx` and `route.ts`. Backend route modules use descriptive suffixes such as `health.routes.js`. Keep environment access centralized in config/helper modules.

## Testing Guidelines
No automated test suite is configured yet. For now, validate changes with `npm run lint`, `npm run build`, and manual checks of affected flows. When adding tests, place frontend tests near the relevant component or route, and backend tests under `server/src` or `server/tests`. Name tests after the behavior, for example `purchase-flow.test.ts`.

## Commit & Pull Request Guidelines
Recent commits use phase-prefixed, imperative summaries, for example `Phase 3: add checkout success page and purchase redirect flow`. Keep that style for milestones. Pull requests should include a short description, changed areas (`web`, `server`, `docs`, or `mobile`), validation commands, linked issues when available, and screenshots for UI changes.

## Security & Configuration Tips
Do not commit `.env` or `.env.local`; both are ignored. Use `server/.env.example` as the template for backend variables such as `PORT`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`. Keep Supabase keys and activation-flow secrets out of source files.
