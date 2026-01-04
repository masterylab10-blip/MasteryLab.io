
// Import Supabase from the CDN (Available because we added the script tag in HTML)
// We will assume the script tag is added in the HTML files: 
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const SUPABASE_URL = 'https://enrxmbysgqhyujbdamoa.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_gfFO5p9hUe2UIoGn3dRYWg_bDqKgbSj';

    // Initialize the client with safety check
    let supabase;
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase SDK not loaded inside supabase.js. Checking if script tag exists...");
    }

    // Helper functions attached to window
    window.registerUser = async function (email, password, metadata) {
        if (!supabase) return { error: { message: "Supabase not initialized" } };
        return await supabase.auth.signUp({
            email, password, options: { data: metadata }
        });
    }

    window.loginUser = async function (email, password) {
        if (!supabase) return { error: { message: "Supabase not initialized" } };
        return await supabase.auth.signInWithPassword({ email, password });
    }

    window.getCurrentUser = async function () {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    window.requireAuth = async function () {
        const user = await window.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    }

    window.logoutUser = async function () {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.href = 'index.html';
        return error;
    }

    console.log("Supabase helpers initialized.");
});
