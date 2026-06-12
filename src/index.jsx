import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardView from './components/Dashboard/DashboardView.jsx'
import { GameStateProvider } from './state/state.jsx'
import './index.css'

// Block pull-to-refresh on iOS Safari only when touching outside app content
document.addEventListener('touchmove', (e) => {
  if (e.target === document.body || e.target === document.documentElement) {
    e.preventDefault()
  }
}, { passive: false })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameStateProvider>
      <DashboardView />
    </GameStateProvider>
  </React.StrictMode>,
)
