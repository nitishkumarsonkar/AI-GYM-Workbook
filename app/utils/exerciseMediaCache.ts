import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Exercise } from '../types';
import { logger } from '../../utils/logger';

type FileSystemModule = {
  cacheDirectory?: string | null;
  documentDirectory?: string | null;
  getInfoAsync: (uri: string) => Promise<{ exists: boolean; size?: number } & Record<string, unknown>>;
  downloadAsync: (uri: string, fileUri: string, options?: { cache?: boolean }) => Promise<unknown>;
  makeDirectoryAsync: (uri: string, options?: { intermediates?: boolean }) => Promise<void>;
};

const fs = FileSystem as unknown as FileSystemModule;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const BUCKET = 'exercise-gifs';

/**
 * Build the public URL for a file in a public Supabase Storage bucket.
 * Format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
 */
export function getPublicStorageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * We resolve cache paths lazily.
 *
 * Why: in Expo web (and sometimes during bundling / fast refresh), parts of
 * expo-file-system can be missing/undefined. If we compute this at module load
 * time, it can crash the entire app before any screen renders.
 */
function getMediaCacheDir(): string | null {
  // Expo web doesn't provide a real file system, so always fall back to URLs.
  if (Platform.OS === 'web') {
    return null;
  }

  const baseDir = resolveBaseCacheDir(fs);
  return baseDir ? `${baseDir}exercise-media/` : null;
}

type CacheResult = {
  uri: string;
  fromCache: boolean;
  signedUrl?: string;
};

export async function ensureExerciseMediaCached(exercise: Exercise): Promise<CacheResult | null> {
  if (!exercise.supabase_gif_path) {
    logger.warn('No supabase_gif_path on exercise, cannot resolve media', { id: exercise.id, name: exercise.name });
    return null;
  }

  const mediaCacheDir = getMediaCacheDir();

  if (!mediaCacheDir) {
    // Web platform: use public URL directly (bucket is public)
    const publicUrl = getPublicStorageUrl(exercise.supabase_gif_path);
    logger.info('Using public storage URL for exercise media (web)', { path: exercise.supabase_gif_path, publicUrl });
    return { uri: publicUrl, fromCache: false };
  }

  await ensureCacheDirectory(mediaCacheDir);

  const localFileUri = `${mediaCacheDir}${exercise.supabase_gif_path}`;

  const fileInfo = await fs.getInfoAsync(localFileUri);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
    return { uri: localFileUri, fromCache: true };
  }

  // For native, download from public URL to local cache
  const publicUrl = getPublicStorageUrl(exercise.supabase_gif_path);

  try {
    await fs.downloadAsync(publicUrl, localFileUri, {
      cache: true,
    });

    return { uri: localFileUri, fromCache: false };
  } catch (error) {
    logger.error('Failed to download exercise media to cache', { error, path: exercise.supabase_gif_path });

    // Fall back to public URL directly even on native
    return { uri: publicUrl, fromCache: false };
  }
}

async function ensureCacheDirectory(mediaCacheDir: string) {
  const dirInfo = await fs.getInfoAsync(mediaCacheDir);
  if (!dirInfo.exists) {
    await fs.makeDirectoryAsync(mediaCacheDir, { intermediates: true });
  }
}

function resolveBaseCacheDir(module: FileSystemModule): string | null {
  try {
    if (module?.cacheDirectory) {
      return module.cacheDirectory;
    }

    if (module?.documentDirectory) {
      return module.documentDirectory;
    }

    return null;
  } catch (error) {
    logger.warn('Failed to resolve base cache directory', { error });
    return null;
  }
}
