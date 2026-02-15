export type Exercise = {
    id: number;
    name: string;
    category: 'cardio' | 'gym';
    tags: string[];
    sets: string;
    steps: string[];
    image_url?: string;
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
