import { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import {
  ensureUserProfile,
  getSessionUser,
  getUserProfile,
  signOut,
  updateUserProfile,
  UserProfile,
} from "../app/services/authService";
import { logger } from "../utils/logger";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  upsertProfile: (updates: UserProfile) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        logger.info("Auth session detected", {
          userId: initialSession.user.id,
        });
        await ensureUserProfile(initialSession.user.id);
        await fetchAndSetProfile(initialSession.user.id);
      }
      setIsLoading(false);
    };

    setup();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          logger.info("Auth session updated", {
            userId: currentSession.user.id,
          });
          ensureUserProfile(currentSession.user.id);
          fetchAndSetProfile(currentSession.user.id);
        } else {
          logger.info("Auth session cleared");
          setProfile(null);
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    setIsLoading(true);
    const currentUser = await getSessionUser();
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setUser(currentUser);
    setSession(currentSession);
    logger.info("Session refreshed", { userId: currentUser?.id ?? null });
    if (currentUser?.id) {
      await fetchAndSetProfile(currentUser.id);
    }
    setIsLoading(false);
  };

  const fetchAndSetProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await getUserProfile(userId);
      if (error) {
        logger.error("Failed to load user profile", { error, userId });
        setProfile(null);
        return;
      }
      setProfile(data as UserProfile);
      logger.info("User profile loaded", { userId });
    } catch (error) {
      logger.error("Exception loading user profile", { error, userId });
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchAndSetProfile(user.id);
  };

  const upsertProfile = async (updates: UserProfile) => {
    if (!user?.id) return;
    try {
      setProfileLoading(true);
      const { error } = await updateUserProfile(user.id, updates);
      if (error) {
        logger.error("Failed to update profile", { error, userId: user.id });
        return;
      }
      logger.info("Profile updated", { userId: user.id });
      await fetchAndSetProfile(user.id);
    } catch (error) {
      logger.error("Exception updating profile", { error, userId: user.id });
    } finally {
      setProfileLoading(false);
    }
  };

  const signOutUser = async () => {
    await signOut();
    logger.info("User signed out");
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      profile,
      profileLoading,
      refreshSession,
      refreshProfile,
      upsertProfile,
      signOutUser,
    }),
    [
      user,
      session,
      isLoading,
      profile,
      profileLoading,
      refreshSession,
      signOutUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
