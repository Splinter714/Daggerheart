# Quick Firebase Setup (5 minutes)

## Step 1: Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get started" (free)
3. Sign in with Google account
4. Click "Create a project"
5. Name: `daggerheart-gm-dashboard`
6. Enable Google Analytics: **No** (optional)
7. Click "Create project"

## Step 2: Enable Realtime Database
1. Click "Realtime Database" in left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select location closest to you
5. Click "Done"

## Step 3: Get Your Config
1. Click gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll to "Your apps" section
4. Click web icon `</>`
5. App nickname: `daggerheart-app`
6. Click "Register app"
7. **Copy the `firebaseConfig` object**

## Step 4: Update Your App
1. Open `src/firebase/config.js`
2. Replace the placeholder config with your real config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "daggerheart-gm-dashboard.firebaseapp.com",
  databaseURL: "https://daggerheart-gm-dashboard-default-rtdb.firebaseio.com",
  projectId: "daggerheart-gm-dashboard",
  storageBucket: "daggerheart-gm-dashboard.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Set Database Rules
1. Go to "Realtime Database" → "Rules" tab
2. Replace rules with:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

3. Click "Publish"

## Step 6: Test
1. Refresh your app
2. Click "Session" button
3. Should create session and show QR code!

## Troubleshooting
- **Still getting errors?** Check console for specific Firebase errors
- **Permission denied?** Make sure database rules are set correctly
- **Can't find project?** Make sure you're in the right Firebase project

## Cost
- **Free tier**: 1GB storage, 10GB/month bandwidth
- **Perfect for**: Small D&D groups
- **No credit card required**
