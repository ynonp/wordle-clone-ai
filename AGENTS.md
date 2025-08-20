# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: App Router pages and layout (e.g., `src/app/page.tsx`, `layout.tsx`).
- `src/lib/`: Shared utilities (e.g., `src/lib/utils.ts` with `cn(...)`).
- `public/`: Static assets served from root path (e.g., `/logo.png`).
- Config: `next.config.ts`, `tsconfig.json` (paths: `@/*`), `eslint.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js in development (Turbopack) at `http://localhost:3000`.
- `npm run build`: Create a production build.
- `npm start`: Serve the production build.
- `npm run lint`: Run ESLint (Next.js core‑web‑vitals + TypeScript rules).

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` enabled. Prefer explicit types for public APIs.
- Components: Use PascalCase for component names/filenames (e.g., `Button.tsx` exporting `Button`). Route files follow Next.js conventions (`page.tsx`, `layout.tsx`).
- Utilities: camelCase function names (e.g., `formatDate`), place in `src/lib/`.
- Formatting: 2‑space indent; use import quotes consistent with repo (double quotes). Keep JSX concise; avoid inline styles when Tailwind utilities suffice.
- Styling: Tailwind CSS v4. Use the `cn` helper to merge conditional class names.

## Testing Guidelines
- No test runner is configured yet. If adding tests:
  - Unit: Vitest + React Testing Library; files as `*.test.ts`/`*.test.tsx` near sources.
  - E2E: Playwright; place under `tests/`.
  - Add scripts: `"test": "vitest"`, `"test:ui": "playwright test"` and ensure they pass locally.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (e.g., `feat: add guess keyboard`, `fix: handle duplicate letters`).
- PRs: Small, focused changes. Include a clear description, linked issues, and screenshots/GIFs for UI changes.
- Before opening: run `npm run lint`, build with `npm run build`, and verify the dev server starts.

## Security & Configuration Tips
- Environment: put secrets in `.env.local`; expose client vars via `NEXT_PUBLIC_*` only. Never commit `.env*` files.
- Assets: place static files under `public/`; reference as `/file.png`.
