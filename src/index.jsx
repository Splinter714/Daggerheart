import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardView from './components/Dashboard/DashboardView.jsx'
import { GameStateProvider } from './state/state.jsx'
import './index.css'

// Block pull-to-refresh on iOS Safari (overscroll-behavior isn't enough there)
document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) {
    let el = e.target
    while (el && el !== document.body) {
      const style = getComputedStyle(el)
      const overflowY = style.overflowY
      const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight
      if (canScroll) return
      el = el.parentElement
    }
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
