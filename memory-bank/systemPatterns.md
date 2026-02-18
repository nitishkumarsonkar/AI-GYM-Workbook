# System Patterns

Documents recurring architecture and workflow patterns for AI GYM Workbook.

## Core Patterns
- **Auth-provider wrapper** around Expo Router stack (see `app/_layout.tsx`).
- **Context-driven state** for workouts and authentication.
- **Supabase as single source** for exercises, plans, and user profiles.

## AI Recommendations Pattern
- **Server-side Gemini calls** are implemented via **Supabase Edge Functions**.
- Mobile app calls `supabase.functions.invoke(...)` through a small service wrapper.
- Gemini API keys are stored as **Supabase secrets** (never `EXPO_PUBLIC_*`).

## Activity Log + Deterministic Recommendation Engine
- App records completed workouts into `public.workout_logs`.
- “Recommended for Today” is computed locally using:
  - last 7 days logs + inferred muscles from `exercises.tags`
  - recovery filter (avoid consecutive-day resistance overlap)
  - goal scoring (fat_loss vs muscle_gain)
  - variety score + alternative suggestions

## Dependencies
- ← [projectBrief.md](projectBrief.md)
- → [activeContext.md](activeContext.md)