import React, { useState, useEffect, useRef } from 'react'
import { GameStateProvider } from './GameStateContext'
import { useGameState } from './useGameState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull } from '@fortawesome/free-solid-svg-icons'
import { Swords, TreePine, Pencil, Clock, Plus, Trash2, Menu } from 'lucide-react'
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
  const [mobileView, setMobileView] = useState('left') // 'left' or 'right'
  const [addFlyoutOpen, setAddFlyoutOpen] = useState(false)
  const [deleteFlyoutOpen, setDeleteFlyoutOpen] = useState(false)
  const [countdownFlyoutOpen, setCountdownFlyoutOpen] = useState(false)
  
  // Close flyouts when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar-nav-item')) {
        setAddFlyoutOpen(false)
        setDeleteFlyoutOpen(false)
        setCountdownFlyoutOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [addFlyoutOpen, deleteFlyoutOpen, countdownFlyoutOpen])
  
  // Right column handlers
  const handleItemSelect = (item, type) => {
    setSelectedItem(item)
    setSelectedType(type)
    setRightColumnMode('item')
    if (isMobile) setMobileView('right')
  }
  
  const handleOpenDatabase = (type = 'unified') => {
    setDatabaseType(type)
    setRightColumnMode('database')
    if (isMobile) setMobileView('right')
  }

  const handleOpenCreator = (type) => {
    setDatabaseType(type)
    setRightColumnMode('creator')
    if (isMobile) setMobileView('right')
  }

  // Countdown control handlers
  const handleRollOutcome = (outcome) => {
    console.log('Bottom bar: Handling roll outcome:', outcome)
    
    countdowns.forEach(countdown => {
      let advancement = 0
      
      // Handle the actual countdown types being used
      if (countdown.type === 'standard' || !countdown.type) {
        // Standard countdowns always advance by 1
        advancement = 1
        console.log(`Standard countdown "${countdown.name}" will advance by ${advancement}`)
      } else if (countdown.type === 'progress' || countdown.type === 'dynamic-progress') {
        // Progress countdowns advance based on roll outcome
        switch (outcome) {
          case 'success-hope':
            advancement = 2
            break
          case 'success-fear':
            advancement = 1
            break
          case 'critical-success':
            advancement = 3
            break
          default:
            advancement = 0
        }
        if (advancement > 0) {
          console.log(`Progress countdown "${countdown.name}" will advance by ${advancement}`)
        }
      } else if (countdown.type === 'consequence' || countdown.type === 'dynamic-consequence') {
        // Consequence countdowns advance based on roll outcome
        switch (outcome) {
          case 'success-fear':
            advancement = 1
            break
          case 'failure-hope':
            advancement = 2
            break
          case 'failure-fear':
            advancement = 3
            break
          default:
            advancement = 0
        }
        if (advancement > 0) {
          console.log(`Consequence countdown "${countdown.name}" will advance by ${advancement}`)
        }
      }
      
      // Apply advancement if any
      if (advancement > 0) {
        console.log(`Advancing countdown "${countdown.name}" by ${advancement}`)
        for (let i = 0; i < advancement; i++) {
          advanceCountdown(countdown.id)
        }
      }
    })
  }

  const handleRestTrigger = (restType) => {
    console.log('Bottom bar: Handling rest trigger:', restType)
    
    countdowns.forEach(countdown => {
      // Long-term countdowns advance on rest
      if (countdown.type === 'long-term') {
        const advancement = restType === 'long' ? 2 : 1
        console.log(`Long-term countdown "${countdown.name}" will advance by ${advancement} on ${restType} rest`)
        for (let i = 0; i < advancement; i++) {
          advanceCountdown(countdown.id)
        }
      }
    })
  }

  const handleCloseRightColumn = () => {
    setRightColumnMode(null)
    setSelectedItem(null)
    setSelectedType(null)
    if (isMobile) setMobileView('left')
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      // Switch to mobile when width can't accommodate 12 HP icons + stress + other elements
      // Conservative estimate: 12 HP (240px) + 10 stress (200px) + difficulty + damage input + padding = ~600px
      setIsMobile(window.innerWidth <= 800)
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
      <div className={`sidebar ${(addFlyoutOpen || deleteFlyoutOpen || countdownFlyoutOpen) ? 'flyout-open' : ''}`}>
        <nav className="sidebar-nav">
          {/* Plus Button with Add Flyout */}
          <button
            className="sidebar-nav-item"
            onClick={(e) => {
              e.stopPropagation()
              setAddFlyoutOpen(!addFlyoutOpen)
              setDeleteFlyoutOpen(false) // Close other flyout
            }}
            title="Add Items"
          >
            <div className="sidebar-nav-icon">
              <Plus size={20} />
            </div>
            
            <div className={`flyout-menu ${addFlyoutOpen ? 'show' : ''}`}>
                <button
                  className="flyout-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAddFlyoutOpen(false)
                    handleOpenDatabase('adversary')
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Plus size={14} />
                    <span>Adversary</span>
                  </div>
                </button>
                <button
                  className="flyout-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAddFlyoutOpen(false)
                    handleOpenDatabase('environment')
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Plus size={14} />
                    <span>Environment</span>
                  </div>
                </button>
                <button
                  className="flyout-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAddFlyoutOpen(false)
                    handleOpenCreator('countdown')
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Plus size={14} />
                    <span>Countdown</span>
                  </div>
                </button>
              </div>
          </button>
          
          {/* Countdown Control Panel */}
          <button
            className={`sidebar-nav-item ${countdownFlyoutOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setCountdownFlyoutOpen(!countdownFlyoutOpen)
              setAddFlyoutOpen(false)
              setDeleteFlyoutOpen(false)
            }}
            title="Countdown Controls"
          >
            <div className="sidebar-nav-icon">
              <Clock size={20} />
            </div>
            
            <div className={`flyout-menu ${countdownFlyoutOpen ? 'show' : ''}`}>
              <div className="countdown-control-panel">
                <div className="countdown-actions">
                  <button
                    className="countdown-action-btn success-fear"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Success + Fear
                      const currentFear = fear?.value || 0
                      if (currentFear < 12) {
                        updateFear(currentFear + 1)
                      }
                      handleRollOutcome('success-fear')
                    }}
                  >
                    Success + Fear
                  </button>
                  <button
                    className="countdown-action-btn fail-fear"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Fail + Fear
                      const currentFear = fear?.value || 0
                      if (currentFear < 12) {
                        updateFear(currentFear + 1)
                      }
                      handleRollOutcome('failure-fear')
                    }}
                  >
                    Fail + Fear
                  </button>
                  <button
                    className="countdown-action-btn success-hope"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Success + Hope (no fear change)
                      handleRollOutcome('success-hope')
                    }}
                  >
                    Success + Hope
                  </button>
                  <button
                    className="countdown-action-btn fail-hope"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Fail + Hope (no fear change)
                      handleRollOutcome('failure-hope')
                    }}
                  >
                    Fail + Hope
                  </button>
                  <button
                    className="countdown-action-btn crit-success"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Critical Success (no fear change)
                      handleRollOutcome('critical-success')
                    }}
                  >
                    Critical Success
                  </button>
                  <button
                    className="countdown-action-btn short-rest"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Short Rest
                      handleRestTrigger('short')
                    }}
                  >
                    Short Rest
                  </button>
                  <button
                    className="countdown-action-btn long-rest"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Long Rest
                      handleRestTrigger('long')
                    }}
                  >
                    Long Rest
                  </button>
                </div>
              </div>
            </div>
          </button>

          {/* Edit Mode Toggle */}
          <button
            className={`sidebar-nav-item ${isEditMode ? 'active' : ''}`}
            onClick={() => setIsEditMode(!isEditMode)}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            <div className="sidebar-nav-icon">
              <Pencil size={20} />
            </div>
          </button>
          
          {/* Delete Button with Clear Flyout */}
          <button
            className={`sidebar-nav-item ${deleteFlyoutOpen ? 'delete-active' : ''} ${(!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0) ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              // Only open flyout if there are items to delete
              const hasItems = (adversaries && adversaries.length > 0) || 
                              (environments && environments.length > 0) || 
                              (countdowns && countdowns.length > 0)
              if (hasItems) {
                setDeleteFlyoutOpen(!deleteFlyoutOpen)
                setAddFlyoutOpen(false) // Close other flyout
              }
            }}
            title={(!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0) ? "Nothing to clear" : "Clear Items"}
            disabled={(!adversaries || adversaries.length === 0) && (!environments || environments.length === 0) && (!countdowns || countdowns.length === 0)}
          >
            <div className="sidebar-nav-icon">
              <Trash2 size={20} />
            </div>
            
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
                      <Trash2 size={14} style={{marginTop: '1px'}} />
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
                      <Trash2 size={14} style={{marginTop: '1px'}} />
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
                      <Trash2 size={14} style={{marginTop: '1px'}} />
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
                      <Trash2 size={14} style={{marginTop: '1px'}} />
                      <span>All Countdowns</span>
                    </div>
                  </button>
                )}
              </div>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content" key={`mobile-${isMobile}`}>
        {/* Unified Layout - Reuse desktop structure for mobile */}
        {/* Left Panel: Game Board */}
        <div className={`left-panel ${isMobile && mobileView === 'right' ? 'mobile-hidden' : ''}`}>
          {/* Mobile navigation when on left panel but right content exists - removed View Details button */}
          
          <GameBoard
            onItemSelect={handleItemSelect}
            onOpenDatabase={handleOpenDatabase}
            onOpenCreator={handleOpenCreator}
            isEditMode={isEditMode}
            onEditModeChange={setIsEditMode}
          />
        </div>

        {/* Right Panel: Details, Database, or Creator */}
        <div className={`right-panel ${isMobile && mobileView === 'left' ? 'mobile-hidden' : ''}`}>
          {/* Mobile navigation when on right panel */}
          {isMobile && mobileView === 'right' && (
            <div className="mobile-nav-buttons">
              <Button
                action="secondary"
                size="compact"
                onClick={() => setMobileView('left')}
                title="Back to Game Board"
              >
                ← Back
              </Button>
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
                type={databaseType}
                onAddItem={(itemData) => {
                  console.log('App.jsx onAddItem called with:', itemData)
                  console.log('Current databaseType:', databaseType)
                  
                  if (databaseType === 'adversary') {
                    console.log('Creating adversary...')
                    createAdversary(itemData)
                  } else if (databaseType === 'environment') {
                    console.log('Creating environment...')
                    createEnvironment(itemData)
                  }
                  // Keep browser open so users can add multiple items
                }}
                onCancel={handleCloseRightColumn}
                onCreateCustom={() => handleOpenCreator(databaseType)}
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
                  } else if (databaseType === 'countdown') {
                    createCountdown(itemData)
                  }
                  handleCloseRightColumn()
                }}
                onCancel={handleCloseRightColumn}
              />
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
