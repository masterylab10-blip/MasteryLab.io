
// Import Supabase from the CDN (Available because we added the script tag in HTML)
// We will assume the script tag is added in the HTML files: 
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://enrxmbysgqhyujbdamoa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gfFO5p9hUe2UIoGn3dRYWg_bDqKgbSj';

// Initialize the client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to handle Registration
async function registerUser(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: metadata // Stores first_name, city, role, etc.
        }
    });
    return { data, error };
}

// Helper function to handle Login
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

// Helper: Check if user is logged in
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper: Protect Routes (Redirect if not logged in)
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Helper: Logout
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    }
    return error;
}
