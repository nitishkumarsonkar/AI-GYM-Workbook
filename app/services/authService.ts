import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_CREDENTIALS_KEY = '@gym_guest_credentials';


const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSessionUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
};

export const ensureAuthenticated = async () => {
    try {
        // 1. Check if we already have a session
        const sessionUser = await getSessionUser();
        if (sessionUser) {
            console.log('User already authenticated:', sessionUser.id);
            return sessionUser;
        }

        // 1.5 Prefer anonymous auth when enabled in Supabase
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (!anonError && anonData.user) {
            const anonUser = await getSessionUser();
            if (anonUser) return anonUser;
        }

        // 2. Try to recover existing guest credentials
        const storedCreds = await AsyncStorage.getItem(GUEST_CREDENTIALS_KEY);
        if (storedCreds) {
            const { email, password } = JSON.parse(storedCreds);
            console.log('Found stored guest credentials, signing in...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (!error && data.user) {
                const signedInUser = await getSessionUser();
                if (signedInUser) return signedInUser;
            }
            console.warn('Stored credentials failed, creating new user...', error?.message);
        }

        // 3. Create a new guest user with retry logic
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            // Keep a conservative email format to satisfy strict validators.
            const randomToken = Math.random().toString(36).slice(2, 10);
            const email = `guest.${Date.now()}.${randomToken}@gymapp.dev`;
            const password = `pass${Math.random().toString(36).slice(2, 12)}`;

            console.log(`Creating new guest user (Attempt ${attempt + 1}/${MAX_RETRIES}):`, email);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (!error && data.user) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (!signInError && signInData.user) {
                    // Persist only credentials that can establish a real session.
                    await AsyncStorage.setItem(GUEST_CREDENTIALS_KEY, JSON.stringify({ email, password }));
                    const signedInUser = await getSessionUser();
                    if (signedInUser) return signedInUser;
                }

                console.warn('Guest user created but sign-in failed:', signInError?.message);
            }

            // Check if error is rate limit related (429)
            if (error?.status === 429) {
                const waitTime = BASE_DELAY * Math.pow(2, attempt);
                console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }

            console.error('Error creating guest user:', error);
            // If it's not a rate limit error, maybe we shouldn't retry? 
            // Stick to retrying only on 429 or network errors generally, but for simplicity here we retry on 429.
            // If other error, break loop
            break;
        }

        return null;
    } catch (e) {
        console.error('Auth error:', e);
        return null;
    }
};
