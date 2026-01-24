Updated Implementation Plan (Repository-Aware)

Current state (already implemented)
- Next.js app router scaffold with `app/layout.tsx`, `app/page.tsx`, Tailwind v4, and globals in `src/app/globals.css`.
- Shadcn base components already present: `button`, `input`, `sheet`, `tooltip`, `separator`, `skeleton`, and a full `sidebar` system.
- Utility and hooks: `src/lib/utils.ts` and `src/hooks/use-mobile.ts`.
- Convex client dependency is installed, and `_generated` files exist (no schema/actions yet).

1) Replace the placeholder page with the actual UI
- Update `src/app/page.tsx` to render the full app shell: sidebar + main content.
- Use the existing `Sidebar` components from `src/components/ui/sidebar.tsx` (do not re-implement a sidebar).
- Use Shadcn primitives already in the repo for layout and interaction.

2) UI structure (chatbot layout + feed)
- Build new components (not present yet):
  - `PromptInput` (textarea + file upload + submit).
  - `ChatStream` (user prompt + system status messages).
  - `ShortsFeed` (vertical snap list of videos).
  - `HistorySidebar` (prompt history list using Sidebar components).
- Implement mobile-first layout behavior using the existing `useIsMobile` hook and `Sheet` for the sidebar drawer.

3) Convex backend (missing)
- Add `convex/schema.ts` with tables for:
  - `prompts`, `outlineItems`, `feedItems`.
- Add Convex functions:
  - `queries/listPrompts`, `queries/getPrompt`, `queries/listFeedItems`.
  - `mutations/createPrompt`, `mutations/updatePromptProgress`, `mutations/deletePrompt`, `mutations/appendFeedItems`.
  - `actions/generateOutline` (Gemini) and `actions/fetchShorts` (YouTube).
- Ensure the Convex project is initialized/configured (no config file yet).

4) Prompt submission flow (missing)
- On submit:
  - Upload attachment to Convex storage (if present).
  - Create a prompt in Convex.
  - Trigger `generateOutline` action.
  - Fetch the first batch of shorts (first N outline items).

5) Shorts feed behavior (missing)
- Implement scroll-snap + `IntersectionObserver` for active index.
- Autoplay only the active video; pause all others.
- When user reaches `feedItems.length - 3`, trigger the next outline fetch.

6) History sidebar behavior (missing)
- Render prompt history from `listPrompts` (Convex query).
- On selection:
  - Load prompt feed and scroll to `lastWatchedIndex`.
- Add delete action to each prompt entry.

7) Progress persistence (missing)
- On index change, update `lastWatchedIndex` and `lastVideoId` via mutation.
- Restore position on prompt selection.

8) UX polish (missing)
- Loading skeletons for sidebar and feed.
- Empty states for "no prompt yet".
- Error handling for Gemini/YouTube failures.

9) Environment & secrets (missing)
- Ensure `.env.local` includes Gemini + YouTube keys (structure TBD).
- Wire Convex actions to read secrets via environment vars.
