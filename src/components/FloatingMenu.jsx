import React, { useState, useEffect } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import HelpButton from './HelpButton'
import DeleteClear from './DeleteClear'
import SortButton from './SortButton'
import QRCodeDisplay from './QRCodeDisplay'
import { createSession } from '../firebase/sessionService'

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
  playerView,
  gameState,
  handleSessionChange,
  currentSessionId,
  isConnected
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showHelpFlyout, setShowHelpFlyout] = useState(false)
  const [showDeleteFlyout, setShowDeleteFlyout] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Handle session creation
  const handleCreateSession = async () => {
    // Only sync countdowns and fear for player view
    const playerViewState = {
      countdowns: gameState.countdowns,
      fear: gameState.fear
    };
    
    console.log('Creating session with player view state:', playerViewState)
    setIsCreatingSession(true)
    try {
      const sessionId = await createSession(playerViewState)
      console.log('Session created with ID:', sessionId)
      handleSessionChange(sessionId, 'gm')
      setShowQRCode(true)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create session:', error)
      
      // Fallback: Create a simple URL-based session
      const fallbackSessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
      console.log('Using fallback session ID:', fallbackSessionId)
      
      // Set up the GM session properly
      handleSessionChange(fallbackSessionId, 'gm')
      
      // Create a simple URL for players to join
      const playerUrl = `${window.location.origin}${window.location.pathname}?sessionId=${fallbackSessionId}&playerView=true`
      
      alert(`Firebase not configured. Using fallback mode.\n\nSession ID: ${fallbackSessionId}\n\nShare this URL with players:\n${playerUrl}\n\nOr scan QR code at:\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(playerUrl)}`)
      
      setShowQRCode(true)
      setIsOpen(false)
    } finally {
      setIsCreatingSession(false)
    }
  }

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
    <>
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
            {/* Session/Player Button */}
            <div style={getRadialItemStyle(0, 4)}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  
                  console.log('QR button clicked:', { isConnected, currentSessionId, showQRCode });
                  
                  if (isConnected && currentSessionId) {
                    // If already connected, show QR code
                    console.log('Showing existing QR code for session:', currentSessionId);
                    setShowQRCode(true)
                    setIsOpen(false)
                  } else {
                    // If not connected, create session and show QR code
                    console.log('Creating new session');
                    handleCreateSession()
                  }
                }}
                disabled={isCreatingSession}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: isConnected ? 'var(--green)' : 'var(--purple)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  opacity: isCreatingSession ? 0.5 : 1
                }}
                title={isConnected ? "Show QR Code for Players" : "Create Session & Show QR Code"}
              >
                {isCreatingSession ? '...' : (isConnected ? 'QR' : 'Session')}
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
    
    {/* QR Code Display - Outside container to avoid pointer-events issues */}
    <QRCodeDisplay 
      sessionId={currentSessionId}
      isVisible={showQRCode}
      onClose={() => {
        setShowQRCode(false);
      }}
    />
  </>
  )
}

export default FloatingMenu