import React, { useState, useEffect, useCallback, startTransition } from 'react'
import { GameStateProvider, useGameState } from '../state/state'
import Pips from './Pips'
import FloatingMenu from './FloatingMenu'
import Bar from './Toolbars'
import Panel from './Panels'
import GameBoard from './GameBoard'
import GameCard, { 
  useAdversaryHandlers,
  getAdvancementForOutcome,
  getAdvancementForActionRoll
} from './GameCard'
import Drawer from './Drawer'
import PWAInstallPrompt from './PWAInstallPrompt'
import Browser from './Browser'

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
    updateFear,
    createAdversary,
    updateAdversary,
    deleteAdversary,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createCountdown,
    deleteCountdown,
    advanceCountdown
  } = useGameState()
  
  // Right column state
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [rightColumnMode, setRightColumnMode] = useState(null)
  const [databaseType, setDatabaseType] = useState('unified')
  const [isMobile, setIsMobile] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClearMode, setIsClearMode] = useState(false)
  const [mobileView] = useState('left') // 'left' or 'right'
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [showMockup, setShowMockup] = useState(false)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  
  // Touch gesture handling is now managed by the Drawer component itself
  

  // Right column handlers
  const handleItemSelect = (item, type) => {
    startTransition(() => {
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
    
    // If browser is already open for the same type, close it
    if (rightColumnMode === 'database' && databaseType === browserType) {
      startTransition(() => {
        setRightColumnMode(null)
        setDatabaseType('unified')
        if (isMobile) {
          setMobileDrawerOpen(false)
        }
      })
    } else {
      // Open database in right panel
      startTransition(() => {
        setDatabaseType(browserType)
        setRightColumnMode('database')
        if (isMobile) {
          setMobileDrawerOpen(true)
        }
      })
    }
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
      
      {/* Top Bar: Fear Tracker - Desktop only */}
      {!isMobile && (
        <Bar 
          position="top" 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'var(--topbar-height)',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
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
        </Bar>
      )}

      {/* Bottom Bar */}
      <Bar position="bottom">
        {/* Fear Bar - Center of bottom bar (mobile only) */}
        {isMobile && (
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
        )}
      </Bar>

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
      />

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Unified Layout - Reuse desktop structure for mobile */}
        {/* Left Panel: Game Board */}
        <Panel 
          side="left" 
          className={`${isMobile && mobileView === 'right' ? 'mobile-hidden' : ''}`}
        >
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
          />
        </Panel>

        {/* Right Panel: Details, Database, Creator, or Preview */}
        <Panel 
          side="right" 
          className={`${isMobile && mobileView === 'left' ? 'mobile-hidden' : ''}`}
          style={rightColumnMode === 'database' ? { overflowY: 'hidden' } : {}}
        >
          {rightColumnMode === 'database' && (
            <div className="database-display">
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
          )}
          {!rightColumnMode && (
            <div>
              {/* Right panel content - to be implemented */}
            </div>
          )}
        </Panel>
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