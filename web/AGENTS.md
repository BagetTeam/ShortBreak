# Repository Guidelines

## Project Structure & Module Organization
- `src/app` holds the Next.js App Router entry points (`layout.tsx`, `page.tsx`) and global styles in `globals.css`.
- `src/components` contains shared UI components (ShadCN + Radix-based).
- `src/hooks` and `src/lib` house reusable hooks and utilities.
- `public/` stores static assets (images, icons, etc.).
- `convex/` contains Convex schema, queries, and actions for the learning feed backend.
- Root config includes `next.config.ts`, `tailwind`/`postcss`, and `eslint.config.mjs`.

## Build, Test, and Development Commands
- `bun run dev`: start the local Next.js dev server.
- `bun run build`: generate a production build.
- `bun run start`: serve the production build locally.
- `bun run lint`: run ESLint with the Next.js config.

## Coding Style & Naming Conventions
- TypeScript + React functional components only; keep components in `.tsx`.
- 2-space indentation and double quotes, matching existing files.
- Tailwind CSS utilities are preferred; use theme variables from `src/app/globals.css`.
- ShadCN components should live in `src/components` and remain composable.
- Naming: `PascalCase` for components, `camelCase` for functions/hooks, Next.js route files are `page.tsx` and `layout.tsx`.

## Testing Guidelines
- No automated test framework is configured yet.
- Validate UI changes manually via `bun run dev` and basic navigation checks.

## Commit & Pull Request Guidelines
- Commit history uses short, imperative messages (e.g., “add dependencies”).
- PRs should include a concise description, UI screenshots for visual changes, and mention any Convex schema/action updates.
- Note new or changed environment variables in the PR description.

## Configuration & Secrets
- Use `.env.local` for local Convex settings (e.g., `NEXT_PUBLIC_CONVEX_URL`).
- Avoid committing credentials or API keys; keep secrets out of the repo.
