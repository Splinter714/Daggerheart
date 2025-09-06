# 🎲 Daggerheart GM Dashboard

A static web application for Game Masters to manage their Daggerheart RPG sessions with local state management.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the dashboard:**
   - **GM Dashboard**: `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Features

- **Fear Management**: Track and display fear levels
- **Countdown Tracks**: Create and manage multiple countdown timers
- **Adversary HP**: Track enemy health with damage/healing controls
- **Environment Elements**: Manage location aspects and effects
- **Damage Thresholds**: Calculate damage based on Daggerheart rules
- **Auto-save**: State automatically saves to browser localStorage
- **Mobile Responsive**: Works on all device sizes
- **Database Browser**: Full adversary and environment database

## Static Hosting

This app can be hosted on any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Deploy from the `dist` folder
- **Firebase Hosting**: `firebase deploy`

## State Management

- **localStorage**: All game state is saved to your browser
- **Private**: Each user has their own separate game state
- **Persistent**: State survives browser restarts
- **No server required**: Completely client-side

Happy gaming! 🎲✨
