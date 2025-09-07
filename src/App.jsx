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
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [addFlyoutOpen, setAddFlyoutOpen] = useState(false)
  const [deleteFlyoutOpen, setDeleteFlyoutOpen] = useState(false)
  
  // Update body class when sidebar expands/collapses
  useEffect(() => {
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded')
    } else {
      document.body.classList.remove('sidebar-expanded')
    }
  }, [sidebarExpanded])

  // Close flyouts and sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar-nav-item')) {
        setAddFlyoutOpen(false)
        setDeleteFlyoutOpen(false)
      }
      // Close expanded sidebar when clicking outside of it
      if (sidebarExpanded && !event.target.closest('.sidebar')) {
        setSidebarExpanded(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [sidebarExpanded])
  
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

      {/* Sidebar: Navigation */}
      <div className={`sidebar ${sidebarExpanded ? 'expanded' : ''} ${(addFlyoutOpen || deleteFlyoutOpen) ? 'flyout-open' : ''}`}>
        <nav className="sidebar-nav">
          {/* Burger Menu Button */}
          <button 
            className="sidebar-nav-item"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <div className="sidebar-nav-icon">
              <Menu size={20} />
            </div>
            <span className="sidebar-nav-text">
              {sidebarExpanded ? "Close" : ""}
            </span>
          </button>
          
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
            <span className="sidebar-nav-text">Add</span>
            
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
          
          {/* Edit Mode Toggle */}
          <button
            className={`sidebar-nav-item ${isEditMode ? 'active' : ''}`}
            onClick={() => setIsEditMode(!isEditMode)}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            <div className="sidebar-nav-icon">
              <Pencil size={20} />
            </div>
            <span className="sidebar-nav-text">
              {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
            </span>
          </button>
          
          {/* Delete Button with Clear Flyout */}
          <button
            className={`sidebar-nav-item ${deleteFlyoutOpen ? 'delete-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setDeleteFlyoutOpen(!deleteFlyoutOpen)
              setAddFlyoutOpen(false) // Close other flyout
            }}
            title="Clear Items"
          >
            <div className="sidebar-nav-icon">
              <Trash2 size={20} />
            </div>
            <span className="sidebar-nav-text">Clear</span>
            
            <div className={`flyout-menu ${deleteFlyoutOpen ? 'show' : ''}`}>
                <button
                  className="flyout-menu-item delete-flyout-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteFlyoutOpen(false)
                    if (adversaries.length > 0) {
                      adversaries.forEach(item => deleteAdversary(item.id))
                    }
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Trash2 size={14} style={{marginTop: '1px'}} />
                    <span>All Adversaries</span>
                  </div>
                </button>
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
                <button
                  className="flyout-menu-item delete-flyout-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteFlyoutOpen(false)
                    if (environments.length > 0) {
                      environments.forEach(item => deleteEnvironment(item.id))
                    }
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Trash2 size={14} style={{marginTop: '1px'}} />
                    <span>All Environments</span>
                  </div>
                </button>
                <button
                  className="flyout-menu-item delete-flyout-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteFlyoutOpen(false)
                    if (countdowns && countdowns.length > 0) {
                      countdowns.forEach(countdown => deleteCountdown(countdown.id))
                    }
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Trash2 size={14} style={{marginTop: '1px'}} />
                    <span>All Countdowns</span>
                  </div>
                </button>
              </div>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Mobile Left Panel: Game Board */}
            {mobileView === 'left' && (
              <div className="mobile-left-panel">
                <GameBoard
                  onItemSelect={handleItemSelect}
                  onOpenDatabase={handleOpenDatabase}
                  onOpenCreator={handleOpenCreator}
                  isEditMode={isEditMode}
                  onEditModeChange={setIsEditMode}
                />
              </div>
            )}

            {/* Mobile Right Panel: Details, Database, or Creator */}
            {mobileView === 'right' && (
              <div className="mobile-right-panel">
                {/* Mobile Navigation */}
                <div className="mobile-nav-buttons">
                  <Button
                    action="close"
                    size="compact"
                    onClick={handleCloseRightColumn}
                    title="Back to Game Board"
                  >
                    ← Back
                  </Button>
                </div>

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
                  }
                  handleCloseRightColumn()
                }}
                onCancel={handleCloseRightColumn}
              />
            </div>
          )}

              </div>
            )}
          </>
        ) : (
          /* Desktop Layout */
          <>
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
            <div className="right-panel">

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
                      }
                      handleCloseRightColumn()
                    }}
                    onCancel={handleCloseRightColumn}
                  />
                </div>
              )}

            </div>
          </>
        )}
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
