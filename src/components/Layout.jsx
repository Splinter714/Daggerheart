import React, { useState, useEffect, useCallback, startTransition } from 'react'
import { Clock, Search, Plus, Trash2 } from 'lucide-react'
import { GameStateProvider, useGameState } from '../state/state'
import Pips from './Pips'
import FloatingMenu from './FloatingMenu'
import Bar from './Toolbars'
import Panel from './Panels'
import GameBoard from './GameBoard'
import InlineCountdownCreator from './InlineCountdownCreator'
import GameCard, { 
  useAdversaryHandlers,
  getAdvancementForOutcome,
  getAdvancementForActionRoll
} from './GameCard'
import Drawer from './Drawer'
import PWAInstallPrompt from './PWAInstallPrompt'
import Browser from './Browser'
import PlayerView from './PlayerView'

// Debounce utility to prevent rapid clicking issues
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Hook to sync right panel state with selected items
 * Handles cleanup when items are deleted or modified
 */
function useRightPanelSync({
  selectedItem,
  selectedType,
  countdowns,
  adversaries,
  environments,
  setSelectedItem,
  handleCloseRightColumn
}) {
  useEffect(() => {
    if (!selectedItem || !selectedType) return

    // Check if the selected item still exists
    let itemExists = false
    
    if (selectedType === 'adversaries' || selectedType === 'adversary') {
      itemExists = adversaries.some(adv => adv.id === selectedItem.id)
    } else if (selectedType === 'environments' || selectedType === 'environment') {
      itemExists = environments.some(env => env.id === selectedItem.id)
    } else if (selectedType === 'countdowns' || selectedType === 'countdown') {
      itemExists = countdowns.some(countdown => countdown.id === selectedItem.id)
    }

    // If the item no longer exists, close the right panel
    if (!itemExists) {
      handleCloseRightColumn()
    }
  }, [selectedItem, selectedType, countdowns, adversaries, environments, setSelectedItem, handleCloseRightColumn])

  // Update selected item when the underlying data changes
  useEffect(() => {
    if (!selectedItem || !selectedType) return

    let updatedItem = null
    
    if (selectedType === 'adversaries' || selectedType === 'adversary') {
      updatedItem = adversaries.find(adv => adv.id === selectedItem.id)
    } else if (selectedType === 'environments' || selectedType === 'environment') {
      updatedItem = environments.find(env => env.id === selectedItem.id)
    } else if (selectedType === 'countdowns' || selectedType === 'countdown') {
      updatedItem = countdowns.find(countdown => countdown.id === selectedItem.id)
    }

    // Update the selected item if it has changed
    if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(selectedItem)) {
      setSelectedItem(updatedItem)
    }
  }, [selectedItem, selectedType, countdowns, adversaries, environments, setSelectedItem])
}

/**
 * Prevents iOS/Android pull-to-refresh when drawer content is short
 * or when the scrollable area is at its top.
 *
 * Attaches non-passive touch listeners to the drawer content container
 * and conditionally calls preventDefault on downward moves from the top.
 */
function usePreventPullToRefresh(containerRef, enabled = true) {
  useEffect(() => {
    const containerEl = containerRef?.current
    if (!containerEl || !enabled) return

    let startY = 0
    let guardPTR = false
    let scrollEl = null

    const resolveScrollEl = () => {
      // Prefer inner content scroll areas first, then drawer body, else container
      return (
        containerEl.querySelector('.expanded-content') ||
        containerEl.querySelector('.browser-content') ||
        containerEl.querySelector('.drawer-body') ||
        containerEl
      )
    }

    const onTouchStart = (e) => {
      const t = e.targetTouches && e.targetTouches[0]
      if (!t) return
      scrollEl = resolveScrollEl()
      const isScrollable = scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight
      const atTop = !isScrollable || scrollEl.scrollTop <= 0
      // Only consider preventing PTR if the gesture begins at the top or content isn't scrollable
      guardPTR = !!atTop
      startY = t.clientY
    }

    const onTouchMove = (e) => {
      if (!guardPTR) return
      const t = e.targetTouches && e.targetTouches[0]
      if (!t) return
      const dy = t.clientY - startY
      // Downward move from the top should be prevented to block PTR
      if (dy > 0) {
        try { e.preventDefault() } catch (_e) { /* ignore */ }
      }
    }

    const onTouchEnd = () => {
      guardPTR = false
    }

    // Non-passive to allow preventDefault on iOS Safari
    containerEl.addEventListener('touchstart', onTouchStart, { passive: true })
    containerEl.addEventListener('touchmove', onTouchMove, { passive: false })
    containerEl.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      containerEl.removeEventListener('touchstart', onTouchStart)
      containerEl.removeEventListener('touchmove', onTouchMove)
      containerEl.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerRef, enabled])
}

