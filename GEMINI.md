# AI GYM Workbook

An AI-powered mobile gym application built with **React Native (Expo SDK 54)** and **TypeScript** that provides day-wise exercise routines with step-by-step instructions, personalised AI recommendations, and workout logging. Data is managed via **Supabase** (PostgreSQL) with **Gemini LLM** integration for goal-aware suggestions.

## Vision & Goals

- **Auth-first UX** — sign-in/sign-up screen precedes all main content.
- **Structured workout companion** — day-wise exercise plans synced via Supabase.
- **Goal-aware AI recommendations** — Gemini-powered suggestions (fat loss, muscle gain, etc.) via Supabase Edge Functions + a deterministic local recommendation engine.
- **Workout logging** — track completed exercises and leverage history for smarter recommendations.
- **User profile management** — capture and edit user details (age, gender, bio, goals).
- **ExerciseDB API integration** — fetch exercise data with GIFs/animation steps (planned).

## Tech Stack

- **Framework:** React Native (Expo ~54) with Expo Router (file-based routing)
- **Language:** TypeScript
- **Database / Auth:** Supabase (`@supabase/supabase-js`) — auth, Postgres storage, Edge Functions
- **AI:** Gemini LLM via Supabase Edge Functions (API keys stored as Supabase secrets, never `EXPO_PUBLIC_*`)
- **State Management:** React Context (`WorkoutContext`, `AuthContext`)
- **Storage:** `@react-native-async-storage/async-storage`
- **Styling:** React Native `StyleSheet` (primary accent `#f4511e`)
- **Logging:** Custom `logger` utility (`utils/logger.ts`)

## Project Structure

```
gym-app/
├── app/
│   ├── _layout.tsx                  # Root Stack navigator (providers wrap here)
│   ├── index.tsx                    # Home / dashboard (navigation hub + goal section)
│   ├── sign-in.tsx                  # Authentication screen
│   ├── profile.tsx                  # User profile view/edit
│   ├── todays-workout.tsx           # Today's workout view
│   ├── exercise-library.tsx         # Full exercise library
│   ├── weekly-planner.tsx           # Weekly planner with add/remove
│   ├── types.ts                     # Shared TypeScript types
│   ├── day/
│   │   ├── [id].tsx                 # Exercise list for a specific day
│   │   └── add-exercise.tsx         # Add exercise to a day
│   ├── exercise/
│   │   └── [id].tsx                 # Exercise detail with steps
│   ├── recommendation/
│   │   └── recommendationEngine.ts  # Deterministic local recommendation engine
│   ├── services/
│   │   ├── authService.ts           # Supabase authentication helpers
│   │   ├── workoutService.ts        # CRUD operations for workouts
│   │   ├── workoutLogService.ts     # Workout logging service
│   │   ├── recommendationService.ts # AI recommendation service wrapper
│   │   ├── exerciseDbService.ts     # ExerciseDB API integration
│   │   ├── exerciseLibrarySearchService.ts  # Exercise search/filter
│   │   └── exerciseMediaService.ts  # Exercise media (GIFs) handling
│   └── utils/
│       └── exerciseMediaCache.ts    # Media caching utility
├── components/
│   └── BottomNav.tsx                # Bottom tab navigation (Home, Planner, Account)
├── context/
│   ├── AuthContext.tsx              # Auth state provider
│   └── WorkoutContext.tsx           # Global workout state provider
├── lib/
│   └── supabase.ts                  # Supabase client initialisation
├── utils/
│   └── logger.ts                    # Unified logger utility
├── supabase/
│   ├── functions/                   # Supabase Edge Functions (Gemini integration)
│   ├── migrations/                  # Database migrations (versioned DDL)
│   └── seed.sql                     # Seed/demo data (dev)
├── memory-bank/                     # Linked context documentation (see below)
├── docs/
│   ├── DB_CHANGELOG.md              # Database change log
│   └── supabase-rest-troubleshooting.md
├── scripts/
│   ├── test-anon.js                 # Supabase anonymous access test
│   └── test-insert.js               # Supabase insert test
├── assets/                          # Icons, splash screen images
├── .clinerules/                     # Coding, architecture & testing standards
├── app.json                         # Expo configuration
├── tsconfig.json                    # TypeScript config (extends Expo base)
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template and fill in your Supabase keys
cp .env.example .env

# Start the Expo dev server
npx expo start --clear
```

### Environment Variables

| Variable                         | Description            |
| -------------------------------- | ---------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`       | Supabase project URL   |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anonymous key |

## Key Conventions

### Architecture
- **Auth-provider wrapper** around Expo Router stack in `_layout.tsx`.
- **Context-driven state** — `AuthContext` for auth, `WorkoutContext` for workout data; consumers use `useWorkout()` / custom hooks.
- **Services layer** — all Supabase calls live in `app/services/`. UI components should **not** call Supabase directly.
- **No native code** — Expo managed workflow only; no `ios/` or `android/` directories.

### Coding Standards
- Functional components with hooks only; no legacy class components.
- Co-locate styles via `StyleSheet.create`; keep palette consistent.
- Prefer TypeScript typings everywhere.
- One primary component/hook/service per file.
- Avoid prop drilling; prefer context or custom hooks.
- Async operations must surface loading + error states.
- Use `logger.info|warn|error` instead of raw `console` calls; include metadata objects.
- Import order: external packages → absolute aliases → relative paths.

### AI Recommendations Pattern
- **Server-side Gemini calls** via Supabase Edge Functions — mobile app calls `supabase.functions.invoke(...)` through service wrappers.
- **Deterministic local engine** (`recommendation/recommendationEngine.ts`) uses last 7 days of workout logs + exercise tags for recovery filtering, goal scoring, and variety.
- Gemini API keys are stored as **Supabase secrets** (never exposed client-side).

## Database

The Supabase schema is managed via versioned SQL migrations in `supabase/migrations/*.sql`.

### Core Tables

| Table          | Purpose                                      |
| -------------- | -------------------------------------------- |
| `days`         | Days of the week with muscle-group focus      |
| `exercises`    | Exercises linked to a day (includes `tags`)   |
| `steps`        | Ordered instructions for each exercise        |
| `users`        | User profiles (age, gender, bio, goals)       |
| `weekly_plans` | User-specific weekly workout plans            |
| `workout_logs` | Completed workout records for tracking        |

Row Level Security (RLS) policies are included in the migration files.

Seed/demo data (for local/dev) lives in `supabase/seed.sql`.

Database changes are tracked in `docs/DB_CHANGELOG.md`.

## Testing

- Prefer **Jest / testing-library** for unit and integration tests.
- Mock Supabase interactions; don't hit live services in unit tests.
- Critical flows: auth, workout planning, exercise browsing.
- Run `npm test` before submitting PRs.

## Memory Bank

The `memory-bank/` directory maintains linked context documentation:

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `projectBrief.md`   | Root goals and key outcomes                  |
| `productContext.md`  | User-facing value props and requirements     |
| `systemPatterns.md`  | Architecture patterns and design decisions   |
| `techContext.md`     | Technology choices and their roles            |
| `activeContext.md`   | Current focus areas and next steps            |
| `progress.md`        | Chronological progress log                   |

Update these files when discovering new patterns, after significant changes, or when context needs clarification.

## Useful Commands

```bash
npx expo start            # Dev server
npx expo start --ios      # iOS simulator
npx expo start --android  # Android emulator
```
