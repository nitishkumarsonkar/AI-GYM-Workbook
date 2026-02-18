import Constants from 'expo-constants';

type ExerciseDbExercise = {
  id: string;
  name: string;
  gifUrl: string;
  instructions: string[];
  target: string;
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

export async function fetchExerciseByName(name: string): Promise<ExerciseDbExercise | null> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/name/${encodeURIComponent(name)}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      console.warn('ExerciseDB API returned non-200 response', { status: response.status, statusText: response.statusText });
      return null;
    }

    const json = await response.json();
    if (!Array.isArray(json) || json.length === 0) {
      return null;
    }

    const exercise = json[0];

    return {
      id: exercise.id,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions ?? [],
      target: exercise.target,
    };
  } catch (error) {
    console.warn('Failed to fetch exercise from ExerciseDB', { error });
    return null;
  }
}

export async function fetchExerciseById(id: string): Promise<ExerciseDbExercise | null> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/exercise/${encodeURIComponent(id)}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      console.warn('ExerciseDB API returned non-200 response', { status: response.status, statusText: response.statusText });
      return null;
    }

    const exercise = await response.json();

    return {
      id: exercise.id,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions ?? [],
      target: exercise.target,
    };
  } catch (error) {
    console.warn('Failed to fetch exercise from ExerciseDB by id', { error });
    return null;
  }
}
