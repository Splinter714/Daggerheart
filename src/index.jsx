import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardView from './components/Dashboard/DashboardView.jsx'
import { GameStateProvider } from './state/state.jsx'
import './index.css'

// Block pull-to-refresh on iOS Safari (overscroll-behavior isn't enough there)
document.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 1) return
  let el = e.target
  while (el && el !== document.body) {
    const style = getComputedStyle(el)
    const scrollable = (v) => v === 'auto' || v === 'scroll'
    if (scrollable(style.overflowY) && el.scrollHeight > el.clientHeight) return
    if (scrollable(style.overflowX) && el.scrollWidth > el.clientWidth) return
    el = el.parentElement
  }
  e.preventDefault()
}, { passive: false })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameStateProvider>
      <DashboardView />
    </GameStateProvider>
  </React.StrictMode>,
)
