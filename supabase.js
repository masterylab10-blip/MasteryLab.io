
// Import Supabase from the CDN (Available because we added the script tag in HTML)
// We will assume the script tag is added in the HTML files: 
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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

// Helper: Logout
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    return error;
}
