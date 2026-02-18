import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
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

/**
 * We resolve cache paths lazily.
 *
 * Why: in Expo web (and sometimes during bundling / fast refresh), parts of
 * expo-file-system can be missing/undefined. If we compute this at module load
 * time, it can crash the entire app before any screen renders.
 */
function getMediaCacheDir(): string | null {
  // Expo web doesn't provide a real file system, so always fall back to signed URLs.
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
    return null;
  }

  const mediaCacheDir = getMediaCacheDir();

  if (!mediaCacheDir) {
    const signedUrl = await createSignedUrl(exercise.supabase_gif_path);
    if (!signedUrl) {
      return null;
    }
    return { uri: signedUrl, fromCache: false, signedUrl };
  }

  await ensureCacheDirectory(mediaCacheDir);

  const localFileUri = `${mediaCacheDir}${exercise.supabase_gif_path}`;

  const fileInfo = await fs.getInfoAsync(localFileUri);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
    return { uri: localFileUri, fromCache: true };
  }

  const signedUrlResult = await createSignedUrl(exercise.supabase_gif_path);
  if (!signedUrlResult) {
    return null;
  }

  try {
    await fs.downloadAsync(signedUrlResult, localFileUri, {
      cache: true,
    });

    return { uri: localFileUri, fromCache: false };
  } catch (error) {
    logger.error('Failed to download exercise media to cache', { error, path: exercise.supabase_gif_path });
    return null;
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

async function createSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('exercise-gifs').createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    logger.error('Failed to create signed URL for exercise media', { error, path });
    return null;
  }

  return data.signedUrl;
}
