-- Create Workout Logs Table (daily activity log)
create table if not exists public.workout_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    performed_at date not null,
    exercise_id bigint references public.exercises(id) on delete cascade not null,
    sets integer,
    reps integer,
    intensity text check (intensity in ('low', 'moderate', 'high')),
    created_at timestamp with time zone default timezone('utc' :: text, now()) not null
);

create index if not exists workout_logs_user_date_idx on public.workout_logs (user_id, performed_at);

create index if not exists workout_logs_exercise_idx on public.workout_logs (exercise_id);

alter table
    public.workout_logs enable row level security;

-- Policies for Workout Logs
drop policy if exists "Users can view own workout logs." on public.workout_logs;

create policy "Users can view own workout logs." on public.workout_logs for
select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own workout logs." on public.workout_logs;

create policy "Users can insert own workout logs." on public.workout_logs for
insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own workout logs." on public.workout_logs;

create policy "Users can update own workout logs." on public.workout_logs for
update
    using (auth.uid() = user_id);

drop policy if exists "Users can delete own workout logs." on public.workout_logs;

create policy "Users can delete own workout logs." on public.workout_logs for delete using (auth.uid() = user_id);

-- 2026-02-18: Extend exercises table for media metadata
alter table
    if exists public.exercises
add
    column if not exists instructions text [];

alter table
    if exists public.exercises
add
    column if not exists target_muscle text;

alter table
    if exists public.exercises
add
    column if not exists supabase_gif_path text;

alter table
    if exists public.exercises
add
    column if not exists last_synced_at timestamptz;

comment on column public.exercises.instructions is 'Array of step-by-step instructions sourced from ExerciseDB';

comment on column public.exercises.target_muscle is 'Primary muscle group targeted by the exercise';

comment on column public.exercises.supabase_gif_path is 'Path in Supabase storage exercise-gifs bucket for media asset';

comment on column public.exercises.last_synced_at is 'Timestamp of last sync with ExerciseDB API';

-- Storage bucket policy guidance for exercise-gifs bucket
-- Run in Supabase SQL editor to allow authenticated uploads and public reads.
--
-- begin;
-- create policy "Allow authenticated upload exercise gifs"
--     on storage.objects for insert
--     to authenticated
--     with check (bucket_id = 'exercise-gifs');
--
-- create policy "Allow authenticated update exercise gifs"
--     on storage.objects for update
--     to authenticated
--     using (bucket_id = 'exercise-gifs')
--     with check (bucket_id = 'exercise-gifs');
--
-- create policy "Allow public read exercise gifs"
--     on storage.objects for select
--     to public
--     using (bucket_id = 'exercise-gifs');
-- commit;