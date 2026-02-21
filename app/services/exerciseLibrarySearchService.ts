import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { Exercise } from '../types';
import { getSessionUser } from './authService';
import { ExerciseDbExercise, fetchExerciseById } from './exerciseDbService';

export type ResolveExerciseResult =
  | {
      status: 'ok';
      exercise: Exercise;
      wasInserted: boolean;
    }
  | {
      status: 'auth_required';
    }
  | {
      status: 'error';
      message: string;
    };

function normalizeText(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function deriveCategory(exercise: ExerciseDbExercise): Exercise['category'] {
  const explicitCategory = normalizeText(exercise.category);
  if (explicitCategory.includes('cardio') || explicitCategory.includes('cardiovascular')) {
    return 'cardio';
  }
  if (explicitCategory.includes('gym') || explicitCategory.includes('strength') || explicitCategory.includes('resistance')) {
    return 'gym';
  }

  const corpus = [exercise.bodyPart, exercise.target, exercise.equipment, exercise.name]
    .map((value) => normalizeText(value))
    .join(' ');

  const cardioHints = ['cardio', 'cardiovascular', 'aerobic', 'conditioning', 'endurance'];
  return cardioHints.some((hint) => corpus.includes(hint)) ? 'cardio' : 'gym';
}

function deriveTags(exercise: ExerciseDbExercise): string[] {
  const rawTags = [exercise.target, exercise.bodyPart, exercise.equipment]
    .map((value) => normalizeText(value))
    .filter((value) => value.length > 0);

  const unique = Array.from(new Set(rawTags));
  return unique.length > 0 ? unique : ['general'];
}

function deriveSteps(exercise: ExerciseDbExercise): string[] {
  if (exercise.instructions.length > 0) {
    return exercise.instructions;
  }

  return ['No instructions available yet.'];
}

function buildInsertPayload(exercise: ExerciseDbExercise): Omit<Exercise, 'id'> {
  const category = deriveCategory(exercise);
  const steps = deriveSteps(exercise);

  return {
    name: exercise.name,
    category,
    tags: deriveTags(exercise),
    sets: category === 'cardio' ? '20-30 minutes' : '3x10',
    steps,
    instructions: steps,
    target_muscle: exercise.target ?? null,
    image_url: exercise.gifUrl ?? exercise.imageUrl ?? undefined,
    supabase_gif_path: null,
    last_synced_at: new Date().toISOString(),
  };
}

async function findExerciseInSupabaseByName(name: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (error) {
    logger.error('Failed to find exercise in Supabase by name', { error, name });
    return null;
  }

  return (data as Exercise | null) ?? null;
}

export async function resolveExerciseForLibraryOpen(searchResult: ExerciseDbExercise): Promise<ResolveExerciseResult> {
  try {
    const existing = await findExerciseInSupabaseByName(searchResult.name);
    if (existing) {
      return { status: 'ok', exercise: existing, wasInserted: false };
    }

    const user = await getSessionUser();
    if (!user) {
      return { status: 'auth_required' };
    }

    const fullDetail = await fetchExerciseById(searchResult.id);
    const source = fullDetail ?? searchResult;
    const payload = buildInsertPayload(source);

    const { data, error } = await supabase
      .from('exercises')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('Failed to insert missing exercise into Supabase', {
        error,
        name: searchResult.name,
        id: searchResult.id,
      });

      const errorCode = (error as { code?: string } | null)?.code;
      if (errorCode === '23505') {
        return {
          status: 'error',
          message:
            'Database ID sequence is out of sync. Please apply latest Supabase migrations and try again.',
        };
      }

      return {
        status: 'error',
        message: 'Could not save this exercise right now. Please try again.',
      };
    }

    return { status: 'ok', exercise: data as Exercise, wasInserted: true };
  } catch (error) {
    logger.error('Unexpected error resolving search exercise', { error, searchResult });
    return {
      status: 'error',
      message: 'Something went wrong while opening this exercise.',
    };
  }
}
