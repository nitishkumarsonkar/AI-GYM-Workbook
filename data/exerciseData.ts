// Centralized exercise data — single source of truth
// Structured for easy migration to Supabase later

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

// ─── Master Exercise List ────────────────────────────────────────────

export const ALL_EXERCISES: Exercise[] = [
    // ── Chest ──
    {
        id: 1,
        name: 'Bench Press',
        category: 'gym',
        tags: ['chest', 'triceps'],
        sets: '4 sets of 8-12 reps',
        steps: [
            'Lie on the bench with your eyes under the bar.',
            'Grab the bar with a medium-width grip.',
            'Unrack the bar by straightening your arms.',
            'Lower the bar to your mid-chest.',
            'Press the bar back up until your arms are straight.',
        ],
        image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 2,
        name: 'Incline Dumbbell Press',
        category: 'gym',
        tags: ['chest', 'shoulders'],
        sets: '3 sets of 10-12 reps',
        steps: [
            'Set the bench to a 30-45 degree incline.',
            'Sit back and lift dumbbells to shoulder height.',
            'Press the dumbbells up until arms are extended.',
            'Lower slowly back to shoulder height.',
        ],
    },
    {
        id: 3,
        name: 'Cable Flyes',
        category: 'gym',
        tags: ['chest'],
        sets: '3 sets of 12-15 reps',
        steps: [
            'Stand in the center of a cable machine.',
            'Grab the handles with arms extended.',
            'Bring hands together in front of your chest.',
            'Slowly return to the starting position.',
        ],
    },

    // ── Back ──
    {
        id: 4,
        name: 'Deadlift',
        category: 'gym',
        tags: ['back', 'legs'],
        sets: '4 sets of 6-8 reps',
        steps: [
            'Stand with feet hip-width apart, bar over midfoot.',
            'Bend at hips and knees, grip the bar.',
            'Keep your back flat, chest up.',
            'Drive through your heels to stand up.',
            'Lower the bar back down with control.',
        ],
    },
    {
        id: 5,
        name: 'Pull-Ups',
        category: 'gym',
        tags: ['back', 'biceps'],
        sets: '3 sets of 8-10 reps',
        steps: [
            'Grab the bar with an overhand grip, hands shoulder-width apart.',
            'Hang with arms fully extended.',
            'Pull yourself up until your chin is over the bar.',
            'Lower yourself back down with control.',
        ],
    },
    {
        id: 6,
        name: 'Barbell Row',
        category: 'gym',
        tags: ['back'],
        sets: '4 sets of 8-10 reps',
        steps: [
            'Bend at the hips, keeping your back flat.',
            'Grab the barbell with an overhand grip.',
            'Pull the bar to your lower chest.',
            'Lower the bar back down slowly.',
        ],
    },

    // ── Legs ──
    {
        id: 7,
        name: 'Squats',
        category: 'gym',
        tags: ['legs', 'core'],
        sets: '4 sets of 8-12 reps',
        steps: [
            'Stand with feet shoulder-width apart, bar on upper back.',
            'Brace your core and keep chest up.',
            'Bend knees and hips to lower down.',
            'Go until thighs are parallel to the floor.',
            'Drive through heels to stand back up.',
        ],
    },
    {
        id: 8,
        name: 'Leg Press',
        category: 'gym',
        tags: ['legs'],
        sets: '3 sets of 10-12 reps',
        steps: [
            'Sit in the leg press machine.',
            'Place feet shoulder-width apart on the platform.',
            'Lower the platform by bending your knees.',
            'Push back up without locking your knees.',
        ],
    },
    {
        id: 9,
        name: 'Lunges',
        category: 'gym',
        tags: ['legs'],
        sets: '3 sets of 12 reps per leg',
        steps: [
            'Stand tall with feet together.',
            'Step forward with one leg.',
            'Lower your body until both knees are at 90 degrees.',
            'Push back to starting position.',
            'Repeat with the other leg.',
        ],
    },

    // ── Shoulders ──
    {
        id: 10,
        name: 'Overhead Press',
        category: 'gym',
        tags: ['shoulders'],
        sets: '4 sets of 8-10 reps',
        steps: [
            'Stand with feet shoulder-width apart.',
            'Hold the barbell at shoulder height.',
            'Press the bar overhead until arms are locked.',
            'Lower the bar back to shoulder height.',
        ],
    },
    {
        id: 11,
        name: 'Lateral Raises',
        category: 'gym',
        tags: ['shoulders'],
        sets: '3 sets of 12-15 reps',
        steps: [
            'Stand with dumbbells at your sides.',
            'Raise arms out to the sides until shoulder height.',
            'Keep a slight bend in your elbows.',
            'Lower slowly back down.',
        ],
    },

    // ── Arms ──
    {
        id: 12,
        name: 'Bicep Curls',
        category: 'gym',
        tags: ['arms', 'biceps'],
        sets: '3 sets of 10-12 reps',
        steps: [
            'Stand with dumbbells at your sides, palms facing forward.',
            'Curl the weights up toward your shoulders.',
            'Squeeze at the top.',
            'Lower slowly back down.',
        ],
    },
    {
        id: 13,
        name: 'Tricep Pushdowns',
        category: 'gym',
        tags: ['arms', 'triceps'],
        sets: '3 sets of 12-15 reps',
        steps: [
            'Stand at a cable machine with a straight bar attachment.',
            'Grab the bar with an overhand grip.',
            'Push the bar down until arms are fully extended.',
            'Slowly return to the starting position.',
        ],
    },
    {
        id: 14,
        name: 'Skull Crushers',
        category: 'gym',
        tags: ['arms', 'triceps'],
        sets: '3 sets of 10-12 reps',
        steps: [
            'Lie on a bench holding an EZ bar above your chest.',
            'Lower the bar toward your forehead by bending elbows.',
            'Keep upper arms stationary.',
            'Extend arms back to the starting position.',
        ],
    },

    // ── Core ──
    {
        id: 15,
        name: 'Plank',
        category: 'gym',
        tags: ['core'],
        sets: '3 sets of 45-60 seconds',
        steps: [
            'Get into a push-up position on your forearms.',
            'Keep your body in a straight line from head to heels.',
            'Engage your core and hold.',
            'Don\'t let your hips sag or pike up.',
        ],
    },
    {
        id: 16,
        name: 'Russian Twists',
        category: 'gym',
        tags: ['core'],
        sets: '3 sets of 20 reps',
        steps: [
            'Sit on the floor with knees bent.',
            'Lean back slightly, keeping your back straight.',
            'Hold a weight with both hands.',
            'Twist your torso to touch the weight to each side.',
        ],
    },

    // ── Cardio ──
    {
        id: 17,
        name: 'Running',
        category: 'cardio',
        tags: ['endurance', 'full body'],
        sets: '30-45 minutes',
        steps: [
            'Warm up with 5 minutes of brisk walking.',
            'Start jogging at a comfortable pace.',
            'Maintain a steady breathing rhythm.',
            'Gradually increase speed if comfortable.',
            'Cool down with 5 minutes of walking.',
        ],
    },
    {
        id: 18,
        name: 'Jump Rope',
        category: 'cardio',
        tags: ['endurance', 'coordination'],
        sets: '3 sets of 3 minutes',
        steps: [
            'Hold the rope handles at hip height.',
            'Swing the rope over your head.',
            'Jump with both feet just high enough to clear the rope.',
            'Land softly on the balls of your feet.',
            'Keep your elbows close to your body.',
        ],
    },
    {
        id: 19,
        name: 'Cycling',
        category: 'cardio',
        tags: ['endurance', 'legs'],
        sets: '30-60 minutes',
        steps: [
            'Adjust the seat height so your leg is slightly bent at the bottom.',
            'Start pedaling at a moderate pace.',
            'Add resistance for intervals.',
            'Maintain an upright posture.',
            'Cool down with 5 minutes of easy pedaling.',
        ],
    },
    {
        id: 20,
        name: 'Burpees',
        category: 'cardio',
        tags: ['full body', 'HIIT'],
        sets: '3 sets of 15 reps',
        steps: [
            'Stand with feet shoulder-width apart.',
            'Drop into a squat and place hands on the floor.',
            'Jump your feet back into a plank position.',
            'Do a push-up.',
            'Jump your feet forward to your hands.',
            'Explode upward into a jump with arms overhead.',
        ],
    },
    {
        id: 21,
        name: 'Mountain Climbers',
        category: 'cardio',
        tags: ['core', 'HIIT'],
        sets: '3 sets of 30 seconds',
        steps: [
            'Start in a plank position.',
            'Drive one knee toward your chest.',
            'Quickly switch legs.',
            'Keep your hips low and core engaged.',
            'Move as fast as you can while maintaining form.',
        ],
    },
    {
        id: 22,
        name: 'Rowing Machine',
        category: 'cardio',
        tags: ['full body', 'endurance'],
        sets: '20-30 minutes',
        steps: [
            'Sit on the rower and strap your feet in.',
            'Grab the handle with an overhand grip.',
            'Push with your legs first, then lean back slightly.',
            'Pull the handle to your lower chest.',
            'Reverse the motion: extend arms, lean forward, bend knees.',
        ],
    },
];

