import { supabase } from '../../lib/supabase';
import { DayPlan, DEFAULT_DAY_PLAN, Exercise } from '../types';
import { getSessionUser } from './authService';
import { logger } from '../../utils/logger';

// ─── Exercise Service ────────────────────────────────────────────────

export const fetchExercises = async (): Promise<Exercise[]> => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('id');

    if (error) {
        logger.error('Error fetching exercises', { error });
        return [];
    }

    logger.info('Exercises fetched', { count: data?.length ?? 0 });
    return data as Exercise[];
};

// ─── Plan Service ───────────────────────────────────────────────────

export const fetchUserPlan = async (): Promise<DayPlan> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        // If no user, return default plan (or handle anonymous/local storage)
        if (!session?.user) {
            logger.info('No user session found, using default plan');
            return DEFAULT_DAY_PLAN;
        }

        const { data, error } = await supabase
            .from('weekly_plans')
            .select('day_name, exercise_id')
            .eq('user_id', session.user.id);

        if (error) {
            logger.error('Error fetching plan', { error });
            return DEFAULT_DAY_PLAN;
        }

        if (!data || data.length === 0) {
            return DEFAULT_DAY_PLAN;
        }

        // Transform flat list to DayPlan object
        const plan: DayPlan = { ...DEFAULT_DAY_PLAN };

        // Clear default arrays before populating from DB to avoid duplicates/merging issues
        Object.keys(plan).forEach(key => plan[key] = []);

        data.forEach((row: { day_name: string; exercise_id: number }) => {
            const normalizedId = Number(row.exercise_id);
            if (!Number.isFinite(normalizedId)) {
                logger.warn('Skipping invalid exercise id from plan', { row });
                return;
            }

            if (plan[row.day_name]) {
                plan[row.day_name].push(normalizedId);
            }
        });

        logger.info('Fetched user plan', { userId: session.user.id });
        return plan;
    } catch (e) {
        logger.error('Exception fetching plan', { error: e });
        return DEFAULT_DAY_PLAN;
    }
};

export const addExerciseToPlan = async (day: string, exerciseId: number) => {
    const user = await getSessionUser();
    if (!user) {
        logger.warn('Cannot add to plan: no authenticated session.');
        return;
    }

    const { error } = await supabase
        .from('weekly_plans')
        .insert({
            user_id: user.id,
            day_name: day,
            exercise_id: exerciseId
        });

    if (error) {
        logger.error('Error adding to plan', { error, day, exerciseId });
    } else {
        logger.info('Exercise added to plan', { day, exerciseId, userId: user.id });
    }
};

export const removeExerciseFromPlan = async (day: string, exerciseId: number) => {
    const user = await getSessionUser();
    if (!user) {
        logger.warn('Cannot remove from plan: no authenticated session.');
        return;
    }

    const { error } = await supabase
        .from('weekly_plans')
        .delete()
        .eq('user_id', user.id)
        .eq('day_name', day)
        .eq('exercise_id', exerciseId);

    if (error) {
        logger.error('Error removing from plan', { error, day, exerciseId });
    } else {
        logger.info('Exercise removed from plan', { day, exerciseId, userId: user.id });
    }
};
