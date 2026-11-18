# Firebase Setup Guide for MasteryLab Authentication

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `masterylab-auth` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" under Sign-in providers
4. Enable "Email/Password"
5. Click "Save"

## Step 3: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with nickname: "MasteryLab Website"
6. Copy the `firebaseConfig` object

## Step 4: Update auth.html

1. Open `auth.html`
2. Find this section (around line 182):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace it with your actual Firebase configuration from Step 3

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your domain: `masterylab.ch`
4. Add `localhost` for local testing (should already be there)

## Step 6: Test the Authentication

1. Open `bachata-teachers-lab.html` in your browser
2. Click any "Book and start here" button
3. You should be redirected to `auth.html`
4. Try creating a new account
5. Try signing in with the account you created
6. After successful sign in, you should be redirected to the registration page

## Security Notes

- The Firebase config in `auth.html` is safe to expose publicly
- Firebase security is handled by Firebase Authentication rules
- Consider adding email verification for production use
- Consider setting up password strength requirements

## Optional Enhancements

### Add Email Verification

In Firebase Console:
1. Go to Authentication → Templates
2. Customize the email verification template
3. Update the code in `auth.html` to send verification emails after signup

### Add Google Sign-In

1. In Firebase Console, enable Google as a sign-in provider
2. Add Google Sign-In button to `auth.html`
3. Use `signInWithPopup` from Firebase Auth

### Store User Data in Firestore

1. Enable Firestore in Firebase Console
2. Create a `users` collection
3. Store additional user profile data after signup
