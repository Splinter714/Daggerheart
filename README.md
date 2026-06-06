# Daggerheart GM Dashboard

A web-based GM dashboard for running Daggerheart RPG sessions. Built with React + Vite, deployed to GitHub Pages.

**Live:** https://splinter714.github.io/Daggerheart/

## Features

- **Adversary tracking** — HP/stress management, damage input, threshold calculations, minion grouping
- **Adversary browser** — full database with search and tier/type filtering, custom adversary creator
- **Encounter receipt** — party size, battle point budget, line-item adversary counts with BP adjustments
- **Countdowns** — create and track countdowns up to 100 pips with 5-pip grouping
- **Environment tracking** — location effects and environmental aspects
- **Fear & Hope** — simple fear/hope counters
- **Persistent state** — game state saves automatically across sessions
- **Drag & drop** — reorder cards with touch-friendly drag controls
- **Mobile support** — bottom NavRail on narrow screens, responsive layout

## Dev

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build to ../dist
npm run deploy    # build + push to gh-pages
```

## Stack

React, Vite, dnd-kit, Lucide icons. No backend — all state in localStorage.

## License

Includes materials from the Daggerheart SRD 1.0 © Critical Role, LLC under the DPCGL License. Unofficial, not endorsed by Darrington Press or Critical Role.
