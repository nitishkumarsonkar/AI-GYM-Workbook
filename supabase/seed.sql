-- Seed/demo data for local/dev environments.
--
-- IMPORTANT:
-- - Keep seed data separate from migrations.
-- - All DDL (tables, triggers, RLS) should live in supabase/migrations/*.sql.
INSERT INTO
    public.exercises (id, name, category, tags, sets, steps, image_url)
VALUES
    (
        1,
        'Bench Press',
        'gym',
        ARRAY ['chest', 'triceps'],
        '4 sets of 8-12 reps',
        ARRAY ['Lie on the bench with your eyes under the bar.', 'Grab the bar with a medium-width grip.', 'Unrack the bar by straightening your arms.', 'Lower the bar to your mid-chest.', 'Press the bar back up until your arms are straight.'],
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'
    ),
    (
        2,
        'Incline Dumbbell Press',
        'gym',
        ARRAY ['chest', 'shoulders'],
        '3 sets of 10-12 reps',
        ARRAY ['Set the bench to a 30-45 degree incline.', 'Sit back and lift dumbbells to shoulder height.', 'Press the dumbbells up until arms are extended.', 'Lower slowly back to shoulder height.'],
        NULL
    ),
    (
        3,
        'Cable Flyes',
        'gym',
        ARRAY ['chest'],
        '3 sets of 12-15 reps',
        ARRAY ['Stand in the center of a cable machine.', 'Grab the handles with arms extended.', 'Bring hands together in front of your chest.', 'Slowly return to the starting position.'],
        NULL
    ),
    (
        4,
        'Deadlift',
        'gym',
        ARRAY ['back', 'legs'],
        '4 sets of 6-8 reps',
        ARRAY ['Stand with feet hip-width apart, bar over midfoot.', 'Bend at hips and knees, grip the bar.', 'Keep your back flat, chest up.', 'Drive through your heels to stand up.', 'Lower the bar back down with control.'],
        NULL
    ),
    (
        5,
        'Pull-Ups',
        'gym',
        ARRAY ['back', 'biceps'],
        '3 sets of 8-10 reps',
        ARRAY ['Grab the bar with an overhand grip, hands shoulder-width apart.', 'Hang with arms fully extended.', 'Pull yourself up until your chin is over the bar.', 'Lower yourself back down with control.'],
        NULL
    ),
    (
        6,
        'Barbell Row',
        'gym',
        ARRAY ['back'],
        '4 sets of 8-10 reps',
        ARRAY ['Bend at the hips, keeping your back flat.', 'Grab the barbell with an overhand grip.', 'Pull the bar to your lower chest.', 'Lower the bar back down slowly.'],
        NULL
    ),
    (
        7,
        'Squats',
        'gym',
        ARRAY ['legs', 'core'],
        '4 sets of 8-12 reps',
        ARRAY ['Stand with feet shoulder-width apart, bar on upper back.', 'Brace your core and keep chest up.', 'Bend knees and hips to lower down.', 'Go until thighs are parallel to the floor.', 'Drive through heels to stand back up.'],
        NULL
    ),
    (
        8,
        'Leg Press',
        'gym',
        ARRAY ['legs'],
        '3 sets of 10-12 reps',
        ARRAY ['Sit in the leg press machine.', 'Place feet shoulder-width apart on the platform.', 'Lower the platform by bending your knees.', 'Push back up without locking your knees.'],
        NULL
    ),
    (
        9,
        'Lunges',
        'gym',
        ARRAY ['legs'],
        '3 sets of 12 reps per leg',
        ARRAY ['Stand tall with feet together.', 'Step forward with one leg.', 'Lower your body until both knees are at 90 degrees.', 'Push back to starting position.', 'Repeat with the other leg.'],
        NULL
    ),
    (
        10,
        'Overhead Press',
        'gym',
        ARRAY ['shoulders'],
        '4 sets of 8-10 reps',
        ARRAY ['Stand with feet shoulder-width apart.', 'Hold the barbell at shoulder height.', 'Press the bar overhead until arms are locked.', 'Lower the bar back to shoulder height.'],
        NULL
    ),
    (
        11,
        'Lateral Raises',
        'gym',
        ARRAY ['shoulders'],
        '3 sets of 12-15 reps',
        ARRAY ['Stand with dumbbells at your sides.', 'Raise arms out to the sides until shoulder height.', 'Keep a slight bend in your elbows.', 'Lower slowly back down.'],
        NULL
    ),
    (
        12,
        'Bicep Curls',
        'gym',
        ARRAY ['arms', 'biceps'],
        '3 sets of 10-12 reps',
        ARRAY ['Stand with dumbbells at your sides, palms facing forward.', 'Curl the weights up toward your shoulders.', 'Squeeze at the top.', 'Lower slowly back down.'],
        NULL
    ),
    (
        13,
        'Tricep Pushdowns',
        'gym',
        ARRAY ['arms', 'triceps'],
        '3 sets of 12-15 reps',
        ARRAY ['Stand at a cable machine with a straight bar attachment.', 'Grab the bar with an overhand grip.', 'Push the bar down until arms are fully extended.', 'Slowly return to the starting position.'],
        NULL
    ),
    (
        14,
        'Skull Crushers',
        'gym',
        ARRAY ['arms', 'triceps'],
        '3 sets of 10-12 reps',
        ARRAY ['Lie on a bench holding an EZ bar above your chest.', 'Lower the bar toward your forehead by bending elbows.', 'Keep upper arms stationary.', 'Extend arms back to the starting position.'],
        NULL
    ),
    (
        15,
        'Plank',
        'gym',
        ARRAY ['core'],
        '3 sets of 45-60 seconds',
        ARRAY ['Get into a push-up position on your forearms.', 'Keep your body in a straight line from head to heels.', 'Engage your core and hold.', 'Don''t let your hips sag or pike up.'],
        NULL
    ),
    (
        16,
        'Russian Twists',
        'gym',
        ARRAY ['core'],
        '3 sets of 20 reps',
        ARRAY ['Sit on the floor with knees bent.', 'Lean back slightly, keeping your back straight.', 'Hold a weight with both hands.', 'Twist your torso to touch the weight to each side.'],
        NULL
    ),
    (
        17,
        'Running',
        'cardio',
        ARRAY ['endurance', 'full body'],
        '30-45 minutes',
        ARRAY ['Warm up with 5 minutes of brisk walking.', 'Start jogging at a comfortable pace.', 'Maintain a steady breathing rhythm.', 'Gradually increase speed if comfortable.', 'Cool down with 5 minutes of walking.'],
        NULL
    ),
    (
        18,
        'Jump Rope',
        'cardio',
        ARRAY ['endurance', 'coordination'],
        '3 sets of 3 minutes',
        ARRAY ['Hold the rope handles at hip height.', 'Swing the rope over your head.', 'Jump with both feet just high enough to clear the rope.', 'Land softly on the balls of your feet.', 'Keep your elbows close to your body.'],
        NULL
    ),
    (
        19,
        'Cycling',
        'cardio',
        ARRAY ['endurance', 'legs'],
        '30-60 minutes',
        ARRAY ['Adjust the seat height so your leg is slightly bent at the bottom.', 'Start pedaling at a moderate pace.', 'Add resistance for intervals.', 'Maintain an upright posture.', 'Cool down with 5 minutes of easy pedaling.'],
        NULL
    ),
    (
        20,
        'Burpees',
        'cardio',
        ARRAY ['full body', 'HIIT'],
        '3 sets of 15 reps',
        ARRAY ['Stand with feet shoulder-width apart.', 'Drop into a squat and place hands on the floor.', 'Jump your feet back into a plank position.', 'Do a push-up.', 'Jump your feet forward to your hands.', 'Explode upward into a jump with arms overhead.'],
        NULL
    ),
    (
        21,
        'Mountain Climbers',
        'cardio',
        ARRAY ['core', 'HIIT'],
        '3 sets of 30 seconds',
        ARRAY ['Start in a plank position.', 'Drive one knee toward your chest.', 'Quickly switch legs.', 'Keep your hips low and core engaged.', 'Move as fast as you can while maintaining form.'],
        NULL
    ),
    (
        22,
        'Rowing Machine',
        'cardio',
        ARRAY ['full body', 'endurance'],
        '20-30 minutes',
        ARRAY ['Sit on the rower and strap your feet in.', 'Grab the handle with an overhand grip.', 'Push with your legs first, then lean back slightly.', 'Pull the handle to your lower chest.', 'Reverse the motion: extend arms, lean forward, bend knees.'],
        NULL
    ) ON CONFLICT (id) DO NOTHING;