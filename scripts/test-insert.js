
const { createClient } = require('@supabase/supabase-js');

// Mock AsyncStorage for Node.js environment
const AsyncStorage = {
    getItem: async (key) => null,
    setItem: async (key, value) => { },
};

const supabaseUrl = 'https://vuhqenmaiwbcuoceaubw.supabase.co';
const supabaseAnonKey = 'sb_publishable_zBcaKjBu-s2wR4ETbb3PFw_lhqkb6V5';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // Don't persist session in node script
    }
});

async function testInsert() {
    console.log('1. Attempting to sign up a UNIQUE user...');

    // Use a truly unique email to avoid "User already registered" errors if we were hitting that (though 429 suggests rate limit)
    // BUT 429 "over_email_send_rate_limit" means we are sending too many confirmation emails?
    // If email confirmation is ON, Supabase sends an email. If we do this too much, we get blocked.
    // We should try to use a specific user if known, OR hope the rate limit expires.

    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth Error:', authError);
        // If rate limited, we can't proceed with a NEW user.
        // Try to login with a known user? (I don't have credentials for one)
        return;
    }

    const userId = authData.user.id;
    console.log('User created:', userId);

    console.log('2. Attempting to insert into weekly_plans...');
    const { data, error } = await supabase
        .from('weekly_plans')
        .insert({
            user_id: userId,
            day_name: 'Monday',
            exercise_id: 1
        })
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Success! Inserted row:', data);
    }
}

testInsert();
