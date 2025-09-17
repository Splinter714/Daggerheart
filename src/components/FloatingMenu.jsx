import React, { useState, useEffect } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import HelpButton from './HelpButton'
import DeleteClear from './DeleteClear'
import SortButton from './SortButton'

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
  togglePlayerView,
  playerView
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
    // Spread from 180° (left) to 270° (down) - left to down direction
    const angle = 180 + (index * 90) / (totalItems - 1) // 180° to 270°
    const radius = 70 // Increased from 60 to 70 for better spacing
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

  // Don't render floating menu in player view
  if (playerView) {
    return null
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
            {/* Player View Button */}
            <div style={getRadialItemStyle(0, 4)}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  
                  // Check if we should show QR code instead
                  if (e.shiftKey) {
                    // Shift+click: Show QR code for mobile access
                    const playerUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'playerView=true'
                    alert(`Player View URL for mobile devices:\n\n${playerUrl}\n\nShare this URL with players or scan QR code at:\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(playerUrl)}`)
                    setIsOpen(false)
                    return
                  }
                  
                  // Open new window in player view using URL parameter
                  const playerUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'playerView=true'
                  
                  // More flexible approach for iPad second monitor
                  const playerWindow = window.open(
                    playerUrl, 
                    'playerView', // Use named window for consistency
                    'width=1200,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no'
                  )
                  
                  if (playerWindow) {
                    // Focus the new window
                    playerWindow.focus()
                    
                    // Try to maximize after a short delay
                    setTimeout(() => {
                      try {
                        // Try different approaches for different devices
                        if (playerWindow.screen && playerWindow.screen.availWidth) {
                          // Try to resize to screen size
                          playerWindow.resizeTo(playerWindow.screen.availWidth, playerWindow.screen.availHeight)
                        }
                        
                        // Try fullscreen after resize
                        setTimeout(() => {
                          try {
                            if (playerWindow.document.documentElement.requestFullscreen) {
                              playerWindow.document.documentElement.requestFullscreen()
                            } else if (playerWindow.document.documentElement.webkitRequestFullscreen) {
                              playerWindow.document.documentElement.webkitRequestFullscreen()
                            }
                          } catch (fullscreenError) {
                            console.log('Fullscreen not available, but window should be large:', fullscreenError)
                          }
                        }, 500)
                      } catch (resizeError) {
                        console.log('Resize not available:', resizeError)
                      }
                    }, 1000)
                  }
                  
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'var(--purple)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                title="Open Player View Window (iPad Compatible)\nShift+Click: Show QR Code for Mobile"
              >
                Player
              </button>
            </div>

        {/* Clear Button */}
        <div style={getRadialItemStyle(1, 4)}>
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
        
        {/* Sort Button */}
        <div style={getRadialItemStyle(2, 4)}>
          <SortButton
            adversaries={adversaries}
            onSortAdversaries={sortAdversaries}
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