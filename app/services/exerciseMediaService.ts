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

  logger.info('getExerciseDetailWithMedia called', { exerciseName, forceRefresh });

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
    logger.info('Exercise found in Supabase', {
      id: existingExercise.id,
      name: existingExercise.name,
      supabase_gif_path: existingExercise.supabase_gif_path,
      image_url: existingExercise.image_url,
    });

    const requiresRefresh = shouldRefreshExercise(existingExercise);

    if (requiresRefresh || forceRefresh) {
      logger.info('Exercise requires refresh', { requiresRefresh, forceRefresh });
      const refreshed = await syncExerciseFromExerciseDb(exerciseName, existingExercise);
      if (!refreshed) {
        logger.warn('Sync failed, falling back to existing exercise data', { exerciseName });
        return buildMediaResult(existingExercise);
      }

      return buildMediaResult(refreshed);
    }

    logger.info('Exercise found in Supabase, using cached metadata', { id: existingExercise.id });
    return buildMediaResult(existingExercise);
  }

  logger.info('Exercise not found in Supabase, syncing from ExerciseDB', { exerciseName });
  const insertedExercise = await syncExerciseFromExerciseDb(exerciseName);
  if (!insertedExercise) {
    logger.error('Failed to sync exercise from ExerciseDB and no existing data', { exerciseName });
    return null;
  }

  return buildMediaResult(insertedExercise);
}

/**
 * Build the media result for an exercise.
 * Priority: image_url (direct external URL) → Supabase storage (uploaded GIFs).
 *
 * We prefer image_url first because:
 * - ExerciseDB no longer provides gifUrl, so supabase_gif_path may point to
 *   files that were never successfully uploaded.
 * - image_url is a direct, verified external URL (Wger, etc.) that works immediately.
 * - Supabase storage is only used when we have confirmed uploaded GIFs.
 */
async function buildMediaResult(exercise: Exercise): Promise<ExerciseMediaDetail> {
  // Prefer direct image_url first (Wger image, ExerciseDB CDN, etc.)
  if (exercise.image_url) {
    logger.info('Using image_url for media', { image_url: exercise.image_url });
    return {
      exercise,
      mediaUri: exercise.image_url,
      fromCache: false,
    };
  }

  // Fallback: try Supabase storage (for previously uploaded GIFs)
  if (exercise.supabase_gif_path) {
    const cachedMedia = await ensureExerciseMediaCached(exercise);
    if (cachedMedia?.uri) {
      logger.info('Media resolved from Supabase storage', { uri: cachedMedia.uri, fromCache: cachedMedia.fromCache });
      return {
        exercise,
        mediaUri: cachedMedia.uri,
        fromCache: cachedMedia.fromCache,
      };
    }
    logger.warn('Supabase storage cache returned null', { path: exercise.supabase_gif_path });
  }

  logger.warn('No media available for exercise', { id: exercise.id, name: exercise.name });
  return {
    exercise,
    mediaUri: null,
    fromCache: false,
  };
}

async function uploadGifToSupabase(path: string, gifUrl: string): Promise<boolean> {
  try {
    logger.info('Downloading GIF from source for upload', { gifUrl, path });
    const response = await fetch(gifUrl);

    if (!response.ok) {
      logger.error('Failed to fetch GIF from source', { status: response.status, gifUrl });
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    logger.info('GIF downloaded, uploading to Supabase storage', { path, size: arrayBuffer.byteLength });

    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType: 'image/gif',
      upsert: true,
    });

    if (error) {
      logger.error('Failed to upload GIF to Supabase storage', { error, path });
      return false;
    }

    logger.info('GIF uploaded to Supabase storage successfully', { path });
    return true;
  } catch (error) {
    logger.error('Exception during GIF upload to Supabase', { error, gifUrl });
    return false;
  }
}

function shouldRefreshExercise(exercise: Exercise): boolean {
  // If we have no image at all, always refresh
  if (!exercise.supabase_gif_path && !exercise.image_url) return true;
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

  logger.info('ExerciseDB returned data', {
    id: exerciseDbData.id,
    name: exerciseDbData.name,
    gifUrl: exerciseDbData.gifUrl,
    imageUrl: exerciseDbData.imageUrl,
    target: exerciseDbData.target,
    instructionCount: exerciseDbData.instructions?.length ?? 0,
  });

  // Handle GIF upload to Supabase storage (only if gifUrl is available)
  let supabasePath = existingExercise?.supabase_gif_path ?? null;
  if (exerciseDbData.gifUrl) {
    const targetPath = supabasePath ?? `gif-${exerciseDbData.id}.gif`;
    const uploadResult = await uploadGifToSupabase(targetPath, exerciseDbData.gifUrl);
    if (uploadResult) {
      supabasePath = targetPath;
    } else {
      logger.warn('GIF upload failed', { gifUrl: exerciseDbData.gifUrl });
    }
  } else {
    logger.info('No gifUrl available from ExerciseDB (API no longer provides GIFs)');
  }

  // Determine the best image URL to store
  // Priority: gifUrl (if available) > imageUrl from Wger > existing image_url
  const imageUrl = exerciseDbData.gifUrl ?? exerciseDbData.imageUrl ?? existingExercise?.image_url ?? null;

  const payload = {
    name: existingExercise?.name ?? exerciseDbData.name,
    category: existingExercise?.category ?? 'gym',
    tags: existingExercise?.tags?.length ? existingExercise.tags : [exerciseDbData.target],
    sets: existingExercise?.sets ?? '3x10',
    steps: exerciseDbData.instructions,
    instructions: exerciseDbData.instructions,
    target_muscle: exerciseDbData.target,
    last_synced_at: new Date().toISOString(),
    image_url: imageUrl,
    supabase_gif_path: supabasePath,
  } satisfies Partial<Exercise> & { name: string };

  logger.info('Saving exercise to Supabase', {
    image_url: imageUrl,
    supabase_gif_path: supabasePath,
    isUpdate: !!existingExercise,
  });

  // Build an in-memory merged exercise so we can return it even if DB update fails
  const mergedExercise: Exercise = {
    ...(existingExercise ?? { id: 0, name: payload.name, category: payload.category as 'cardio' | 'gym', tags: payload.tags, sets: payload.sets, steps: payload.steps }),
    ...payload,
    category: payload.category as 'cardio' | 'gym',
    id: existingExercise?.id ?? 0,
  };

  if (existingExercise) {
    const { data, error } = await supabase
      .from('exercises')
      .update(payload)
      .eq('id', existingExercise.id)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('Failed to update exercise metadata in Supabase', { error, id: existingExercise.id });
      // Return the merged in-memory exercise so the UI still gets the image_url
      logger.info('Returning in-memory merged exercise with image_url', { image_url: mergedExercise.image_url });
      return mergedExercise;
    }

    logger.info('Exercise updated in Supabase', { id: (data as Exercise).id });
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

  logger.info('Exercise inserted into Supabase', { id: (data as Exercise).id });
  return data as Exercise;
}
