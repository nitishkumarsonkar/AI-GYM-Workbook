# AI GYM Workbook

A mobile gym application built with **React Native (Expo SDK 54)** and **TypeScript** that provides day-wise exercise routines with step-by-step instructions. Data is managed via **Supabase** (PostgreSQL).

## Tech Stack

- **Framework:** React Native (Expo ~54) with Expo Router (file-based routing)
- **Language:** TypeScript
- **Database / Auth:** Supabase (`@supabase/supabase-js`)
- **State Management:** React Context (`WorkoutContext`)
- **Storage:** `@react-native-async-storage/async-storage`
- **Styling:** React Native `StyleSheet`

## Project Structure

```
gym-app/
├── app/
│   ├── _layout.tsx              # Root Stack navigator
│   ├── index.tsx                # Home / dashboard (navigation hub)
│   ├── sign-in.tsx              # Authentication screen
│   ├── todays-workout.tsx       # Today's workout view
│   ├── exercise-library.tsx     # Full exercise library
│   ├── weekly-planner.tsx       # Weekly planner with add/remove
│   ├── types.ts                 # Shared TypeScript types
│   ├── day/
│   │   ├── [id].tsx             # Exercise list for a specific day
│   │   └── add-exercise.tsx     # Add exercise to a day
│   ├── exercise/
│   │   └── [id].tsx             # Exercise detail with steps
│   └── services/
│       ├── authService.ts       # Supabase authentication helpers
│       └── workoutService.ts    # CRUD operations for workouts
├── context/
│   └── WorkoutContext.tsx       # Global workout state provider
├── lib/
│   └── supabase.ts              # Supabase client initialisation
├── supabase/
│   └── schema.sql               # Database schema & seed data
├── scripts/
│   ├── test-anon.js             # Supabase anonymous access test
│   └── test-insert.js           # Supabase insert test
├── assets/                      # Icons, splash screen images
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript config (extends Expo base)
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

- **File-based routing** — every file under `app/` maps to a route. Dynamic segments use `[param]` syntax.
- **Services layer** — all Supabase calls live in `app/services/`. UI components should not call Supabase directly.
- **Context for state** — `WorkoutContext` provides workout data globally; consumers use `useWorkout()`.
- **No native code** — the project relies entirely on Expo managed workflow; no `ios/` or `android/` directories are committed.

## Database

The Supabase schema (`supabase/schema.sql`) defines three core tables:

| Table       | Purpose                                   |
| ----------- | ----------------------------------------- |
| `days`      | Days of the week with muscle-group focus   |
| `exercises` | Exercises linked to a day                  |
| `steps`     | Ordered instructions for each exercise     |

Row Level Security (RLS) policies are included in the schema file.

## Useful Commands

```bash
npx expo start          # Dev server
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator
```
