# Daggerheart GM Dashboard

A modern, mobile-optimized web application for Game Masters to manage their Daggerheart RPG sessions with intelligent state management and intuitive UX.

## Features

### Core Game Management
- **Smart Countdown System**: Create countdowns up to 100 pips with intelligent 5-pip grouping for easy reading
- **Adversary Tracking**: Complete HP/stress management with damage input system and threshold calculations
- **Environment Management**: Track location effects and environmental aspects
- **Fear & Hope Tracking**: Simple fear/hope countdowns with advancement triggers

### Mobile-First Design
- **Swipeable Drawers**: Smooth mobile navigation with swipe-to-close gestures
- **Touch-Optimized**: All interactions work perfectly on mobile devices
- **Responsive Layout**: Adapts seamlessly from phone to desktop
- **Pull-to-Refresh Prevention**: Smart prevention of accidental page refreshes

### Modern UX
- **Intuitive Icons**: Pencil for edit mode, trashcan for delete, wrench for tools
- **Smart Grouping**: Countdown pips automatically group in sets of 5 for readability
- **Persistent State**: Game state and filters save automatically across sessions
- **Drag & Drop**: Reorder adversaries and environments with touch-friendly drag controls

### Database Integration
- **Full Database Browser**: Browse complete adversary and environment databases
- **Smart Filtering**: Persistent filters with search and tier/type filtering
- **Quick Add**: Add items directly from database to your game
- **Custom Creation**: Create custom adversaries and environments

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
   - **Live Demo**: [https://splinter714.github.io/Daggerheart/](https://splinter714.github.io/Daggerheart/)

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   ```bash
   ./deploy.sh
   ```

## Architecture

### Project Structure
```
src/
├── components/
│   ├── browser/          # Database browsing components
│   ├── cards/            # Card display components
│   ├── controls/         # UI controls (buttons, badges)
│   ├── countdown/        # Countdown management
│   ├── editor/           # Creation/editing forms
│   ├── game/             # Game board sections
│   ├── panels/           # Main layout panels
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── state/                # State management
└── utils/                # Utility functions
```

### Tech Stack
- **React 18** with modern hooks and concurrent features
- **Vite** for fast development and optimized builds
- **Lucide React** for consistent iconography
- **CSS Variables** for theming and customization
- **localStorage** for persistent state management

## Mobile Experience

The app is designed mobile-first with several key optimizations:

- **Swipe Navigation**: Swipe drawers open/close naturally
- **Touch Gestures**: All interactions optimized for touch
- **Responsive Design**: Adapts to any screen size
- **Performance**: Optimized for mobile devices
- **Offline Ready**: Works without internet connection

## Usage Guide

### Countdown Management
- **Create**: Use the "+" button in countdown sections
- **Advance**: Use Rest/Crit Success buttons or manual +/- controls
- **Smart Grouping**: Pips automatically group in sets of 5 for easy counting
- **Types**: Standard, Progress, Consequence, Long-term, Fear, Hope

### Adversary Tracking
- **Add**: Browse database or create custom adversaries
- **Damage**: Click difficulty shield for damage input system
- **HP/Stress**: Tap pips to increment/decrement
- **Reorder**: Drag to reorder in edit mode

### Environment Management
- **Add**: Browse database or create custom environments
- **Effects**: Track environmental effects and aspects
- **Reorder**: Drag to reorder in edit mode

## Deployment

This app can be hosted on any static hosting service:

- **GitHub Pages**: `./deploy.sh` (configured)
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **Firebase Hosting**: `firebase deploy`

## Contributing

We welcome contributions! Check out our [GitHub Issues](https://github.com/Splinter714/Daggerheart/issues) for areas that need work:

- **UX Improvements**: Better mobile interactions, design refinements
- **Feature Enhancements**: New functionality and game mechanics
- **Performance**: Optimization and code improvements
- **Accessibility**: Better a11y support

## Privacy & Data

- **Local Storage**: All data stays in your browser
- **No Tracking**: No analytics or data collection
- **Private**: Each user has their own separate game state
- **Offline**: Works without internet connection

## Recent Updates

- **Smart Countdown Grouping**: 5-pip groups for better readability
- **Mobile Optimization**: Smooth swipe gestures and touch interactions
- **Component Refactor**: Organized, modular codebase
- **Persistent Filters**: Browser filters save across sessions
- **Damage Input System**: Restored with threshold calculations
- **Icon Updates**: Intuitive pencil/trashcan/wrench icons
- **Performance**: Optimized rendering and state management

---

Happy gaming!

*Built with love for the Daggerheart community*

---

## Daggerheart™ Compatibility

![Community Content Logo](assets/logos/Darrington%20Press%20Community%20Content%20Logos/Daggerheart/PNGs/DH_CGL_logos_final_full_color.png)

This project uses only **Public Game Content** from the **Daggerheart SRD 1.0** and follows the
**Darrington Press Community Gaming License (DPCGL)**.

> This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. There are no previous modifications by others.

- The DPCGL (PDF) is included at `assets/legal/Darrington-Press-CGL.pdf`.
- This project is **unofficial** and **not endorsed** by Darrington Press or Critical Role.
- Per the DPCGL, "Daggerheart" is not used in the product title; compatibility is stated here in descriptive text.

