import React, { useState, useEffect, Suspense } from 'react'
import { GameStateProvider } from './GameStateContext'
import { useGameState } from './useGameState'
import { Wrench } from 'lucide-react'
import Version from './components/Version'
import useSwipeDrawer from './hooks/useSwipeDrawer'
import './App.css'

// Import all the UI components
import Fear from './components/Fear'
import GameBoard from './components/GameBoard'
import Cards from './components/Cards'
import AdversaryCreatorMockup from './components/AdversaryCreatorMockup'
// Lazy-load heavy right-panel components
const Browser = React.lazy(() => import('./components/Browser'))
const Creator = React.lazy(() => import('./components/Creator'))
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
  const [deleteFlyoutOpen, setDeleteFlyoutOpen] = useState(false)
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [showMockup, setShowMockup] = useState(false)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0)
  
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
  
  // Close flyouts when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar-nav-item')) {
        setDeleteFlyoutOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [deleteFlyoutOpen])
  
  // Right column handlers
  const handleItemSelect = (item, type) => {
    setSelectedItem(item)
    setSelectedType(type)
    setRightColumnMode('item')
    if (isMobile) setMobileDrawerOpen(true)
  }
  
  const handleOpenDatabase = (type = 'unified') => {
    // If database is already open for this type, close it
    if (rightColumnMode === 'database' && databaseType === type) {
      setRightColumnMode(null)
      if (isMobile) {
        setMobileDrawerOpen(false)
      }
      return
    }
    
    // Otherwise, open the database
    setDatabaseType(type)
    setRightColumnMode('database')
    if (isMobile) {
      setMobileDrawerOpen(true)
    }
  }

  const handleOpenCreator = (type, source = 'campaign') => {
    setDatabaseType(type)
    setRightColumnMode('creator')
    if (isMobile) {
      setMobileDrawerOpen(true)
    }
    // Store the source for countdown creation
    if (type === 'countdown') {
      setCreatorFormData(prev => ({ ...prev, source }))
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

  const handleCloseRightColumn = () => {
    setRightColumnMode(null)
    setSelectedItem(null)
    setSelectedType(null)
    if (isMobile) {
      setMobileDrawerOpen(false)
      // Reset all drawer state when closing
      setDrawerOffset(0)
      resetSwipeState()
    }
  }

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
  }, [isMobile, rightColumnMode])

  // Prevent background scrolling when any drawer is open
  useEffect(() => {
    const hasAnyDrawerOpen = mobileDrawerOpen || (isMobile && selectedItem)
    
    if (hasAnyDrawerOpen) {
      document.body.classList.add('mobile-drawer-open')
    } else {
      document.body.classList.remove('mobile-drawer-open')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-drawer-open')
    }
  }, [isMobile, mobileDrawerOpen, selectedItem])

  // Reset drawer offset when drawer opens
  useEffect(() => {
    if (mobileDrawerOpen) {
      setDrawerOffset(0)
    }
  }, [mobileDrawerOpen])

  // Determine which triggers are needed based on active countdowns
  // const getNeededTriggers = () => getNeededTriggersEngine(countdowns || [])

  // Sync selectedItem with updated data
  useEffect(() => {
    if (selectedItem && countdowns) {
      if (selectedType === 'countdown') {
        const updatedCountdown = countdowns.find(c => c.id === selectedItem.id)
        if (updatedCountdown) {
          // Update if values changed
          if (updatedCountdown.value !== selectedItem.value || 
              updatedCountdown.max !== selectedItem.max ||
              updatedCountdown.description !== selectedItem.description) {
            setSelectedItem(updatedCountdown)
          }
        } else {
          // Countdown was deleted, close the right panel
          handleCloseRightColumn()
        }
      } else if (selectedType === 'adversary') {
        const updatedAdversary = adversaries.find(a => a.id === selectedItem.id)
        if (updatedAdversary) {
          // Update if values changed
          if (updatedAdversary.hp !== selectedItem.hp || 
              updatedAdversary.stress !== selectedItem.stress ||
              updatedAdversary.isVisible !== selectedItem.isVisible) {
            setSelectedItem(updatedAdversary)
          }
        } else {
          // Adversary was deleted, close the right panel
          handleCloseRightColumn()
        }
      } else if (selectedType === 'environment') {
        const updatedEnvironment = environments.find(e => e.id === selectedItem.id)
        if (updatedEnvironment) {
          // Update if values changed
          if (updatedEnvironment.isVisible !== selectedItem.isVisible) {
            setSelectedItem(updatedEnvironment)
          }
        } else {
          // Environment was deleted, close the right panel
          handleCloseRightColumn()
        }
      }
    }
  }, [countdowns, adversaries, environments, selectedItem, selectedType])

  // Adversary handlers
  const handleAdversaryDamage = (id, damage, currentHp, maxHp) => {
    const targetAdversary = adversaries.find(adv => adv.id === id)
    if (!targetAdversary) return
    
    // Check if this is a minion
    const isMinion = targetAdversary.type === 'Minion'
    const minionFeature = targetAdversary.features?.find(f => f.name?.startsWith('Minion ('))
    const minionThreshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
    
    if (isMinion) {
      // Minion mechanics: any damage defeats the minion, and excess damage can defeat additional minions
      console.log('Applying minion damage:', { id, damage, minionThreshold })
      
      // First, defeat the target minion
      deleteAdversary(id)
      
      // Calculate how many additional minions can be defeated
      const additionalMinions = Math.floor(damage / minionThreshold)
      console.log(`Damage ${damage} with threshold ${minionThreshold} can defeat ${additionalMinions} additional minions`)
      
      if (additionalMinions > 0) {
        // Find other minions of the same type that can be defeated
        const sameTypeMinions = adversaries.filter(adv => 
          adv.type === 'Minion' && 
          adv.id !== id && 
          adv.name === targetAdversary.name
        )
        
        // Defeat up to the calculated number of additional minions
        const minionsToDefeat = Math.min(additionalMinions, sameTypeMinions.length)
        console.log(`Defeating ${minionsToDefeat} additional minions of type ${targetAdversary.name}`)
        
        for (let i = 0; i < minionsToDefeat; i++) {
          deleteAdversary(sameTypeMinions[i].id)
        }
      }
    } else {
      // Regular adversary damage mechanics
      const newHp = Math.min(currentHp + damage, maxHp) // Can't exceed max damage
      console.log('Applying damage:', { id, damage, currentHp, maxHp, newHp })
      
      // Update the selected item if it's the one being modified
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, hp: newHp }))
      }
      
      // Send update to server
      updateAdversary(id, { hp: newHp })
    }
  }
  
  const handleAdversaryHealing = (id, healing, currentHp) => {
    // In Daggerheart: HP = damage taken, so healing decreases HP
    const newHp = Math.max(0, currentHp - healing) // Can't go below 0 damage
    console.log('Applying healing:', { id, healing, currentHp, newHp })
    
    // Update the selected item if it's the one being modified
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    
    // Send update to server
    updateAdversary(id, { hp: newHp })
  }
  
  const handleAdversaryStressChange = (id, stressDelta, currentStress, maxStress) => {
    let newStress = currentStress + stressDelta
    let newHp = adversaries.find(adv => adv.id === id)?.hp || 0
    let hpChanged = false
    
    // Handle stress overflow logic - overflow adds HP damage (towards death)
    if (newStress > maxStress) {
      const overflow = newStress - maxStress
      newStress = maxStress
      newHp = Math.min(adversaries.find(adv => adv.id === id)?.hpMax || 0, newHp + overflow)
      hpChanged = true
    }
    
    // Ensure stress doesn't go below 0
    newStress = Math.max(0, newStress)
    
    console.log('Applying stress change:', { 
      id, 
      stressDelta, 
      currentStress, 
      maxStress, 
      newStress, 
      newHp, 
      hpChanged,
      overflow: hpChanged ? newStress - currentStress : 0
    })
    
    // Update the selected item if it's the one being modified
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ 
        ...prev, 
        stress: newStress,
        ...(hpChanged && { hp: newHp })
      }))
    }
    
    // Send update to server
    updateAdversary(id, { 
      stress: newStress,
      ...(hpChanged && { hp: newHp })
    })
  }
  
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
      {/* Version Display */}
      <Version />
      
      {/* Top Bar: Fear Tracker */}
      <div 
        className="top-bar"
        onClick={(event) => {
          // Handle fear clicking on the entire top bar
          const currentFear = fear?.value || 0
          
          // Get the bounds of both the top bar (click area) and the container (skull area)
          const topBarRect = event.currentTarget.getBoundingClientRect()
          const containerElement = event.currentTarget.querySelector('.container')
          const containerRect = containerElement.getBoundingClientRect()
          
          const clickX = event.clientX - topBarRect.left
          
          // Calculate boundary position relative to the skull container within the top bar
          const containerStartX = containerRect.left - topBarRect.left
          const containerWidth = containerRect.width
          
          // Add some padding so first/last skulls don't toggle weirdly at edges
          const skullPadding = containerWidth * 0.05 // 5% padding on each side
          const effectiveContainerStart = containerStartX + skullPadding
          const effectiveContainerWidth = containerWidth - (2 * skullPadding)
          
          const boundaryRatio = currentFear / 12
          const boundaryX = effectiveContainerStart + (effectiveContainerWidth * boundaryRatio)
          
          if (clickX < boundaryX) {
            // Clicked left of boundary - decrement fear
            if (currentFear > 0) {
              updateFear(Math.max(0, currentFear - 1))
            }
          } else {
            // Clicked right of boundary - increment fear
            if (currentFear < 12) {
              updateFear(Math.min(12, currentFear + 1))
            }
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="container">
          <Fear />
        </div>
      </div>

      {/* Sidebar: Navigation */}
      <div className={`sidebar ${deleteFlyoutOpen ? 'flyout-open' : ''}`}>
        <nav className="sidebar-nav">
          

          {/* Edit Mode Toggle */}
          <button
            className={`sidebar-nav-item ${isEditMode ? 'active' : ''}`}
            onClick={() => setIsEditMode(!isEditMode)}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            <div className="sidebar-nav-icon">
              <Wrench size={20} />
            </div>
          </button>

          {/* Creator Mockup Toggle */}
          <div
            className={`sidebar-nav-item ${showMockup ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowMockup(!showMockup)
              setDeleteFlyoutOpen(false)
            }}
            title="Show Creator Mockup"
            style={{ cursor: 'pointer' }}
          >
            <div className="sidebar-nav-icon">
              <Wrench size={20} />
            </div>
          </div>
          
          {/* Delete Button with Clear Flyout */}
          <div
            className={`sidebar-nav-item ${deleteFlyoutOpen ? 'delete-active' : ''} ${(!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0) ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              // Only open flyout if there are items to delete
              const hasItems = (adversaries && adversaries.length > 0) || 
                              (environments && environments.length > 0) || 
                              (countdowns && countdowns.length > 0)
              if (hasItems) {
                setDeleteFlyoutOpen(!deleteFlyoutOpen)
                // Close other flyout (deprecated)
              }
            }}
            title={(!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0) ? "Nothing to clear" : "Clear Items"}
            style={{ cursor: (!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0) ? 'not-allowed' : 'pointer' }}
          >
            <div className="sidebar-nav-icon" aria-hidden="true">×</div>
            
            <div className={`flyout-menu ${deleteFlyoutOpen ? 'show' : ''}`}>
                {adversaries && adversaries.length > 0 && (
                  <button
                    className="flyout-menu-item delete-flyout-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteFlyoutOpen(false)
                      adversaries.forEach(item => deleteAdversary(item.id))
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <span aria-hidden="true">×</span>
                      <span>All Adversaries</span>
                    </div>
                  </button>
                )}
                {adversaries && adversaries.length > 0 && adversaries.some(adv => (adv.hp || 0) >= (adv.hpMax || 1)) && (
                  <button
                    className="flyout-menu-item delete-flyout-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteFlyoutOpen(false)
                      const deadAdversaries = adversaries.filter(adv => (adv.hp || 0) >= (adv.hpMax || 1))
                      deadAdversaries.forEach(item => deleteAdversary(item.id))
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <span aria-hidden="true">×</span>
                      <span>Dead Adversaries</span>
                    </div>
                  </button>
                )}
                {environments && environments.length > 0 && (
                  <button
                    className="flyout-menu-item delete-flyout-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteFlyoutOpen(false)
                      environments.forEach(item => deleteEnvironment(item.id))
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <span aria-hidden="true">×</span>
                      <span>All Environments</span>
                    </div>
                  </button>
                )}
                {countdowns && countdowns.length > 0 && (
                  <button
                    className="flyout-menu-item delete-flyout-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteFlyoutOpen(false)
                      countdowns.forEach(countdown => deleteCountdown(countdown.id))
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <span aria-hidden="true">×</span>
                      <span>All Countdowns</span>
                    </div>
                  </button>
                )}
              </div>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Unified Layout - Reuse desktop structure for mobile */}
        {/* Left Panel: Game Board or Creator */}
        <div className={`left-panel ${isMobile && mobileView === 'right' ? 'mobile-hidden' : ''}`}>
          {showMockup ? (
            <div className="creator-left-column">
              <div className="creator-header">
                <h3>New Adversary</h3>
              </div>
              <AdversaryCreatorMockup 
                formData={creatorFormData}
                setFormData={setCreatorFormData}
              />
            </div>
          ) : (
            <>
              {/* Mobile navigation when on left panel but right content exists - removed View Details button */}
              

              <GameBoard
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
            </>
          )}
        </div>

        {/* Right Panel: Details, Database, Creator, or Preview */}
        <div className={`right-panel ${isMobile && mobileView === 'left' ? 'mobile-hidden' : ''}`}>

          {/* Panel content - only show when there's something to display */}
          {showMockup ? (
            <div className="preview-right-column">
              <div className="creator-header">
                <h3>Adversary Preview</h3>
              </div>
              <div className="preview-section">
                <div className="card-preview">
                  <h4>Compact Card</h4>
                  <Cards
                    item={{
                      ...creatorFormData,
                      id: 'preview',
                      hp: 0,
                      stress: 0,
                      experience: creatorFormData.experience
                        .filter(exp => exp.name && exp.name.trim())
                        .map(exp => `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`),
                      features: [
                        ...creatorFormData.passiveFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
                        ...creatorFormData.actionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Action' })),
                        ...creatorFormData.reactionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
                      ],
                      traits: []
                    }}
                    type="adversary"
                    mode="compact"
                    onClick={() => {}} // Mock handler
                    onDelete={() => {}} // Mock handler
                    onEdit={() => {}} // Mock handler
                    onToggleVisibility={() => {}} // Mock handler
                    onApplyDamage={() => {}} // Mock handler
                    onApplyHealing={() => {}} // Mock handler
                    onApplyStressChange={() => {}} // Mock handler
                    onIncrement={() => {}} // Mock handler
                    onDecrement={() => {}} // Mock handler
                    isEditMode={false}
                    dragAttributes={null}
                    dragListeners={null}
                  />
                </div>
                <div className="card-preview">
                  <h4>Expanded Card</h4>
                  <Cards
                    item={{
                      ...creatorFormData,
                      id: 'preview',
                      hp: 0,
                      stress: 0,
                      experience: creatorFormData.experience
                        .filter(exp => exp.name && exp.name.trim())
                        .map(exp => `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`),
                      features: [
                        ...creatorFormData.passiveFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
                        ...creatorFormData.actionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Action' })),
                        ...creatorFormData.reactionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
                      ],
                      traits: []
                    }}
                    type="adversary"
                    mode="expanded"
                    onClick={() => {}} // Mock handler
                    onDelete={() => {}} // Mock handler
                    onEdit={() => {}} // Mock handler
                    onToggleVisibility={() => {}} // Mock handler
                    onApplyDamage={() => {}} // Mock handler
                    onApplyHealing={() => {}} // Mock handler
                    onApplyStressChange={() => {}} // Mock handler
                    onIncrement={() => {}} // Mock handler
                    onDecrement={() => {}} // Mock handler
                    isEditMode={false}
                    dragAttributes={null}
                    dragListeners={null}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {rightColumnMode === 'item' && selectedItem && (
            <div 
              className="item-display"
              onClick={(e) => e.stopPropagation()}
            >
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
                onApplyHealing={handleAdversaryHealing}
                onApplyStressChange={handleAdversaryStressChange}
                onAdvance={selectedType === 'countdown' ? advanceCountdown : undefined}
                onSave={(updatedItem) => {
                  if (selectedType === 'adversary') {
                    updateAdversary(updatedItem.id, updatedItem)
                  } else if (selectedType === 'environment') {
                    updateEnvironment(updatedItem.id, updatedItem)
                  }
                }}
                onExitEditMode={() => setIsEditMode(false)}
              />
            </div>
          )}

          {rightColumnMode === 'database' && (
            <div 
              className="database-display"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<div style={{padding:'1rem'}}>Loading...</div>}>
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
                    
                    // Keep browser open so users can add multiple items
                  }}
                  onCancel={handleCloseRightColumn}
                  onCreateCustom={() => handleOpenCreator(databaseType)}
                />
              </Suspense>
            </div>
          )}


          {rightColumnMode === 'creator' && (
            <div 
              className="creator-display"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<div style={{padding:'1rem'}}>Loading...</div>}>
                <Creator
                  type={databaseType}
                  item={null}
                  source={databaseType === 'countdown' ? creatorFormData.source : undefined}
                  onSave={(itemData) => {
                    if (databaseType === 'adversary') {
                      createAdversary(itemData)
                    } else if (databaseType === 'environment') {
                      createEnvironment(itemData)
                    } else if (databaseType === 'countdown') {
                      createCountdown(itemData)
                    }
                    handleCloseRightColumn()
                  }}
                  onCancel={handleCloseRightColumn}
                />
              </Suspense>
            </div>
          )}
          </>
        )}

        </div>
      </div>

      {/* Mobile Drawer for Browser, Creator, and Expanded Cards */}
      {isMobile && (
        <div 
          className={`mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}
          key={`drawer-${drawerRefreshKey}`}
        >
          <div className="drawer-backdrop" onClick={handleCloseRightColumn} />
          <div 
            className="drawer-content"
            style={{
              transform: mobileDrawerOpen 
                ? `translateY(${drawerOffset}px)` 
                : 'translateY(100%)',
              transition: drawerOffset ? 'none' : 'transform 0.3s ease'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="drawer-header" onClick={() => {
              // Use same smooth closing animation as swipe-to-close
              setDrawerOffset(window.innerHeight)
              setTimeout(() => {
                handleCloseRightColumn()
              }, 300)
            }}>
              <div className="drawer-handle" />
            </div>
            <div className="drawer-body">
              {/* Database Browser */}
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
                    
                    // Reset drawer state after adding item to prevent artifacts
                    console.log('Resetting drawer state after item creation')
                    setDrawerOffset(0)
                    resetSwipeState()
                    setDrawerRefreshKey(prev => prev + 1) // Force drawer re-render
                    
                    // Keep browser open so users can add multiple items
                  }}
                  onCancel={handleCloseRightColumn}
                  onCreateCustom={() => handleOpenCreator(databaseType)}
                />
              )}

              {/* Creator */}
              {rightColumnMode === 'creator' && (
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
              )}

              {/* Expanded Card */}
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
            </div>
          </div>
        </div>
      )}
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