// ─── Default Weekly Plan ─────────────────────────────────────────────

export const DEFAULT_DAY_PLAN: DayPlan = {
    Monday: [1, 2, 3, 13],       // Chest & Triceps
    Tuesday: [4, 5, 6, 12],       // Back & Biceps
    Wednesday: [7, 8, 9, 10, 11],   // Legs & Shoulders
    Thursday: [],                    // Rest
    Friday: [1, 4, 7, 15, 16],   // Full Body
    Saturday: [17, 18, 20, 21],    // Cardio
    Sunday: [],                    // Rest
};

export const DAY_FOCUS: { [key: string]: string } = {
    Monday: 'Chest & Triceps',
    Tuesday: 'Back & Biceps',
    Wednesday: 'Legs & Shoulders',
    Thursday: 'Rest Day',
    Friday: 'Full Body',
    Saturday: 'Cardio',
    Sunday: 'Rest Day',
};

// ─── Helper Functions ────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getTodayName(): string {
    return DAYS_OF_WEEK[new Date().getDay()];
}

export function getExerciseById(id: number): Exercise | undefined {
    return ALL_EXERCISES.find((ex) => ex.id === id);
}

export function getExercisesByIds(ids: number[]): Exercise[] {
    return ids.map((id) => getExerciseById(id)).filter(Boolean) as Exercise[];
}

export function getExercisesByCategory(category: 'cardio' | 'gym'): Exercise[] {
    return ALL_EXERCISES.filter((ex) => ex.category === category);
}

export function getExercisesByTag(tag: string): Exercise[] {
    return ALL_EXERCISES.filter((ex) => ex.tags.includes(tag));
}

export function getUniqueTags(category?: 'cardio' | 'gym'): string[] {
    const exercises = category ? getExercisesByCategory(category) : ALL_EXERCISES;
    const tagSet = new Set<string>();
    exercises.forEach((ex) => ex.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
}
