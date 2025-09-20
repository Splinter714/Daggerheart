import React, { useState, useEffect, useCallback, startTransition } from 'react'
import { GameStateProvider, useGameState } from '../state/state'
import Pips from './Pips'
import FloatingMenu from './FloatingMenu'
import Bar from './Toolbars'
import Panel from './Panels'
import GameBoard from './GameBoard'
import GameCard, { 
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
  handleCloseRightColumn,
  browserOpen // Add browserOpen to know when we're in browser mode
}) {
  useEffect(() => {
    if (!selectedItem || !selectedType) return

    // Don't interfere with browser selections - they're from JSON data, not game state
    if (browserOpen) return

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
  }, [selectedItem, selectedType, countdowns, adversaries, environments, setSelectedItem, handleCloseRightColumn, browserOpen])

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
    reorderAdversaries,
    bulkReorderAdversaries,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown
  } = useGameState()
  
  // Right column state
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [rightColumnMode, setRightColumnMode] = useState(null)
  const [databaseType, setDatabaseType] = useState('unified')
  
  // Browser state
  const [browserOpen, setBrowserOpen] = useState(false)
  const [browserType, setBrowserType] = useState('adversary')
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
    let newBrowserType = type
    if (type === 'adversaries') {
      newBrowserType = 'adversary'
    } else if (type === 'environments') {
      newBrowserType = 'environment'
    }
    
    // If browser is already open for the same type, close it
    if (browserOpen && browserType === newBrowserType) {
      startTransition(() => {
        setBrowserOpen(false)
        setSelectedItem(null)
        setSelectedType(null)
        setRightColumnMode(null)
        if (isMobile) {
          setMobileDrawerOpen(false)
        }
      })
    } else {
      // Open browser in left panel
      startTransition(() => {
        setBrowserType(newBrowserType)
        setBrowserOpen(true)
        setSelectedItem(null)
        setSelectedType(null)
        setRightColumnMode(null)
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

  // Handler for browser row clicks - show details in right panel
  const handleBrowserRowClick = useCallback((item, type) => {
    startTransition(() => {
      setSelectedItem(item)
      setSelectedType(type)
      setRightColumnMode('item')
      if (isMobile) setMobileDrawerOpen(true)
    })
  }, [isMobile])

  // Handler for closing browser
  const handleCloseBrowser = useCallback(() => {
    setBrowserOpen(false)
    setSelectedItem(null)
    setSelectedType(null)
    setRightColumnMode(null)
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
        if (rightColumnMode === 'database' || rightColumnMode === 'creator' || rightColumnMode === 'item' || browserOpen) {
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
  }, [isMobile, rightColumnMode, mobileDrawerOpen, browserOpen])

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
    handleCloseRightColumn,
    browserOpen
  })

  // Adversary handlers
  const handleAdversaryDamage = useCallback((id, damage, currentHp, maxHp) => {
    const target = adversaries.find(adv => adv.id === id)
    if (!target) return
    const isMinion = target.type === 'Minion'
    const minionFeature = target.features?.find(f => f.name?.startsWith('Minion ('))
    const threshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
    if (isMinion) {
      deleteAdversary(id)
      const additional = Math.floor(damage / threshold)
      if (additional > 0) {
        const sameType = adversaries.filter(adv => adv.type === 'Minion' && adv.id !== id && adv.name === target.name)
        for (let i = 0; i < Math.min(additional, sameType.length); i++) {
          deleteAdversary(sameType[i].id)
        }
      }
      return
    }
    const newHp = Math.min(currentHp + damage, maxHp)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [adversaries, updateAdversary, deleteAdversary, selectedItem, setSelectedItem])

  const handleAdversaryHealing = useCallback((id, healing, currentHp) => {
    const newHp = Math.max(0, currentHp - healing)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [updateAdversary, selectedItem, setSelectedItem])

  const handleAdversaryStressChange = useCallback((id, stressDelta, currentStress, maxStress) => {
    const adv = adversaries.find(a => a.id === id)
    if (!adv) return
    let newStress = currentStress + stressDelta
    let newHp = adv.hp || 0
    if (newStress > maxStress) {
      const overflow = newStress - maxStress
      newStress = maxStress
      newHp = Math.min(adv.hpMax || 0, newHp + overflow)
    }
    newStress = Math.max(0, newStress)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, stress: newStress, hp: newHp }))
    }
    updateAdversary(id, { stress: newStress, hp: newHp })
  }, [adversaries, updateAdversary, selectedItem, setSelectedItem])

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
      
      {/* Top Bar */}
      <Bar position="top">
        {/* Fear Bar - Moved to top bar */}
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
      />

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Unified Layout - Reuse desktop structure for mobile */}
        {/* Left Panel: Game Board or Browser */}
        <Panel 
          side="left" 
          className={`${isMobile && mobileView === 'right' ? 'mobile-hidden' : ''}`}
        >
          {browserOpen ? (
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Browser Header with Close Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                flexShrink: 0
              }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Browse {browserType === 'adversary' ? 'Adversaries' : 'Environments'}
                </h3>
                <button
                  onClick={handleCloseBrowser}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title="Close Browser"
                >
                  ×
                </button>
              </div>
              
              {/* Browser Content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Browser
                  type={browserType}
                  onAddItem={(itemData) => {
                    if (browserType === 'adversary') {
                      createAdversary(itemData)
                      setLastAddedItemType('adversary')
                    } else if (browserType === 'environment') {
                      createEnvironment(itemData)
                      setLastAddedItemType('environment')
                    }
                  }}
                  onRowClick={handleBrowserRowClick}
                  onCancel={handleCloseBrowser}
                />
              </div>
            </div>
          ) : (
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
          )}
        </Panel>

        {/* Right Panel: Details, Creator, or Plus Button */}
        <Panel 
          side="right" 
          className={`${isMobile && mobileView === 'left' ? 'mobile-hidden' : ''}`}
        >
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
          {browserOpen && !selectedItem && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
              onClick={() => {
                // Create a new adversary/environment
                if (browserType === 'adversary') {
                  const newAdversary = {
                    id: `adversary-${Date.now()}`,
                    name: 'New Adversary',
                    tier: 1,
                    type: 'Creature',
                    difficulty: '1',
                    hp: 10,
                    hpMax: 10,
                    stress: 0,
                    stressMax: 6,
                    isVisible: true,
                    features: [],
                    description: ''
                  }
                  createAdversary(newAdversary)
                  setLastAddedItemType('adversary')
                } else if (browserType === 'environment') {
                  const newEnvironment = {
                    id: `environment-${Date.now()}`,
                    name: 'New Environment',
                    tier: 1,
                    type: 'Location',
                    difficulty: '1',
                    isVisible: true,
                    effects: [],
                    description: ''
                  }
                  createEnvironment(newEnvironment)
                  setLastAddedItemType('environment')
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
              title={`Create New ${browserType === 'adversary' ? 'Adversary' : 'Environment'}`}
            >
              +
            </div>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--text-primary)', 
              fontSize: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              Create New {browserType === 'adversary' ? 'Adversary' : 'Environment'}
            </h3>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: 1.5
            }}>
              Click the + button to create a new {browserType === 'adversary' ? 'adversary' : 'environment'} or select an item from the browser to view its details.
            </p>
          </div>
          )}
          {!browserOpen && !selectedItem && (
            <div>
              {/* Right panel content - to be implemented */}
            </div>
          )}
        </Panel>
      </div>

      {/* Mobile Drawer for Browser and Expanded Cards */}
      {isMobile && (
        <Drawer
          isOpen={mobileDrawerOpen}
          onClose={handleCloseRightColumn}
        >
          {browserOpen && (
            <div className="browser-container">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                flexShrink: 0
              }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Browse {browserType === 'adversary' ? 'Adversaries' : 'Environments'}
                </h3>
                <button
                  onClick={handleCloseBrowser}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title="Close Browser"
                >
                  ×
                </button>
              </div>
              <Browser
                type={browserType}
                onAddItem={(itemData) => {
                  if (browserType === 'adversary') {
                    createAdversary(itemData)
                    setLastAddedItemType('adversary')
                  } else if (browserType === 'environment') {
                    createEnvironment(itemData)
                    setLastAddedItemType('environment')
                  }
                }}
                onRowClick={handleBrowserRowClick}
                onCancel={handleCloseBrowser}
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