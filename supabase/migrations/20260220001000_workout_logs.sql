-- 20260220001000_workout_logs
-- Create Workout Logs Table (daily activity log) + RLS policies.
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