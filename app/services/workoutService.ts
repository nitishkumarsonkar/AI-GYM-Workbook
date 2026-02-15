import { supabase } from '../../lib/supabase';
import { DayPlan, DEFAULT_DAY_PLAN, Exercise } from '../types';

// ─── Exercise Service ────────────────────────────────────────────────

export const fetchExercises = async (): Promise<Exercise[]> => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error fetching exercises:', error);
        return [];
    }

    return data as Exercise[];
};

// ─── Plan Service ───────────────────────────────────────────────────

export const fetchUserPlan = async (): Promise<DayPlan> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        // If no user, return default plan (or handle anonymous/local storage)
        if (!session?.user) {
            console.log('No user session found, using default plan');
            return DEFAULT_DAY_PLAN;
        }

        const { data, error } = await supabase
            .from('weekly_plans')
            .select('day_name, exercise_id')
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error fetching plan:', error);
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
            if (plan[row.day_name]) {
                plan[row.day_name].push(row.exercise_id);
            }
        });

        return plan;
    } catch (e) {
        console.error('Exception fetching plan:', e);
        return DEFAULT_DAY_PLAN;
    }
};

export const addExerciseToPlan = async (day: string, exerciseId: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.warn('Cannot add to plan: No user session found.');
        return;
    }

    const { error } = await supabase
        .from('weekly_plans')
        .insert({
            user_id: session.user.id,
            day_name: day,
            exercise_id: exerciseId
        });

    if (error) {
        console.error('Error adding to plan:', error);
    }
};

export const removeExerciseFromPlan = async (day: string, exerciseId: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.warn('Cannot remove from plan: No user session found.');
        return;
    }

    const { error } = await supabase
        .from('weekly_plans')
        .delete()
        .eq('user_id', session.user.id)
        .eq('day_name', day)
        .eq('exercise_id', exerciseId);

    if (error) {
        console.error('Error removing from plan:', error);
    }
};
