import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardView from './components/Dashboard/DashboardView.jsx'
import { GameStateProvider } from './state/state.jsx'
import './index.css'

// Block pull-to-refresh on iOS Safari without interfering with horizontal scroll
let _ptrStartX = 0
let _ptrStartY = 0
document.addEventListener('touchstart', (e) => {
  _ptrStartX = e.touches[0].clientX
  _ptrStartY = e.touches[0].clientY
}, { passive: true })

document.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 1) return
  const dx = Math.abs(e.touches[0].clientX - _ptrStartX)
  const dy = e.touches[0].clientY - _ptrStartY
  // Gesture is more horizontal than vertical — never block it
  if (dx > Math.abs(dy)) return
  // Gesture is moving upward — pull-to-refresh can't trigger, leave it alone
  if (dy <= 0) return
  // Downward vertical gesture: block unless inside a scrollable container
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
