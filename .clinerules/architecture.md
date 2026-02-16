# Architecture Notes – AI GYM Workbook

## High-Level View
- **Auth Layer**: Supabase auth + AuthContext; ensures sign-in screen precedes main content.
- **Workout Data Layer**: WorkoutContext backed by services calling Supabase tables (`exercises`, `weekly_plans`, `users`).
- **Memory Bank Docs**: See [projectBrief.md](../projectBrief.md) → product/system/tech contexts → activeContext/progress.

## Patterns
- Providers wrap the Expo Router stack in `_layout.tsx`.
- Services encapsulate Supabase calls; UI screens consume via contexts/hooks.
- Logger utility records major flows for observability.

## Change Management
- When altering architecture (new context, service, or Supabase table), update relevant context docs.
- Document new flows in `systemPatterns.md` and note current focus in `activeContext.md`.