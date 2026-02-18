import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { fetchExerciseByName } from './exerciseDbService';
import { Exercise } from '../types';
import { ensureExerciseMediaCached } from '../utils/exerciseMediaCache';

export type ExerciseMediaDetail = {
  exercise: Exercise;
  mediaUri: string | null;
  fromCache: boolean;
};

const BUCKET = 'exercise-gifs';

export async function getExerciseDetailWithMedia(
  exerciseName: string,
  options: { forceRefresh?: boolean } = {}
): Promise<ExerciseMediaDetail | null> {
  const { forceRefresh = false } = options;
  const { data: existingExerciseRow, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', exerciseName)
    .maybeSingle();

  const existingExercise = (existingExerciseRow as Exercise | null) ?? null;

  if (error) {
    logger.error('Failed to lookup exercise in Supabase', { error, exerciseName });
  }

  if (existingExercise) {
    const requiresRefresh = shouldRefreshExercise(existingExercise);

    if (requiresRefresh || forceRefresh) {
      const refreshed = await syncExerciseFromExerciseDb(exerciseName, existingExercise);
      if (!refreshed) {
        return null;
      }

      const refreshedCache = await ensureExerciseMediaCached(refreshed);
      return {
        exercise: refreshed,
        mediaUri: refreshedCache?.uri ?? null,
        fromCache: refreshedCache?.fromCache ?? false,
      };
    }

    logger.info('Exercise found in Supabase, using cached metadata', { id: existingExercise.id });
    const cachedMedia = await ensureExerciseMediaCached(existingExercise);

    return {
      exercise: existingExercise,
      mediaUri: cachedMedia?.uri ?? null,
      fromCache: cachedMedia?.fromCache ?? false,
    };
  }

  const insertedExercise = await syncExerciseFromExerciseDb(exerciseName);
  if (!insertedExercise) {
    return null;
  }

  const cachedMedia = await ensureExerciseMediaCached(insertedExercise);

  return {
    exercise: insertedExercise,
    mediaUri: cachedMedia?.uri ?? null,
    fromCache: cachedMedia?.fromCache ?? false,
  };
}

async function uploadGifToSupabase(path: string, gifUrl: string): Promise<boolean> {
  try {
    const response = await fetch(gifUrl);
    const arrayBuffer = await response.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType: 'image/gif',
      upsert: true,
    });

    if (error) {
      logger.error('Failed to upload GIF to Supabase', { error, path });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to fetch GIF for upload', { error, gifUrl });
    return false;
  }
}

function shouldRefreshExercise(exercise: Exercise): boolean {
  if (!exercise.supabase_gif_path) return true;
  if (!exercise.instructions || exercise.instructions.length === 0) return true;
  if (!exercise.target_muscle) return true;

  if (exercise.last_synced_at) {
    const lastSync = new Date(exercise.last_synced_at).getTime();
    const now = Date.now();
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    if (now - lastSync > THIRTY_DAYS) {
      return true;
    }
  }

  return false;
}

async function syncExerciseFromExerciseDb(exerciseName: string, existingExercise?: Exercise): Promise<Exercise | null> {
  logger.info('Fetching exercise details from ExerciseDB', { exerciseName, existingId: existingExercise?.id });
  const exerciseDbData = await fetchExerciseByName(exerciseName);

  if (!exerciseDbData) {
    logger.warn('ExerciseDB returned no data', { exerciseName });
    return existingExercise ?? null;
  }

  const supabasePath = existingExercise?.supabase_gif_path ?? `gif-${exerciseDbData.id}.gif`;

  const uploadResult = await uploadGifToSupabase(supabasePath, exerciseDbData.gifUrl);
  if (!uploadResult) {
    return existingExercise ?? null;
  }

  const payload = {
    name: exerciseDbData.name,
    category: existingExercise?.category ?? 'gym',
    tags: existingExercise?.tags?.length ? existingExercise.tags : [exerciseDbData.target],
    sets: existingExercise?.sets ?? '3x10',
    steps: exerciseDbData.instructions,
    supabase_gif_path: supabasePath,
    instructions: exerciseDbData.instructions,
    target_muscle: exerciseDbData.target,
    last_synced_at: new Date().toISOString(),
  } satisfies Partial<Exercise> & { name: string };

  if (existingExercise) {
    const { data, error } = await supabase
      .from('exercises')
      .update(payload)
      .eq('id', existingExercise.id)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('Failed to update exercise metadata in Supabase', { error, id: existingExercise.id });
      return existingExercise;
    }

    return data as Exercise;
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    logger.error('Failed to insert exercise metadata into Supabase', { error });
    return null;
  }

  return data as Exercise;
}
