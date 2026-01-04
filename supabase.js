
// Import Supabase from the CDN (Available because we added the script tag in HTML)
// We will assume the script tag is added in the HTML files: 
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://enrxmbysgqhyujbdamoa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gfFO5p9hUe2UIoGn3dRYWg_bDqKgbSj';

// Initialize the client with safety check
let supabase;
if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase SDK not loaded. Check your internet connection or script tags.");
    alert("Error: Supabase SDK could not be loaded.");
}

// Helper function to handle Registration
window.registerUser = async function (email, password, metadata) {
    if (!supabase) return { error: { message: "Supabase not initialized" } };
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
window.loginUser = async function (email, password) {
    if (!supabase) return { error: { message: "Supabase not initialized" } };
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

// Helper: Check if user is logged in
window.getCurrentUser = async function () {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper: Protect Routes (Redirect if not logged in)
window.requireAuth = async function () {
    const user = await window.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Helper: Logout
window.logoutUser = async function () {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    }
    return error;
}
