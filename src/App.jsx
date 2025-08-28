import React, { useState, useEffect, useRef } from 'react'
import { GameStateProvider } from './GameStateContext'
import { useGameState } from './useGameState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSkull, faClock } from '@fortawesome/free-solid-svg-icons'
import './App.css'

// Import all the UI components
import Fear from './components/Fear'
import GameBoard from './components/GameBoard'
import Cards from './components/Cards'
import Browser from './components/Browser'
import Creator from './components/Creator'
import Button from './components/Buttons'
import adversariesData from './data/adversaries.json'
import environmentsData from './data/environments.json'

// Mobile navigation constants
const SWIPE_THRESHOLD = 100 // Minimum distance for swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3 // Minimum velocity for swipe

// Main App Component
const AppContent = () => {
  const { 
    isConnected, 
    adversaries, 
    environments,
    countdowns,
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
  const [slideOffset, setSlideOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Touch gesture tracking
  const touchStart = useRef({ x: 0, y: 0, time: 0 })
  const touchCurrent = useRef({ x: 0, y: 0, time: 0 })
  const rightPanelRef = useRef(null)
  
  // Right column handlers
  const handleItemSelect = (item, type) => {
    setSelectedItem(item)
    setSelectedType(type)
    setRightColumnMode('item')
  }
  
  const handleOpenDatabase = (type = 'unified') => {
    setDatabaseType(type)
    setRightColumnMode('database')
  }

  const handleOpenCreator = (type) => {
    setDatabaseType(type)
    setRightColumnMode('creator')
  }

  const handleCloseRightColumn = () => {
    setRightColumnMode(null)
    setSelectedItem(null)
    setSelectedType(null)
    setSlideOffset(0)
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    if (!isMobile || !rightColumnMode) return
    
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isMobile || !rightColumnMode || !isDragging) return
    
    const touch = e.touches[0]
    touchCurrent.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    const deltaX = touchCurrent.current.x - touchStart.current.x
    const deltaY = Math.abs(touchCurrent.current.y - touchStart.current.y)
    
    // Only allow horizontal swipes with minimal vertical movement
    if (deltaY < 50 && deltaX > 0) {
      setSlideOffset(Math.min(deltaX, 300))
    }
  }

  const handleTouchEnd = (e) => {
    if (!isMobile || !rightColumnMode || !isDragging) return
    
    const deltaX = touchCurrent.current.x - touchStart.current.x
    const deltaTime = touchCurrent.current.time - touchStart.current.time
    const velocity = deltaX / deltaTime
    
    // Check if swipe meets threshold for closing
    if (deltaX > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      handleCloseRightColumn()
    } else {
      // Reset position if swipe wasn't strong enough
      setSlideOffset(0)
    }
    
    setIsDragging(false)
  }
  
  // Adversary handlers
  const handleAdversaryDamage = (id, damage, currentHp, maxHp) => {
    // In Daggerheart: HP = damage taken, so damage increases HP
    const newHp = Math.min(currentHp + damage, maxHp) // Can't exceed max damage
    console.log('Applying damage:', { id, damage, currentHp, maxHp, newHp })
    
    // Optimistic update - update local state immediately
    const updatedAdversaries = adversaries.map(adv => 
      adv.id === id ? { ...adv, hp: newHp } : adv
    )
    
    // Update the selected item if it's the one being modified
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    
    // Send update to server
    updateAdversary(id, { hp: newHp })
  }
  
  const handleAdversaryHealing = (id, healing, currentHp) => {
    // In Daggerheart: HP = damage taken, so healing decreases HP
    const newHp = Math.max(0, currentHp - healing) // Can't go below 0 damage
    console.log('Applying healing:', { id, healing, currentHp, newHp })
    
    // Optimistic update - update local state immediately
    const updatedAdversaries = adversaries.map(adv => 
      adv.id === id ? { ...adv, hp: newHp } : adv
    )
    
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
    
    // Optimistic update - update local state immediately
    const updatedAdversaries = adversaries.map(adv => 
      adv.id === id ? { 
        ...adv, 
        stress: newStress,
        ...(hpChanged && { hp: newHp })
      } : adv
    )
    
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
  
  const handleAddAdversaryFromDatabase = (adversary) => {
    createAdversary({
      ...adversary,
      id: `adv-${Date.now()}`,
      hp: adversary.hpMax,
      stress: 0,
      isVisible: true
    })
    handleCloseRightColumn()
  }
  
  const handleCreateAdversary = (adversary) => {
    createAdversary({
      ...adversary,
      id: `adv-${Date.now()}`,
      hp: adversary.hpMax,
      stress: 0,
      isVisible: true
    })
    handleCloseRightColumn()
  }
  
  // Environment handlers
  const handleAddEnvironmentFromDatabase = (environment) => {
    createEnvironment({
      ...environment,
      id: `env-${Date.now()}`,
      isVisible: true
    })
    handleCloseRightColumn()
  }
  
  const handleCreateEnvironment = (environment) => {
    createEnvironment({
      ...environment,
      id: `env-${Date.now()}`,
      isVisible: true
    })
    handleCloseRightColumn()
  }
  
  // Toggle visibility handlers
  const handleToggleVisibility = (id, type, currentVisibility) => {
    if (type === 'adversary') {
      updateAdversary(id, { isVisible: !currentVisibility })
    } else if (type === 'environment') {
      updateEnvironment(id, { isVisible: !currentVisibility })
    }
  }
  
  // Reorder handlers
  const handleReorder = (type, newOrder) => {
    if (type === 'adversary') {
      reorderAdversaries(newOrder)
    } else if (type === 'environment') {
      reorderEnvironments(newOrder)
    }
  }

  // Show loading state while connecting
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-4">🎲 Daggerheart GM Dashboard</div>
          <div className="text-gray-400">Connecting to server...</div>
        </div>
      </div>
    )
  }

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
      {/* Top Bar: Fear & Counters */}
      <div 
        className="top-bar"
        onClick={(e) => {
          // Clear selection when clicking on top bar background
          if (e.target === e.currentTarget) {
            handleCloseRightColumn()
          }
        }}
      >
        <div className="container">
          <Fear />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Panel: Adversaries & Environments */}
        <div className="left-panel">
          <GameBoard
            onItemSelect={handleItemSelect}
            onOpenDatabase={handleOpenDatabase}
            onOpenCreator={handleOpenCreator}
            isEditMode={isEditMode}
            onEditModeChange={setIsEditMode}
          />
        </div>

        {/* Right Panel: Details, Database, or Creator */}
        <div 
          className={`right-panel ${isMobile && rightColumnMode ? 'mobile-panel' : ''}`}
          ref={rightPanelRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isMobile && rightColumnMode ? `translateX(${slideOffset}px)` : 'none',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {/* Right Panel Header with Action Buttons */}
          <div className="right-panel-header">
            <div className="right-panel-actions">
              <Button
                action="edit"
                size="compact"
                onClick={() => setIsEditMode(!isEditMode)}
                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              >
                {isEditMode ? "✓" : "✏"}
              </Button>
              <Button
                action="add"
                size="compact"
                onClick={() => handleOpenDatabase()}
                title="Add Game Element"
              >
                +
              </Button>
              {isEditMode && (
                <>
                  <Button
                    action="delete"
                    size="compact"
                    onClick={() => {
                      if (adversaries.length > 0) {
                        adversaries.forEach(item => deleteAdversary(item.id))
                      }
                      if (environments.length > 0) {
                        environments.forEach(item => deleteEnvironment(item.id))
                      }
                      if (countdowns && countdowns.length > 0) {
                        countdowns.forEach(countdown => deleteCountdown(countdown.id))
                      }
                    }}
                    disabled={adversaries.length === 0 && environments.length === 0 && (!countdowns || countdowns.length === 0)}
                    title="Clear All Game Elements"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                  <Button
                    action="delete"
                    size="compact"
                    onClick={() => {
                      const deadAdversaries = adversaries.filter(a => a.hp >= a.hpMax)
                      if (deadAdversaries.length > 0) {
                        deadAdversaries.forEach(item => deleteAdversary(item.id))
                      }
                    }}
                    disabled={adversaries.filter(a => a.hp >= a.hpMax).length === 0}
                    title="Clear Dead Adversaries"
                  >
                    <FontAwesomeIcon icon={faSkull} />
                  </Button>
                  <Button
                    action="delete"
                    size="compact"
                    onClick={() => {
                      if (countdowns && countdowns.length > 0) {
                        countdowns.forEach(countdown => {
                          deleteCountdown(countdown.id)
                        })
                      }
                    }}
                    disabled={!countdowns || countdowns.length === 0}
                    title="Clear All Countdowns"
                  >
                    <FontAwesomeIcon icon={faClock} />
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Mobile overlay background */}
          {isMobile && rightColumnMode && (
            <div 
              className={`mobile-overlay ${rightColumnMode ? 'visible' : ''}`}
              onClick={handleCloseRightColumn}
            />
          )}
          
          {/* Swipe indicator for mobile */}
          {isMobile && rightColumnMode && (
            <div className="swipe-indicator">
              <span>← Swipe right to go back</span>
            </div>
          )}

          {/* Panel content - only show when there's something to display */}
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
              <Browser
                type={databaseType === 'unified' ? undefined : databaseType}
                data={databaseType === 'unified' ? undefined : (databaseType === 'unified' ? adversariesData.adversaries : environmentsData.environments)}
                onAddItem={(itemData) => {
                  console.log('App.jsx onAddItem called with:', itemData)
                  console.log('Current databaseType:', databaseType)
                  
                  if (databaseType === 'adversary') {
                    console.log('Creating adversary...')
                    createAdversary(itemData)
                  } else if (databaseType === 'environment') {
                    console.log('Creating environment...')
                    createEnvironment(itemData)
                  } else if (databaseType === 'unified') {
                    console.log('Unified case - determining type from category:', itemData.category)
                    // Handle unified case - determine type from itemData
                    if (itemData.category === 'Adversary') {
                      console.log('Creating adversary from unified...')
                      createAdversary(itemData)
                    } else if (itemData.category === 'Environment') {
                      console.log('Creating environment from unified...')
                      createEnvironment(itemData)
                    }
                  }
                  // Keep browser open so users can add multiple items
                }}
                onCancel={handleCloseRightColumn}
                onCreateCustom={() => handleOpenCreator(databaseType === 'unified' ? 'adversary' : databaseType)}
                onCreateCountdown={(countdownData) => {
                  console.log('Creating countdown from browser:', countdownData)
                  createCountdown(countdownData)
                }}
              />
            </div>
          )}

          {rightColumnMode === 'creator' && (
            <div 
              className="creator-display"
              onClick={(e) => e.stopPropagation()}
            >
              <Creator
                type={databaseType}
                item={null}
                onSave={(itemData) => {
                  if (databaseType === 'adversary') {
                    createAdversary(itemData)
                  } else if (databaseType === 'environment') {
                    createEnvironment(itemData)
                  }
                  handleCloseRightColumn()
                }}
                onCancel={handleCloseRightColumn}
              />
            </div>
          )}

          {/* Default state - no content */}
          {!rightColumnMode && (
            <div className="no-selection-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-title">Select an Item</div>
                <div className="placeholder-text">
                  Choose an environment or adversary from the left panel to view its full details and interact with it.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
