import React, { useState, useEffect } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import HelpButton from './HelpButton'
import DeleteClear from './DeleteClear'

const FloatingMenu = ({
  adversaries,
  environments,
  countdowns,
  deleteAdversary,
  deleteEnvironment,
  deleteCountdown,
  isClearMode,
  setIsClearMode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showHelpFlyout, setShowHelpFlyout] = useState(false)
  const [showDeleteFlyout, setShowDeleteFlyout] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.floating-menu-container')) {
        setIsOpen(false)
        setShowHelpFlyout(false)
        setShowDeleteFlyout(false)
        // Exit clear mode when clicking outside
        if (isClearMode) {
          setIsClearMode(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isClearMode, setIsClearMode])

  // Close popups when menu closes
  useEffect(() => {
    if (!isOpen) {
      setShowHelpFlyout(false)
      setShowDeleteFlyout(false)
      // Exit clear mode when menu closes
      if (isClearMode) {
        setIsClearMode(false)
      }
    }
  }, [isOpen, isClearMode, setIsClearMode])

  // Ensure only one popup is open at a time
  const handleHelpFlyoutChange = (isOpen) => {
    setShowHelpFlyout(isOpen)
    if (isOpen) {
      setShowDeleteFlyout(false) // Close delete flyout if help opens
      // Exit clear mode when switching to help
      if (isClearMode) {
        setIsClearMode(false)
      }
    }
  }

  const handleDeleteFlyoutChange = (isOpen) => {
    setShowDeleteFlyout(isOpen)
    if (isOpen) {
      setShowHelpFlyout(false) // Close help flyout if delete opens
    }
  }

  // Detect if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 window.navigator.standalone === true ||
                 document.referrer.includes('android-app://')

  const containerStyle = {
    position: 'fixed',
    bottom: isPWA ? 'calc(60px + env(safe-area-inset-bottom) + 2rem)' : 'calc(60px + env(safe-area-inset-bottom) + 1rem)',
    right: '1rem',
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    pointerEvents: 'none'
  }

  const mainButtonStyle = {
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
    transition: 'all 0.3s ease',
    pointerEvents: 'auto'
  }

  const menuItemsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transform: isOpen ? 'translateY(0)' : 'translateY(10px)',
    transition: 'all 0.3s ease',
    pointerEvents: isOpen ? 'auto' : 'none'
  }

  const menuItemStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease',
    position: 'relative',
    pointerEvents: 'auto'
  }

  return (
    <div className="floating-menu-container" style={containerStyle}>
      {/* Menu Items */}
      <div style={menuItemsStyle}>
        {/* Help Button */}
        <div style={menuItemStyle}>
          <HelpButton 
            showFlyout={showHelpFlyout}
            onFlyoutChange={handleHelpFlyoutChange}
          />
        </div>
        
        {/* Clear Button */}
        <div style={menuItemStyle}>
          <DeleteClear
            adversaries={adversaries}
            environments={environments}
            countdowns={countdowns}
            deleteAdversary={deleteAdversary}
            deleteEnvironment={deleteEnvironment}
            deleteCountdown={deleteCountdown}
            isClearMode={isClearMode}
            setIsClearMode={setIsClearMode}
            showFlyout={showDeleteFlyout}
            onFlyoutChange={handleDeleteFlyoutChange}
          />
        </div>
      </div>

      {/* Main Toggle Button */}
      <button
        style={mainButtonStyle}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        title={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        {isOpen ? <X size={24} /> : <MoreHorizontal size={24} />}
      </button>
    </div>
  )
}

export default FloatingMenu