import React, { useState, useEffect, useCallback, startTransition } from 'react'
import PWAInstallPrompt from './components/PWAInstallPrompt'

// Simple Error Boundary for debugging
class _ErrorBoundary extends React.Component {
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
        <div style={{padding: '1rem', color: 'red'}}>
          <h3>Something went wrong:</h3>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
import { GameStateProvider } from './state/GameStateContext'
import { useGameState } from './state/useGameState'
import TopBar from './components/panels/TopBar'
import MobileDrawer from './components/panels/MobileDrawer'
import RightPanel from './components/panels/RightPanel'
import LeftPanel from './components/panels/LeftPanel'
import BottomBar from './components/panels/BottomBar'
import useRightPanelSync from './hooks/useRightPanelSync'
import useAdversaryHandlers from './hooks/useAdversaryHandlers'
import useSwipeDrawer from './hooks/useSwipeDrawer'
import './App.css'

// Import all the UI components
import Cards from './components/cards/Cards'
import AdversaryCreatorMockup from './components/editor/AdversaryCreatorMockup'
import Browser from './components/browser/Browser'
// Lazy-load heavy right-panel components
const Creator = React.lazy(() => import('./components/editor/Creator'))
import { 
  getAdvancementForOutcome,
  getAdvancementForActionRoll
} from './utils/countdownEngine'

// Mobile navigation - simple button-based approach

// Main App Component
const AppContent = () => {
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
  const [mobileView] = useState('left') // 'left' or 'right'
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [showMockup, setShowMockup] = useState(false)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  
  // Touch gesture handling for mobile drawer via reusable hook
  const {
    drawerOffset,
    setDrawerOffset,
    touchHandlers: { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd },
    resetSwipeState,
  } = useSwipeDrawer({
    headerSelector: '.drawer-header, .browser-header',
    bodySelector: '.drawer-body, .browser-content',
    closeThreshold: 100,
    snapThreshold: 30,
    onClose: () => handleCloseRightColumn(),
  })
  
  const [creatorFormData, setCreatorFormData] = useState({
    name: '',
    tier: 1,
    type: '',
    difficulty: '',
    hpMax: '',
    stressMax: '',
    passiveFeatures: [{ name: '', description: '' }],
    actionFeatures: [{ name: '', description: '' }],
    reactionFeatures: [{ name: '', description: '' }],
    experience: [{ name: '', modifier: 0 }],
    source: 'campaign' // Default source for countdowns
  })
  
  // (delete flyout handling moved into SidebarNav)
  
  // Right column handlers
  const handleItemSelect = (item, type) => {
    startTransition(() => {
      setSelectedItem(item)
      setSelectedType(type)
      setRightColumnMode('item')
      if (isMobile) setMobileDrawerOpen(true)
    })
  }
  
  const handleOpenDatabase = (type = 'unified') => {
    // If database is already open for this type, close it
    if (rightColumnMode === 'database' && databaseType === type) {
      startTransition(() => {
        setRightColumnMode(null)
        if (isMobile) {
          setMobileDrawerOpen(false)
        }
      })
      return
    }
    
    // Otherwise, open the database
    startTransition(() => {
      setDatabaseType(type)
      setRightColumnMode('database')
      if (isMobile) {
        setMobileDrawerOpen(true)
      }
    })
  }

  const handleOpenCreator = (type, source = 'campaign') => {
    startTransition(() => {
      setDatabaseType(type)
      setRightColumnMode('creator')
      if (isMobile) {
        setMobileDrawerOpen(true)
      }
      // Store the source for countdown creation
      if (type === 'countdown') {
        setCreatorFormData(prev => ({ ...prev, source }))
      }
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

  // Rest triggers handled in GameBoard

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
      // Reset all drawer state when closing
      setDrawerOffset(0)
      resetSwipeState()
    }
  }, [isMobile, setDrawerOffset, resetSwipeState])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = isMobile
      const nowMobile = window.innerWidth <= 800
      
      setIsMobile(nowMobile)
      
      // Transition to mobile: prefer drawers instead of switching panels
      if (!wasMobile && nowMobile) {
        if (rightColumnMode === 'database' || rightColumnMode === 'creator' || rightColumnMode === 'item') {
          setMobileDrawerOpen(true)
        }
        // Do not force `mobileView` to 'right'; underlying app remains on left
      }

      // Transition to desktop: close mobile drawers, content remains in right panel
      if (wasMobile && !nowMobile) {
        if (mobileDrawerOpen) setMobileDrawerOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  // Reset drawer offset when drawer opens
  useEffect(() => {
    if (mobileDrawerOpen) {
      setDrawerOffset(0)
    }
  }, [mobileDrawerOpen, setDrawerOffset])

  // Determine which triggers are needed based on active countdowns
  // const getNeededTriggers = () => getNeededTriggersEngine(countdowns || [])

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
  const { handleAdversaryDamage, handleAdversaryHealing, handleAdversaryStressChange } = useAdversaryHandlers({ adversaries, updateAdversary, deleteAdversary, setSelectedItem })
  
  // (database create handlers consolidated elsewhere)
  
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
      
      {/* Top Bar: Fear Tracker */}
      <TopBar fear={fear} updateFear={updateFear} />

      {/* Sidebar: Navigation */}
      <div className={`sidebar`}>
        <BottomBar
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          showMockup={showMockup}
          setShowMockup={setShowMockup}
          adversaries={adversaries}
          environments={environments}
          countdowns={countdowns}
          deleteAdversary={deleteAdversary}
          deleteEnvironment={deleteEnvironment}
          deleteCountdown={deleteCountdown}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Unified Layout - Reuse desktop structure for mobile */}
        {/* Left Panel: Game Board */}
        <div className={`left-panel ${isMobile && mobileView === 'right' ? 'mobile-hidden' : ''}`}>
          <LeftPanel
            onItemSelect={handleItemSelect}
            onOpenDatabase={handleOpenDatabase}
            onOpenCreator={handleOpenCreator}
            isEditMode={isEditMode}
            onEditModeChange={setIsEditMode}
            showLongTermCountdowns={showLongTermCountdowns}
            fear={fear}
            updateFear={updateFear}
            handleRollOutcome={handleRollOutcome}
            handleActionRoll={handleActionRoll}
            setShowLongTermCountdowns={setShowLongTermCountdowns}
            lastAddedItemType={lastAddedItemType}
          />
        </div>

        {/* Right Panel: Details, Database, Creator, or Preview */}
        <div className={`right-panel ${isMobile && mobileView === 'left' ? 'mobile-hidden' : ''}`}>
          <RightPanel
            showMockup={showMockup}
            creatorFormData={creatorFormData}
            setCreatorFormData={setCreatorFormData}
            rightColumnMode={rightColumnMode}
            databaseType={databaseType}
            selectedItem={selectedItem}
            selectedType={selectedType}
            isEditMode={isEditMode}
            createAdversary={(item) => { createAdversary(item); setLastAddedItemType('adversary') }}
            createEnvironment={(item) => { createEnvironment(item); setLastAddedItemType('environment') }}
            createCountdown={(item) => { createCountdown(item); setLastAddedItemType('countdown') }}
            updateAdversary={(id, updates) => {
              updateAdversary(id, updates)
              // Update selectedItem if it's the same adversary
              if (selectedItem && selectedItem.id === id) {
                setSelectedItem(prev => ({ ...prev, ...updates }))
              }
            }}
            updateEnvironment={updateEnvironment}
            advanceCountdown={advanceCountdown}
            onClose={handleCloseRightColumn}
            onOpenCreator={handleOpenCreator}
            onToggleVisibility={handleToggleVisibility}
            onReorder={handleReorder}
            onApplyDamage={handleAdversaryDamage}
            onApplyHealing={handleAdversaryHealing}
            onApplyStressChange={handleAdversaryStressChange}
            onExitEditMode={() => setIsEditMode(false)}
          />
        </div>
      </div>

      {/* Mobile Drawer for Browser, Creator, and Expanded Cards */}
      {isMobile && (
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          drawerOffset={drawerOffset}
          setDrawerOffset={setDrawerOffset}
          onClose={handleCloseRightColumn}
          touchHandlers={{ onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd }}
        >
          {rightColumnMode === 'database' && (
            <Browser
              type={databaseType}
              onAddItem={(itemData, itemType) => {
                console.log('App.jsx onAddItem called with:', itemData, 'type:', itemType)
                console.log('Current databaseType:', databaseType)
                if (databaseType === 'adversary') {
                  console.log('Creating adversary...')
                  createAdversary(itemData)
                  setLastAddedItemType('adversary')
                } else if (databaseType === 'environment') {
                  console.log('Creating environment...')
                  createEnvironment(itemData)
                  setLastAddedItemType('environment')
                }
                setDrawerOffset(0)
                resetSwipeState()
                // Removed drawerRefreshKey increment to preserve filter state
              }}
              onCancel={handleCloseRightColumn}
              onCreateCustom={() => handleOpenCreator(databaseType)}
            />
          )}
          {rightColumnMode === 'creator' && (
            <React.Suspense fallback={<div style={{padding:'1rem'}}>Loading...</div>}>
              <Creator
                type={databaseType}
                item={null}
                source={databaseType === 'countdown' ? creatorFormData.source : undefined}
                onSave={(itemData) => {
                  if (databaseType === 'adversary') {
                    createAdversary(itemData)
                    setLastAddedItemType('adversary')
                  } else if (databaseType === 'environment') {
                    createEnvironment(itemData)
                    setLastAddedItemType('environment')
                  } else if (databaseType === 'countdown') {
                    createCountdown(itemData)
                    setLastAddedItemType('countdown')
                  }
                  handleCloseRightColumn()
                }}
                onCancel={handleCloseRightColumn}
              />
            </React.Suspense>
          )}
          {rightColumnMode === 'item' && selectedItem && (
            <Cards
              item={selectedItem}
              type={selectedType}
              mode="expanded"
              isEditMode={isEditMode}
              onDelete={() => handleCloseRightColumn()}
              onEdit={() => handleOpenCreator(selectedType)}
              onToggleVisibility={() => handleToggleVisibility(selectedItem.id, selectedType, selectedItem.isVisible)}
              onReorder={(newOrder) => handleReorder(selectedType, newOrder)}
              onApplyDamage={handleAdversaryDamage}
            />
          )}
        </MobileDrawer>
      )}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

// App wrapper with providers
const App = () => {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  )
}

export default App
