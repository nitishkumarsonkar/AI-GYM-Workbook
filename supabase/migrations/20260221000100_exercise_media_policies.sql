-- 20260221000100_exercise_media_policies
-- Add policies for exercise updates and storage bucket access.

-- Allow authenticated users to update exercises (for ExerciseDB sync)
drop policy if exists "Authenticated users can update exercises." on public.exercises;
create policy "Authenticated users can update exercises."
    on public.exercises for update
    to authenticated
    using (true)
    with check (true);

-- Allow authenticated users to insert exercises (for ExerciseDB sync)
drop policy if exists "Authenticated users can insert exercises." on public.exercises;
create policy "Authenticated users can insert exercises."
    on public.exercises for insert
    to authenticated
    with check (true);

-- Storage bucket policies for exercise-gifs bucket
-- These allow authenticated users to upload/update GIFs and public to read them.

-- Allow authenticated upload of exercise gifs
create policy "Allow authenticated upload exercise gifs"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'exercise-gifs');

-- Allow authenticated update of exercise gifs (for upsert)
create policy "Allow authenticated update exercise gifs"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'exercise-gifs')
    with check (bucket_id = 'exercise-gifs');

-- Allow public read of exercise gifs (bucket is public, but policy is still needed)
create policy "Allow public read exercise gifs"
    on storage.objects for select
    to public
    using (bucket_id = 'exercise-gifs');
