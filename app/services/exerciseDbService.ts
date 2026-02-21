import Constants from 'expo-constants';
import { logger } from '../../utils/logger';

type ExerciseDbApiExercise = {
  id: string;
  name: string;
  gifUrl?: string | null;
  instructions?: string[];
  category?: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
  secondaryMuscles?: string[];
};

export type ExerciseDbExercise = {
  id: string;
  name: string;
  gifUrl: string | null;
  imageUrl: string | null;
  instructions: string[];
  category: string | null;
  target: string;
  bodyPart: string | null;
  equipment: string | null;
  secondaryMuscles: string[];
};

type ExerciseDbExtra = {
  exerciseDbApiKey?: string;
  exerciseDbBaseUrl?: string;
  exerciseDbHost?: string;
};

const resolveEnvValue = (
  envKey: string,
  extraKey: keyof ExerciseDbExtra,
  fallback?: string,
): string | undefined => {
  const envValue = (globalThis as { process?: { env?: Record<string, string | undefined> } })?.process?.env?.[envKey];
  if (envValue && envValue.length > 0) {
    return envValue;
  }

  const extra = (Constants?.expoConfig?.extra as ExerciseDbExtra | undefined)?.[extraKey];
  if (extra && extra.length > 0) {
    return extra;
  }

  return fallback;
};

const API_KEY = resolveEnvValue('EXPO_PUBLIC_EXERCISEDB_API_KEY', 'exerciseDbApiKey');
const BASE_URL =
  resolveEnvValue('EXPO_PUBLIC_EXERCISEDB_BASE_URL', 'exerciseDbBaseUrl', 'https://exercisedb.p.rapidapi.com') ??
  'https://exercisedb.p.rapidapi.com';
const API_HOST = resolveEnvValue('EXPO_PUBLIC_EXERCISEDB_HOST', 'exerciseDbHost', 'exercisedb.p.rapidapi.com') ??
  'exercisedb.p.rapidapi.com';

if (!API_KEY) {
  console.warn('Missing ExerciseDB API key. Set EXPO_PUBLIC_EXERCISEDB_API_KEY in your env.');
}

const HEADERS: HeadersInit = {
  'x-rapidapi-key': API_KEY ?? '',
  'x-rapidapi-host': API_HOST,
};

const WGER_BASE_URL = 'https://wger.de';

/**
 * Fetch exercise image from Wger (free, open-source exercise database).
 * Returns the full image URL or null if not found.
 */
async function fetchImageFromWger(exerciseName: string): Promise<string | null> {
  try {
    const normalizedName = exerciseName.toLowerCase().trim();
    const response = await fetch(
      `${WGER_BASE_URL}/api/v2/exercise/search/?term=${encodeURIComponent(normalizedName)}&language=2&format=json`
    );

    if (!response.ok) {
      logger.warn('Wger API returned non-200 response', { status: response.status });
      return null;
    }

    const data = await response.json();
    const suggestions = data?.suggestions;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      logger.info('Wger returned no suggestions', { exerciseName });
      return null;
    }

    // Find the first suggestion that has an image
    for (const suggestion of suggestions) {
      const imagePath = suggestion?.data?.image;
      if (imagePath && typeof imagePath === 'string') {
        const fullUrl = `${WGER_BASE_URL}${imagePath}`;
        logger.info('Found exercise image from Wger', { exerciseName, imageUrl: fullUrl });
        return fullUrl;
      }
    }

    logger.info('Wger suggestions found but none have images', { exerciseName, count: suggestions.length });
    return null;
  } catch (error) {
    logger.warn('Failed to fetch exercise image from Wger', { error, exerciseName });
    return null;
  }
}

function mapExerciseDbExercise(
  exercise: ExerciseDbApiExercise,
  imageUrl: string | null,
): ExerciseDbExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    gifUrl: exercise.gifUrl ?? null,
    imageUrl,
    instructions: exercise.instructions ?? [],
    category: exercise.category ?? null,
    target: exercise.target ?? 'general',
    bodyPart: exercise.bodyPart ?? null,
    equipment: exercise.equipment ?? null,
    secondaryMuscles: exercise.secondaryMuscles ?? [],
  };
}

export async function searchExercisesByName(name: string): Promise<ExerciseDbExercise[]> {
  try {
    const normalizedName = name.toLowerCase().trim();
    if (!normalizedName) return [];

    logger.info('Searching exercises from ExerciseDB API', { originalName: name, normalizedName });

    const response = await fetch(`${BASE_URL}/exercises/name/${encodeURIComponent(normalizedName)}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      logger.warn('ExerciseDB API returned non-200 response for search', {
        status: response.status,
        statusText: response.statusText,
      });
      return [];
    }

    const json = (await response.json()) as ExerciseDbApiExercise[];
    if (!Array.isArray(json) || json.length === 0) {
      logger.info('ExerciseDB API returned empty search results', { name: normalizedName });
      return [];
    }

    return json.map((exercise) => mapExerciseDbExercise(exercise, exercise.gifUrl ?? null));
  } catch (error) {
    logger.warn('Failed to search exercises from ExerciseDB', { error, name });
    return [];
  }
}

export async function fetchExerciseByName(name: string): Promise<ExerciseDbExercise | null> {
  try {
    // ExerciseDB API requires lowercase names for search to work
    const normalizedName = name.toLowerCase().trim();
    logger.info('Fetching exercise from ExerciseDB API', { originalName: name, normalizedName });

    const response = await fetch(`${BASE_URL}/exercises/name/${encodeURIComponent(normalizedName)}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      logger.warn('ExerciseDB API returned non-200 response', { status: response.status, statusText: response.statusText });
      return null;
    }

    const json = (await response.json()) as ExerciseDbApiExercise[];
    if (!Array.isArray(json) || json.length === 0) {
      logger.warn('ExerciseDB API returned empty results', { name: normalizedName });
      return null;
    }

    const exercise = json[0];
    logger.info('ExerciseDB API returned exercise', {
      id: exercise.id,
      name: exercise.name,
      hasGifUrl: !!exercise.gifUrl,
      keys: Object.keys(exercise),
    });

    // ExerciseDB API may or may not include gifUrl (it was removed in recent versions)
    const gifUrl = exercise.gifUrl ?? null;

    // If no gifUrl from ExerciseDB, try Wger as fallback for images
    let imageUrl: string | null = gifUrl;
    if (!imageUrl) {
      logger.info('No gifUrl from ExerciseDB, trying Wger for image', { name: normalizedName });
      imageUrl = await fetchImageFromWger(name);
    }

    return mapExerciseDbExercise(exercise, imageUrl);
  } catch (error) {
    logger.warn('Failed to fetch exercise from ExerciseDB', { error });
    return null;
  }
}

export async function fetchExerciseById(id: string): Promise<ExerciseDbExercise | null> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/exercise/${encodeURIComponent(id)}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      logger.warn('ExerciseDB API returned non-200 response', { status: response.status, statusText: response.statusText });
      return null;
    }

    const exercise = (await response.json()) as ExerciseDbApiExercise;
    const gifUrl = exercise.gifUrl ?? null;

    let imageUrl: string | null = gifUrl;
    if (!imageUrl) {
      imageUrl = await fetchImageFromWger(exercise.name);
    }

    return mapExerciseDbExercise(exercise, imageUrl);
  } catch (error) {
    logger.warn('Failed to fetch exercise from ExerciseDB by id', { error });
    return null;
  }
}
