import React from 'react'
import { BookOpen, X } from 'lucide-react'

const FloatingMenu = ({
  onToggle,
  isOpen
}) => {
  // Detect if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 window.navigator.standalone === true ||
                 document.referrer.includes('android-app://')

  const buttonStyle = {
    position: 'fixed',
    bottom: isPWA ? 'calc(60px + env(safe-area-inset-bottom) + 2rem)' : 'calc(60px + env(safe-area-inset-bottom) + 1rem)',
    right: '1rem',
    zIndex: 1100,
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: isOpen ? 'var(--red)' : 'var(--bg-secondary)',
    border: '2px solid var(--border)',
    color: isOpen ? 'white' : 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease'
  }

  return (
    <button
      onClick={onToggle}
      style={buttonStyle}
      title={isOpen ? 'Close Encounter Builder' : 'Open Encounter Builder'}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'var(--purple)'
          e.currentTarget.style.color = 'white'
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'var(--bg-secondary)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
    >
      {isOpen ? <X size={24} /> : <BookOpen size={24} />}
    </button>
  )
}

export default FloatingMenu
