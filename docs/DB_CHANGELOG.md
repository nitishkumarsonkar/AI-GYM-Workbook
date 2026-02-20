# Database Changelog (Supabase)

This file is a human-readable changelog for database changes.

Source of truth for DDL is `supabase/migrations/*.sql`.

## 2026-02-20
- Migrated schema management into `supabase/migrations/`.
- Added baseline migrations: core tables + RLS/policies, workout logs, and exercise media metadata columns.
- Split seed data into `supabase/seed.sql`.

## 2026-02-18
- Extended `public.exercises` with media metadata:
  - `instructions`, `target_muscle`, `supabase_gif_path`, `last_synced_at`

## 2026-02-17
- Added `public.workout_logs` table with indexes + RLS policies.

## 2026-02-16
- Added core tables:
  - `public.exercises`
  - `public.weekly_plans`
  - `public.users` (profile)
- Added profile fields `gender`, `age`, `bio`.
- Added `updated_at` trigger.
