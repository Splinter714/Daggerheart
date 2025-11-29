import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardView from './components/Dashboard/DashboardView.jsx'
import { GameStateProvider } from './state/state.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameStateProvider>
      <DashboardView />
    </GameStateProvider>
  </React.StrictMode>,
)
