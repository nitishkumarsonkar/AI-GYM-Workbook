# Coding Standards – AI GYM Workbook

## General Principles
- Align with the context captured in [projectBrief.md](../projectBrief.md) and related docs.
- Prefer TypeScript typings everywhere for predictability.
- Keep files focused: one primary component/hook/service per file.

## React Native / Expo
- Use functional components with hooks; avoid legacy class components.
- Co-locate styles via `StyleSheet.create`, keeping palette consistent (primary `#f4511e`).
- Follow Expo Router conventions; routing logic lives in `_layout.tsx` and screen files.

## State & Context
- Reuse `WorkoutContext`, `AuthContext`, or new contexts documented in `systemPatterns.md`.
- Avoid prop drilling; prefer context or custom hooks.
- Async operations must surface loading + error states.

## Supabase & Services
- All server interactions route through `lib/supabase.ts`.
- Services (`app/services/*`) should remain side-effect free beyond API calls/logging.
- Handle errors gracefully and always log via the shared `logger` utility.

## Logging
- Use `logger.info|warn|error` instead of raw console calls; include metadata objects.
- Major flows (auth transitions, workout plan mutations) require both success and failure logging.

## Styling & Accessibility
- Maintain semantic text hierarchy and tap targets ≥ 44px.
- Favor light backgrounds with dark text unless theming changes are approved.

## Linting/Formatting
- Honor repo prettier/eslint settings (`npm run lint` when available).
- Import order: external packages, absolute aliases, then relative paths.

## Pull Requests / Reviews
- Reference relevant context files when architectural changes occur.
- Provide screenshots/videos for UI-impacting work when possible.