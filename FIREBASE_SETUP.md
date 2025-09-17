# Firebase Setup Guide

## Quick Setup Steps

### 1. Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get started" (free)
3. Sign in with your Google account
4. Click "Create a project"
5. Enter project name: `daggerheart-gm-dashboard`
6. Enable Google Analytics (optional)
7. Click "Create project"

### 2. Enable Realtime Database
1. In your Firebase project, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to you)
5. Click "Done"

### 3. Get Configuration
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Enter app nickname: `daggerheart-app`
6. Click "Register app"
7. Copy the `firebaseConfig` object

### 4. Update Your App
1. Open `src/firebase/config.js`
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Set Database Rules (Important!)
1. Go to "Realtime Database" → "Rules" tab
2. Replace the rules with:

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

## How It Works

### GM (Game Master)
1. **Create Session**: Click "Create New Session" → Gets unique Session ID
2. **Share Session**: Click "QR" button → Shows QR code for players
3. **Manage Game**: All changes sync to Firebase automatically
4. **Players Join**: Players scan QR code or enter Session ID

### Players
1. **Join Session**: Enter Session ID or scan QR code
2. **View Game**: See fear and countdowns in real-time
3. **Read-Only**: Cannot modify anything, only view
4. **Auto-Sync**: Changes appear instantly without refreshing

## Security Notes

- **Test Mode**: Database is open for development
- **Production**: Consider adding authentication for production use
- **Sessions**: Each session has a unique ID, players can only join existing sessions
- **Data**: Game state is stored temporarily, sessions can be deleted

## Troubleshooting

### "Permission denied" error
- Check your database rules are set correctly
- Make sure you're using the right project

### "Session not found" error
- Verify the Session ID is correct
- Check if the GM is still connected

### QR code not working
- Make sure the app is deployed and accessible
- Check if the URL is correct

## Cost
- **Free tier**: 1GB storage, 10GB/month bandwidth, 100 concurrent connections
- **Perfect for**: Small to medium D&D groups
- **No credit card required** for free tier