// Simple Error Boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-md text-red">
          <h3>Something went wrong:</h3>
          <pre>{this.state.error?.toString()}</pre>
          <button className="btn-base btn-text" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Main Layout Component with all the business logic
const LayoutContent = () => {
  const { 
    adversaries, 
    environments,
    countdowns,
    fear,
    gameState,
    playerView,
    currentSessionId,
    sessionRole,
    isConnected,
    handleSessionChange,
    updateFear,
    togglePlayerView,
    createAdversary,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    bulkReorderAdversaries,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createCountdown,
    deleteCountdown,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown
  } = useGameState()
  
  // Right column state
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [rightColumnMode, setRightColumnMode] = useState(null)
  const [databaseType, setDatabaseType] = useState('unified')
  const [isMobile, setIsMobile] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClearMode, setIsClearMode] = useState(false)
  const [mobileView] = useState('right') // 'left' or 'right' - now defaults to 'right' to show adversary list
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [showMockup, setShowMockup] = useState(false)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [environmentDeleteConfirm, setEnvironmentDeleteConfirm] = useState(false)
  const [adversaryDeleteConfirm, setAdversaryDeleteConfirm] = useState(false)
  const [showCountdownCreator, setShowCountdownCreator] = useState(false)
  const [countdownCreatorSource, setCountdownCreatorSource] = useState(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  
  // Debounced increment/decrement to prevent rapid clicking issues
  const debouncedIncrementCountdown = useCallback(
    debounce((id) => incrementCountdown(id), 100),
    [incrementCountdown]
  );
  
  const debouncedDecrementCountdown = useCallback(
    debounce((id) => decrementCountdown(id), 100),
    [decrementCountdown]
  );
  
  // Modal state for browser popup
  const [browserModalOpen, setBrowserModalOpen] = useState(false)
  const [browserModalType, setBrowserModalType] = useState('unified')
  
  // Touch gesture handling is now managed by the Drawer component itself
  

  // Right column handlers
  const handleItemSelect = (item, type) => {
    startTransition(() => {
      // Close any open browser when selecting an item
      if (browserModalOpen) {
        setBrowserModalOpen(false)
        setBrowserModalType('unified')
      }
      
      // If clicking the same item that's already selected, close the expanded view
      if (selectedItem && selectedItem.id === item.id && selectedType === type && rightColumnMode === 'item') {
        setSelectedItem(null)
        setSelectedType(null)
        setRightColumnMode(null)
        if (isMobile) setMobileDrawerOpen(false)
      } else {
        // Otherwise, open the expanded view
        setSelectedItem(item)
        setSelectedType(type)
        setRightColumnMode('item')
        if (isMobile) setMobileDrawerOpen(true)
      }
    })
  }
  
  const handleOpenDatabase = (type = 'unified') => {
    // Convert element type to browser type
    let browserType = type
    if (type === 'adversaries') {
      browserType = 'adversary'
    } else if (type === 'environments') {
      browserType = 'environment'
    }
    
    // Open browser in modal popup
      startTransition(() => {
      setBrowserModalType(browserType)
      setBrowserModalOpen(true)
    })
  }


  // Countdown control handlers
  const handleRollOutcome = (outcome) => {
    countdowns.forEach((countdown) => {
      const advancement = getAdvancementForOutcome(countdown, outcome)
      if (advancement > 0) {
        const currentValue = countdown.value || 0
        advanceCountdown(countdown.id, currentValue + advancement)
      }
    })
  }

  const handleActionRoll = () => {
    countdowns.forEach((countdown) => {
      const advancement = getAdvancementForActionRoll(countdown)
      if (advancement > 0) {
        const currentValue = countdown.value || 0
        advanceCountdown(countdown.id, currentValue + advancement)
      }
    })
  }

  const handleCloseRightColumn = useCallback(() => {
    setRightColumnMode(null)
    setSelectedItem(null)
    setSelectedType(null)
    if (isMobile) {
      setMobileDrawerOpen(false)
    }
  }, [isMobile])

  const handleCloseBrowserModal = useCallback(() => {
    setBrowserModalOpen(false)
    setBrowserModalType('unified')
  }, [])



  // Mobile detection using CSS media query instead of window.innerWidth
  // This prevents zoom from triggering mobile view
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = isMobile
      // Use CSS media query to detect mobile - this is zoom-independent
      const mediaQuery = window.matchMedia('(max-width: 800px)')
      const nowMobile = mediaQuery.matches
      
      setIsMobile(nowMobile)
      
      // Transition to mobile: prefer drawers instead of switching panels
      if (!wasMobile && nowMobile) {
        if (rightColumnMode === 'database' || rightColumnMode === 'creator' || rightColumnMode === 'item') {
          setMobileDrawerOpen(true)
        }
      }

      // Transition to desktop: close mobile drawers, content remains in right panel
      if (wasMobile && !nowMobile) {
        if (mobileDrawerOpen) setMobileDrawerOpen(false)
      }
    }
    
    checkMobile()
    
    // Use the media query listener instead of resize event for better zoom handling
    const mediaQuery = window.matchMedia('(max-width: 800px)')
    const handleMediaChange = () => checkMobile()
    
    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [isMobile, rightColumnMode, mobileDrawerOpen])

  // Prevent background scrolling when any drawer is open
  useEffect(() => {
    const hasAnyDrawerOpen = mobileDrawerOpen || (isMobile && selectedItem)
    
    if (hasAnyDrawerOpen) {
      document.body.classList.add('mobile-drawer-open')
      document.documentElement.classList.add('mobile-drawer-open')
    } else {
      document.body.classList.remove('mobile-drawer-open')
      document.documentElement.classList.remove('mobile-drawer-open')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-drawer-open')
      document.documentElement.classList.remove('mobile-drawer-open')
    }
  }, [isMobile, mobileDrawerOpen, selectedItem])


  useRightPanelSync({
    selectedItem,
    selectedType,
    countdowns,
    adversaries,
    environments,
    setSelectedItem,
    handleCloseRightColumn
  })

  // Adversary handlers
  const { handleAdversaryDamage, handleAdversaryHealing, handleAdversaryStressChange } = useAdversaryHandlers({ adversaries, updateAdversary, deleteAdversary, selectedItem, setSelectedItem })

  // Sort adversaries by type then by name (including duplicate numbers)
  const sortAdversaries = useCallback((sortedAdversaries) => {
    // Simple approach: directly update the adversaries array
    bulkReorderAdversaries(sortedAdversaries)
  }, [bulkReorderAdversaries])
  
  // Toggle visibility handlers
  const handleToggleVisibility = (id, type, currentVisibility) => {
    if (type === 'adversary') {
      updateAdversary(id, { isVisible: !currentVisibility })
    } else if (type === 'environment') {
      updateEnvironment(id, { isVisible: !currentVisibility })
    }
  }
  
  // Reorder handlers
  const handleReorder = () => {}

  return (
    <div 
      className="app"
      onClick={(e) => {
        // Clear selection when clicking on app background
        if (e.target === e.currentTarget) {
          handleCloseRightColumn()
        }
      }}
    >
      {/* Top Bar - Fear Display with Countdowns - Hidden in player view */}
      {!playerView && (
        <Bar position="top">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%'
          }}>
            {/* Left Side - Environment Countdown */}
            <div style={{ flex: '2', display: 'flex', justifyContent: 'flex-start' }}>
              {countdowns.filter(c => c.source === 'environment').map(countdown => (
                <div key={countdown.id} style={{ marginRight: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      textAlign: 'center'
                    }}>
                      {countdown.name}
                    </div>
                    <div                     style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - rect.left
                      const midPoint = rect.width / 2
                      
                      if (clickX < midPoint) {
                        // Click left side - decrement
                        debouncedDecrementCountdown(countdown.id)
                      } else {
                        // Click right side - increment
                        debouncedIncrementCountdown(countdown.id)
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-dark)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title="Click left to decrease, right to increase"
                    >
                      {Array.from({ length: countdown.max || 6 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '1rem',
                            color: i < (countdown.value || 0) ? 'var(--red)' : 'var(--text-secondary)',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {i < (countdown.value || 0) ? '●' : '○'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center - Fear Display */}
            <div style={{ flex: '2', display: 'flex', justifyContent: 'center' }}>
          <Pips
            type="fear"
            value={fear?.value || 0}
            maxValue={12}
            onChange={updateFear}
            showTooltip={false}
            enableBoundaryClick={true}
            clickContainerWidth="100%"
            centerPips={true}
          />
            </div>

            {/* Right Side - Adversary Countdown */}
            <div style={{ flex: '2', display: 'flex', justifyContent: 'flex-end' }}>
              {countdowns.filter(c => c.source === 'adversary').map(countdown => (
                <div key={countdown.id} style={{ marginLeft: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      textAlign: 'center'
                    }}>
                      {countdown.name}
                    </div>
                    <div                     style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - rect.left
                      const midPoint = rect.width / 2
                      
                      if (clickX < midPoint) {
                        // Click left side - decrement
                        debouncedDecrementCountdown(countdown.id)
                      } else {
                        // Click right side - increment
                        debouncedIncrementCountdown(countdown.id)
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-dark)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title="Click left to decrease, right to increase"
                    >
                      {Array.from({ length: countdown.max || 6 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '1rem',
                            color: i < (countdown.value || 0) ? 'var(--red)' : 'var(--text-secondary)',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {i < (countdown.value || 0) ? '●' : '○'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Bar>
      )}

      {/* Inline Countdown Creator */}
      {showCountdownCreator && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          minWidth: '400px',
          maxWidth: '90vw'
        }}>
          <InlineCountdownCreator
            source={countdownCreatorSource}
            onCreateCountdown={(countdownData) => {
              createCountdown(countdownData)
              setLastAddedItemType('countdown')
              setShowCountdownCreator(false)
              setCountdownCreatorSource(null)
            }}
            onCancel={() => {
              setShowCountdownCreator(false)
              setCountdownCreatorSource(null)
            }}
          />
        </div>
      )}

      {/* Floating Menu */}
      <FloatingMenu
        adversaries={adversaries}
        environments={environments}
        countdowns={countdowns}
        deleteAdversary={deleteAdversary}
        deleteEnvironment={deleteEnvironment}
        deleteCountdown={deleteCountdown}
        isClearMode={isClearMode}
        setIsClearMode={setIsClearMode}
        sortAdversaries={sortAdversaries}
        togglePlayerView={togglePlayerView}
        playerView={playerView}
        gameState={gameState}
        handleSessionChange={handleSessionChange}
        currentSessionId={currentSessionId}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Player View - Only Fear and Countdowns */}
        {playerView ? (
          <PlayerView 
            fear={fear}
            countdowns={countdowns}
            adversaries={adversaries}
            onSessionChange={handleSessionChange}
          />
        ) : (
          /* Three Column Layout using Panel components */
          <div style={{
            display: 'flex',
            height: '100%',
            width: '100%'
          }}>
          {/* Left Panel: Environments */}
          <Panel side="left" style={{ flex: '1', minWidth: '300px' }}>
            <div style={{
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Environments
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleOpenDatabase('environment')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--gray-dark)'
                    e.target.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                  title="Browse Environments"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => {
                    // Check if environment already exists
                    if (environments.length > 0) {
                      return // Don't create if one already exists
                    }
                    
                    // Create empty environment for editing
                    const emptyEnvironment = {
                      name: 'New Environment',
                      description: '',
                      effects: [],
                      isVisible: true
                    }
                    createEnvironment(emptyEnvironment)
                    setLastAddedItemType('environment')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: environments.length > 0 ? 'var(--text-disabled)' : 'var(--text-secondary)',
                    cursor: environments.length > 0 ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: environments.length > 0 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (environments.length === 0) {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (environments.length === 0) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                  title={environments.length > 0 ? 'Environment already exists' : 'Create New Environment'}
                  disabled={environments.length > 0}
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => {
                    // Check if environment countdown already exists
                    const existingEnvironmentCountdown = countdowns.find(c => c.source === 'environment')
                    if (existingEnvironmentCountdown) {
                      return // Don't create if one already exists
                    }
                    
                    // Show countdown creator instead of creating directly
                    setCountdownCreatorSource('environment')
                    setShowCountdownCreator(true)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdowns.find(c => c.source === 'environment') ? 'var(--text-disabled)' : 'var(--text-secondary)',
                    cursor: countdowns.find(c => c.source === 'environment') ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: countdowns.find(c => c.source === 'environment') ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!countdowns.find(c => c.source === 'environment')) {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!countdowns.find(c => c.source === 'environment')) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                  title={countdowns.find(c => c.source === 'environment') ? 'Environment countdown already exists' : 'Add Environment Countdown'}
                  disabled={!!countdowns.find(c => c.source === 'environment')}
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={() => {
                    if (!environmentDeleteConfirm) {
                      // First click - show confirmation state
                      setEnvironmentDeleteConfirm(true)
                      // Reset confirmation after 3 seconds
                      setTimeout(() => setEnvironmentDeleteConfirm(false), 3000)
                    } else {
                      // Second click - actually delete
                      // Delete all environments
                      environments.forEach(env => deleteEnvironment(env.id))
                      
                      // Delete environment countdowns
                      const environmentCountdowns = countdowns.filter(c => c.source === 'environment')
                      environmentCountdowns.forEach(countdown => deleteCountdown(countdown.id))
                      
                      // Clear selection if it was an environment
                      if (selectedType === 'environment' || selectedType === 'environments') {
                        setSelectedItem(null)
                        setSelectedType(null)
                      }
                      
                      // Reset confirmation state
                      setEnvironmentDeleteConfirm(false)
                    }
                  }}
                  style={{
                    background: environmentDeleteConfirm ? 'var(--red)' : 'none',
                    border: 'none',
                    color: environmentDeleteConfirm ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!environmentDeleteConfirm) {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!environmentDeleteConfirm) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                  title={environmentDeleteConfirm ? "Click again to confirm deletion" : "Clear All Environments and Environment Countdowns"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          <GameBoard
            onItemSelect={handleItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onOpenDatabase={handleOpenDatabase}
            isEditMode={isEditMode}
            onEditModeChange={setIsEditMode}
            isClearMode={isClearMode}
            showLongTermCountdowns={showLongTermCountdowns}
            fear={fear}
            updateFear={updateFear}
            handleRollOutcome={handleRollOutcome}
            handleActionRoll={handleActionRoll}
            setShowLongTermCountdowns={setShowLongTermCountdowns}
            lastAddedItemType={lastAddedItemType}
              showOnlyEnvironments={true}
              onIncrement={incrementCountdown}
              onDecrement={decrementCountdown}
          />
        </Panel>

          {/* Middle Panel: Browser or Expanded Selected Adversary */}
          <Panel side="left" style={{ flex: '1', minWidth: '300px' }}>
            {browserModalOpen ? (
              <>
                <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
                  <button
                    onClick={handleCloseBrowserModal}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-card)'
                      e.target.style.color = 'var(--text-secondary)'
                    }}
                    title="Close Browser"
                  >
                    ×
                  </button>
              <Browser
                    type={browserModalType}
                onAddItem={(itemData) => {
                      if (browserModalType === 'adversary') {
                    createAdversary(itemData)
                    setLastAddedItemType('adversary')
                        // Don't close browser for adversaries - let user close manually
                      } else if (browserModalType === 'environment') {
                    createEnvironment(itemData)
                    setLastAddedItemType('environment')
                        // Close browser automatically for environments
                        handleCloseBrowserModal()
                  }
                }}
                    onCancel={handleCloseBrowserModal}
              />
            </div>
              </>
            ) : (
              <>
                <div style={{ 
                  padding: '0.5rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  height: '100%'
                }}>
                  {selectedItem && (selectedType === 'adversary' || selectedType === 'adversaries') ? (
            <GameCard
                      type="adversary"
              item={selectedItem}
                      mode="expanded"
              onApplyDamage={handleAdversaryDamage}
              onApplyHealing={handleAdversaryHealing}
              onApplyStressChange={handleAdversaryStressChange}
                      onUpdate={updateAdversary}
              adversaries={adversaries}
            />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      textAlign: 'center'
                    }}>
                      Select an adversary to view details
                    </div>
                  )}
            </div>
              </>
          )}
        </Panel>

          {/* Right Panel: Adversaries */}
          <Panel side="right" style={{ flex: '1', minWidth: '300px' }}>
            <div style={{
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Adversaries
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleOpenDatabase('adversary')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--gray-dark)'
                    e.target.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                  title="Browse Adversaries"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => {
                    // Create empty adversary for editing
                    const emptyAdversary = {
                      name: 'New Adversary',
                      description: '',
                      hp: 10,
                      hpMax: 10,
                      stress: 0,
                      stressMax: 6,
                      features: [],
                      isVisible: true
                    }
                    createAdversary(emptyAdversary)
                    setLastAddedItemType('adversary')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--gray-dark)'
                    e.target.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                  title="Create New Adversary"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => {
                    // Check if adversary countdown already exists
                    const existingAdversaryCountdown = countdowns.find(c => c.source === 'adversary')
                    if (existingAdversaryCountdown) {
                      return // Don't create if one already exists
                    }
                    
                    // Show countdown creator instead of creating directly
                    setCountdownCreatorSource('adversary')
                    setShowCountdownCreator(true)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdowns.find(c => c.source === 'adversary') ? 'var(--text-disabled)' : 'var(--text-secondary)',
                    cursor: countdowns.find(c => c.source === 'adversary') ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: countdowns.find(c => c.source === 'adversary') ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!countdowns.find(c => c.source === 'adversary')) {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!countdowns.find(c => c.source === 'adversary')) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                  title={countdowns.find(c => c.source === 'adversary') ? 'Adversary countdown already exists' : 'Add Adversary Countdown'}
                  disabled={!!countdowns.find(c => c.source === 'adversary')}
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={() => {
                    if (!adversaryDeleteConfirm) {
                      // First click - show confirmation state
                      setAdversaryDeleteConfirm(true)
                      // Reset confirmation after 3 seconds
                      setTimeout(() => setAdversaryDeleteConfirm(false), 3000)
                    } else {
                      // Second click - actually delete
                      // Delete all adversaries
                      adversaries.forEach(adv => deleteAdversary(adv.id))
                      
                      // Delete adversary countdowns
                      const adversaryCountdowns = countdowns.filter(c => c.source === 'adversary')
                      adversaryCountdowns.forEach(countdown => deleteCountdown(countdown.id))
                      
                      // Clear selection if it was an adversary
                      if (selectedType === 'adversary' || selectedType === 'adversaries') {
                        setSelectedItem(null)
                        setSelectedType(null)
                      }
                      
                      // Reset confirmation state
                      setAdversaryDeleteConfirm(false)
                    }
                  }}
                  style={{
                    background: adversaryDeleteConfirm ? 'var(--red)' : 'none',
                    border: 'none',
                    color: adversaryDeleteConfirm ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!adversaryDeleteConfirm) {
                      e.target.style.backgroundColor = 'var(--gray-dark)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!adversaryDeleteConfirm) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                  title={adversaryDeleteConfirm ? "Click again to confirm deletion" : "Clear All Adversaries and Adversary Countdowns"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <GameBoard
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
              selectedType={selectedType}
              onOpenDatabase={handleOpenDatabase}
              isEditMode={isEditMode}
              onEditModeChange={setIsEditMode}
              isClearMode={isClearMode}
              showLongTermCountdowns={showLongTermCountdowns}
              fear={fear}
              updateFear={updateFear}
              handleRollOutcome={handleRollOutcome}
              handleActionRoll={handleActionRoll}
              setShowLongTermCountdowns={setShowLongTermCountdowns}
              lastAddedItemType={lastAddedItemType}
              showOnlyAdversaries={true}
              onIncrement={incrementCountdown}
              onDecrement={decrementCountdown}
            />
          </Panel>
            </div>
        )}
      </div>


      {/* Mobile Drawer for Browser, Creator, and Expanded Cards */}
      {isMobile && (
        <Drawer
          isOpen={mobileDrawerOpen}
          onClose={handleCloseRightColumn}
        >
          {rightColumnMode === 'database' && (
            <div className="browser-container">
              <Browser
                type={databaseType}
                onAddItem={(itemData) => {
                  if (databaseType === 'adversary') {
                    createAdversary(itemData)
                    setLastAddedItemType('adversary')
                  } else if (databaseType === 'environment') {
                    createEnvironment(itemData)
                    setLastAddedItemType('environment')
                  }
                }}
                onCancel={handleCloseRightColumn}
              />
            </div>
          )}
          {rightColumnMode === 'item' && selectedItem && (
            <div className="expanded-content">
              <GameCard
                type={selectedType}
                item={selectedItem}
                mode={isEditMode ? "edit" : "expanded"}
                onApplyDamage={handleAdversaryDamage}
                onApplyHealing={handleAdversaryHealing}
                onApplyStressChange={handleAdversaryStressChange}
                onUpdate={selectedType === 'adversaries' ? updateAdversary : selectedType === 'environments' ? updateEnvironment : updateCountdown}
                adversaries={adversaries}
              />
            </div>
          )}
        </Drawer>
      )}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

// Layout wrapper with providers
const Layout = () => {
  return (
    <ErrorBoundary>
      <GameStateProvider>
        <LayoutContent />
      </GameStateProvider>
    </ErrorBoundary>
  )
}

export default Layout