-- 20260221000200_fix_exercises_id_sequence
-- Ensure exercises identity sequence is aligned with existing seeded/manual IDs.
-- Prevents 409 conflicts like duplicate key value violates exercises_pkey.

select setval(
  pg_get_serial_sequence('public.exercises', 'id'),
  coalesce((select max(id) from public.exercises), 1),
  true
);
