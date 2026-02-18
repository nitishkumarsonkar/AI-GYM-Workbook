export type Exercise = {
    id: number;
    name: string;
    category: 'cardio' | 'gym';
    tags: string[];
    sets: string;
    steps: string[];
    image_url?: string;
    instructions?: string[];
    target_muscle?: string | null;
    supabase_gif_path?: string | null;
    last_synced_at?: string | null;
};

export type GoalType =
    | 'mass_gain'
    | 'fat_loss'
    | 'muscle_gain'
    | 'strength'
    | 'endurance'
    | 'mobility';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type IntensityLevel = 'low' | 'moderate' | 'high';

export type WorkoutLog = {
    id: string;
    user_id: string;
    performed_at: string; // YYYY-MM-DD
    exercise_id: number;
    sets: number | null;
    reps: number | null;
    intensity: IntensityLevel | null;
    created_at: string;
};

export type GoalRecommendation = {
    name: string;
    category: 'gym' | 'cardio' | 'mobility' | 'mixed';
    primaryMuscles?: string[];
    equipment?: string[];
    sets?: string;
    duration?: string;
    steps?: string[];
    safetyTips?: string[];
    rationale?: string;
};

export type DayPlan = {
    [dayName: string]: number[]; // exercise IDs
};

export const DEFAULT_DAY_PLAN: DayPlan = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
};

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


export const DAY_FOCUS: { [key: string]: string } = {
    Monday: 'Chest & Triceps',
    Tuesday: 'Back & Biceps',
    Wednesday: 'Legs & Shoulders',
    Thursday: 'Rest Day',
    Friday: 'Full Body',
    Saturday: 'Cardio',
    Sunday: 'Rest Day',
};

export function getTodayName(): string {
    return DAYS_OF_WEEK[new Date().getDay()];
}
