# 🎲 Daggerheart GM Dashboard

A local-only web application for Game Masters to manage their Daggerheart RPG sessions with real-time player display synchronization.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the dashboard:**
   - **GM Control Panel**: `http://localhost:3000/control`
   - **Player Display**: `http://localhost:3000/display`

## Features

- **Fear Management**: Track and display fear levels
- **Countdown Tracks**: Create and manage multiple countdown timers
- **Adversary HP**: Track enemy health with damage/healing controls
- **Environment Elements**: Manage location aspects and effects
- **Live Preview**: GM sees exactly what players see in real-time
- **Auto-save**: State automatically saves every 3 seconds
- **WebSocket Sync**: Real-time updates across all connected devices

## Network Access

The server automatically detects and displays:
- Localhost URL for same-device access
- LAN IP addresses for same-network devices

## Control Token

Default: `daggerheart2024` (can be changed via `CONTROL_TOKEN` env var)

Happy gaming! 🎲✨
