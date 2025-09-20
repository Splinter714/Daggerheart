import React, { useState, useEffect } from 'react'
import { MoreHorizontal, X, Sword, MapPin } from 'lucide-react'
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
  setIsClearMode,
  sortAdversaries,
  onOpenDatabase
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
    justifyContent: 'center',
    pointerEvents: 'none',
    width: '56px', // Fixed width to match button
    height: '56px' // Fixed height to match button
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

  // Radial positioning for menu items
  const getRadialItemStyle = (index, totalItems) => {
    // Distribute 4 items evenly in a quarter-circle from 135° to 270°
    const startAngle = 135
    const endAngle = 270
    const angleRange = endAngle - startAngle
    const angle = startAngle + (index * angleRange) / (totalItems - 1)
    const radius = 70
    const radians = (angle * Math.PI) / 180
    
    const x = Math.cos(radians) * radius // Use cos for x (horizontal)
    const y = Math.sin(radians) * radius // Use sin for y (vertical, positive = down)
    
    return {
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
      transition: 'all 0.3s ease',
      position: 'absolute',
      pointerEvents: 'auto',
      transform: isOpen ? `translate(${x}px, ${y}px)` : 'translate(0px, 0px)',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden'
    }
  }

  return (
    <div className="floating-menu-container" style={containerStyle}>
      {/* Radial Menu Items */}
      <div style={{ 
        position: 'absolute',
        top: '0',
        left: '0',
        width: '56px',
        height: '56px',
        pointerEvents: 'none'
      }}>
        {/* Add Adversary Button */}
        <div style={getRadialItemStyle(0, 5)}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenDatabase('adversaries')
              setIsOpen(false)
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Browse Adversaries"
          >
            <Sword size={20} />
          </button>
        </div>
        
        {/* Add Environment Button */}
        <div style={getRadialItemStyle(1, 5)}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenDatabase('environments')
              setIsOpen(false)
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Browse Environments"
          >
            <MapPin size={20} />
          </button>
        </div>
        
        {/* Clear Button */}
        <div style={getRadialItemStyle(2, 5)}>
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
        
        {/* Help Button */}
        <div style={getRadialItemStyle(3, 4)}>
          <HelpButton 
            showFlyout={showHelpFlyout}
            onFlyoutChange={handleHelpFlyoutChange}
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