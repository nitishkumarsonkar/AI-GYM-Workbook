
const { createClient } = require('@supabase/supabase-js');

// Mock AsyncStorage
const AsyncStorage = {
    getItem: async (key) => null,
    setItem: async (key, value) => { },
};

const supabaseUrl = 'https://vuhqenmaiwbcuoceaubw.supabase.co';
const supabaseAnonKey = 'sb_publishable_zBcaKjBu-s2wR4ETbb3PFw_lhqkb6V5';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        persistSession: false,
    }
});

async function testAnon() {
    console.log('Testing signInAnonymously...');
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
        console.log('Anonymous sign-in failed (likely disabled):', error.message);
    } else {
        console.log('Anonymous sign-in SUCCESS!', data.user.id);
    }
}

testAnon();
