-- 20260220002000_exercise_media_columns
-- Extend exercises table for media metadata used by ExerciseDB sync.
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

comment on column public.exercises.instructions is 'Array of step-by-step instructions sourced from ExerciseDB API';

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