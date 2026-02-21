import { supabase } from '../../lib/supabase';

export const getSessionUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signOut = () => supabase.auth.signOut();

export type UserProfile = {
  display_name?: string | null;
  avatar_url?: string | null;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  goals?: string[] | null;
  age?: number | null;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null;
  bio?: string | null;
  note?: string | null;
};

export const ensureUserProfile = (userId: string, profile: UserProfile = {}) => {
  return supabase
    .from('users')
    .upsert({ id: userId, ...profile }, { onConflict: 'id' });
};

export const getUserProfile = async (userId: string) => {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
};

export const updateUserProfile = async (userId: string, profile: UserProfile) => {
  return supabase
    .from('users')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId);
};
