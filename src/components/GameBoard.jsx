import React, { useState, useEffect } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import { useGameState } from '../useGameState'
import Button from './Buttons'
import List from './List'
import InlineCountdownCreator from './InlineCountdownCreator'
import { 
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull, faMoon, faDice, faFire } from '@fortawesome/free-solid-svg-icons'
import { 
  getAdvancementForRest
} from '../utils/countdownEngine'

const GameBoard = ({
  onItemSelect,
  selectedItem,
  selectedType,
  onOpenDatabase,
  onOpenCreator,
  isEditMode,
  // onEditModeChange,
  showLongTermCountdowns,
  fear,
  updateFear,
  handleRollOutcome: handleRollOutcomeProp,
  handleActionRoll: handleActionRollProp,
  setShowLongTermCountdowns,
  lastAddedItemType
}) => {
  
  const { 
    adversaries, 
    environments,
    // createAdversary,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    // createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
    countdowns,
    createCountdown,
    // updateCountdown,
    deleteCountdown,
    reorderCountdowns,
    // advanceCountdown,
    incrementCountdown,
    decrementCountdown
  } = useGameState()

  // State for inline countdown creator
  const [showInlineCreator, setShowInlineCreator] = useState({
    adversary: false,
    environment: false,
    campaign: false
  })

  // State for collapsible sections - initialize from localStorage
  const [sectionVisibility, setSectionVisibility] = usePersistentState('sectionVisibility', {
    countdowns: false,
    environments: false,
    adversaries: false
  })

  // (persisted via usePersistentState)

  // Auto-expand section when items are added from browser
  useEffect(() => {
    if (lastAddedItemType) {
      if (lastAddedItemType === 'environment') {
        setSectionVisibility(prev => ({ ...prev, environments: true }))
      } else if (lastAddedItemType === 'adversary') {
        setSectionVisibility(prev => ({ ...prev, adversaries: true }))
      }
    }
  }, [lastAddedItemType])

  // Toggle section visibility
  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Determine which triggers are needed based on active countdowns
  const getNeededTriggers = () => {
    if (!countdowns || countdowns.length === 0) return { 
      basicRollTriggers: false, 
      simpleFearTriggers: false,
      simpleHopeTriggers: false,
      complexRollTriggers: false, 
      restTriggers: false 
    }
    
    const hasDynamicCountdowns = countdowns.some(c => 
      c.type === 'progress' || c.type === 'consequence' || 
      c.type === 'dynamic-progress' || c.type === 'dynamic-consequence'
    )
    const hasLongTermCountdowns = countdowns.some(c => c.type === 'long-term')
    const hasSimpleFearCountdowns = countdowns.some(c => c.type === 'simple-fear')
    const hasSimpleHopeCountdowns = countdowns.some(c => c.type === 'simple-hope')
    const hasStandardCountdowns = countdowns.some(c => c.type === 'standard' || !c.type)
    
    return {
      basicRollTriggers: hasStandardCountdowns,
      simpleFearTriggers: hasSimpleFearCountdowns && !hasDynamicCountdowns,
      simpleHopeTriggers: hasSimpleHopeCountdowns && !hasDynamicCountdowns,
      complexRollTriggers: hasDynamicCountdowns,
      restTriggers: hasLongTermCountdowns
    }
  }

  const handleEditItem = (item, type) => {
    onOpenCreator(type)
  }

  const handleToggleInlineCreator = (source) => {
    setShowInlineCreator(prev => ({ ...prev, [source]: !prev[source] }))
  }

  const handleCreateCountdown = (countdownData) => {
    createCountdown(countdownData)
    // Hide the creator for the appropriate source
    setShowInlineCreator(prev => ({ ...prev, [countdownData.source]: false }))
    // Auto-expand countdowns section when adding a countdown
    setSectionVisibility(prev => ({ ...prev, countdowns: true }))
  }

  // Wrapper function for opening database (no auto-expand)
  const handleOpenDatabase = (type) => {
    onOpenDatabase(type)
  }



  const handleDeleteItem = (id, type) => {
    if (type === 'environment') {
      deleteEnvironment(id)
    } else if (type === 'adversary') {
      deleteAdversary(id)
    } else if (type === 'countdown') {
      deleteCountdown(id)
    }
    
    // If the deleted item was selected, clear the selection
    if (selectedItem && selectedItem.id === id) {
      onItemSelect(null, null)
    }
  }

  const handleRestTrigger = (restType) => {
    countdowns.forEach((countdown) => {
      const advancement = getAdvancementForRest(countdown, restType)
      for (let i = 0; i < advancement; i++) {
        incrementCountdown(countdown.id)
      }
    })
  }

  return (
    <>
      {/* Countdowns Section */}
      <div className="game-section campaign-countdowns">
        <div className="section-header">
          <div className="section-title-row">
            <button 
              className="section-title-button"
              onClick={() => toggleSection('countdowns')}
              title={sectionVisibility.countdowns ? "Collapse section" : "Expand section"}
            >
              {countdowns && countdowns.length > 0 ? (
                sectionVisibility.countdowns ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                <div style={{ width: '16px', height: '16px' }} />
              )}
              <h3 className="section-title">Countdowns</h3>
            </button>
            <Button
              action="add"
              size="sm"
              onClick={() => handleToggleInlineCreator('campaign')}
              title="Add Countdown"
              aria-label="Add Countdown"
            >
              <Plus size={16} />
            </Button>
            {/* Inline Countdown Creator */}
            {showInlineCreator.campaign && (
              <InlineCountdownCreator
                source="campaign"
                onCreateCountdown={handleCreateCountdown}
              />
            )}
          </div>
          
          {/* Countdown Trigger Controls - only show if there are countdowns */}
          {sectionVisibility.countdowns && countdowns && countdowns.length > 0 && (
            <div className="countdown-trigger-controls">
              {(() => {
                const triggers = getNeededTriggers()
                return (
                  <>
                    {/* Basic Roll Triggers - only show if there are standard countdowns */}
                    {triggers.basicRollTriggers && (
                      <button
                        className="trigger-btn basic-roll"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActionRollProp()
                        }}
                        title="Action Roll"
                      >
                        <FontAwesomeIcon icon={faDice} /> Roll
                      </button>
                    )}
                    
                    {/* Simple Fear/Hope Triggers - only show if there are simple fear/hope countdowns AND no dynamic countdowns */}
                    {triggers.simpleFearTriggers && (
                      <button
                        className="trigger-btn simple-fear"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Increment fear tracker
                          const currentFear = fear?.value || 0
                          if (currentFear < 12) {
                            updateFear(currentFear + 1)
                          }
                          handleRollOutcomeProp('simple-fear')
                        }}
                        title="Roll with Fear"
                      >
                        <FontAwesomeIcon icon={faSkull} /> Fear
                      </button>
                    )}
                    {triggers.simpleHopeTriggers && (
                      <button
                        className="trigger-btn simple-hope"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRollOutcomeProp('simple-hope')
                        }}
                        title="Roll with Hope"
                      >
                        <FontAwesomeIcon icon={faFire} /> Hope
                      </button>
                    )}
                    
                    {/* Complex Roll Outcome Triggers - only show if there are dynamic countdowns */}
                    {triggers.complexRollTriggers && (
                      <>
                        <button
                          className="trigger-btn fail-fear"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Increment fear tracker
                            const currentFear = fear?.value || 0
                            if (currentFear < 12) {
                              updateFear(currentFear + 1)
                            }
                            handleRollOutcomeProp('failure-fear')
                          }}
                          title="Failure + Fear"
                        >
                          <FontAwesomeIcon icon={faSkull} /> Failure
                        </button>
                        <button
                          className="trigger-btn fail-hope"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRollOutcomeProp('failure-hope')
                          }}
                          title="Failure + Hope"
                        >
                          <FontAwesomeIcon icon={faFire} /> Failure
                        </button>
                        <button
                          className="trigger-btn success-fear"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Increment fear tracker
                            const currentFear = fear?.value || 0
                            if (currentFear < 12) {
                              updateFear(currentFear + 1)
                            }
                            handleRollOutcomeProp('success-fear')
                          }}
                          title="Success + Fear"
                        >
                          <FontAwesomeIcon icon={faSkull} /> Success
                        </button>
                        <button
                          className="trigger-btn success-hope"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRollOutcomeProp('success-hope')
                          }}
                          title="Success + Hope"
                        >
                          <FontAwesomeIcon icon={faFire} /> Success
                        </button>
                        <button
                          className="trigger-btn critical-success"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRollOutcomeProp('critical-success')
                          }}
                          title="Critical Success"
                        >
                          <FontAwesomeIcon icon={faFire} /> Crit
                        </button>
                      </>
                    )}
                    
                    {/* Show/Hide Long-term Countdowns Button - moved to end */}
                    {countdowns && countdowns.some(c => c.type === 'long-term') && (
                      <button
                        className="trigger-btn toggle-long-term"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowLongTermCountdowns(!showLongTermCountdowns)
                        }}
                        title={showLongTermCountdowns ? "Hide Long-term Countdowns" : "Show Long-term Countdowns"}
                      >
                        <FontAwesomeIcon icon={faMoon} /> {showLongTermCountdowns ? "Hide" : "Show"}
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
        
        {/* Non-long-term countdowns - always visible */}
        {sectionVisibility.countdowns && countdowns && countdowns.filter(c => c.type !== 'long-term').length > 0 && (
          <List
            items={countdowns.filter(c => c.type !== 'long-term')}
            type="countdown"
            onDelete={(id) => handleDeleteItem(id, 'countdown')}
            onEdit={(item) => handleEditItem(item, 'countdown')}
            onReorder={reorderCountdowns}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onIncrement={incrementCountdown}
            onDecrement={decrementCountdown}
            isEditMode={isEditMode}
          />
        )}
        
        {/* Long-term countdowns - only visible when toggle is on */}
        {sectionVisibility.countdowns && showLongTermCountdowns && countdowns && countdowns.filter(c => c.type === 'long-term').length > 0 && (
          <>
            {/* Rest buttons for long-term countdowns */}
            <div className="long-term-rest-controls">
              <button
                className="trigger-btn short-rest"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRestTrigger('short')
                }}
                title="Short Rest"
              >
                <FontAwesomeIcon icon={faMoon} /> Short Rest
              </button>
              <button
                className="trigger-btn long-rest"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRestTrigger('long')
                }}
                title="Long Rest"
              >
                <FontAwesomeIcon icon={faMoon} /> Long Rest
              </button>
            </div>
            
            <List
              items={countdowns.filter(c => c.type === 'long-term')}
              type="countdown"
              onDelete={(id) => handleDeleteItem(id, 'countdown')}
              onEdit={(item) => handleEditItem(item, 'countdown')}
              onReorder={reorderCountdowns}
              onItemSelect={onItemSelect}
              selectedItem={selectedItem}
              selectedType={selectedType}
              onIncrement={incrementCountdown}
              onDecrement={decrementCountdown}
              isEditMode={isEditMode}
            />
          </>
        )}
      </div>

      {/* Environments Section */}
      <div className="game-section">
        <div className="section-header">
          <div className="section-title-row">
            <button 
              className="section-title-button"
              onClick={() => toggleSection('environments')}
              title={sectionVisibility.environments ? "Collapse section" : "Expand section"}
            >
              {environments && environments.length > 0 ? (
                sectionVisibility.environments ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                <div style={{ width: '16px', height: '16px' }} />
              )}
              <h3 className="section-title">Environments</h3>
            </button>
            <Button
              action="add"
              size="sm"
              onClick={() => handleOpenDatabase('environment')}
              title="Browse Environments"
              aria-label="Browse Environments"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        {sectionVisibility.environments && environments.length > 0 && (
          <List
            items={environments}
            type="environment"
            onDelete={(id) => handleDeleteItem(id, 'environment')}
            onEdit={(item) => handleEditItem(item, 'environment')}
            onToggleVisibility={(id) => {
              const env = environments.find(e => e.id === id)
              if (env) {
                updateEnvironment(id, { isVisible: !env.isVisible })
              }
            }}
            onReorder={reorderEnvironments}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onOpenDatabase={handleOpenDatabase}
            isEditMode={isEditMode}
          />
        )}
      </div>

      {/* Adversaries Section */}
      <div className="game-section">
        <div className="section-header">
          <div className="section-title-row">
            <button 
              className="section-title-button"
              onClick={() => toggleSection('adversaries')}
              title={sectionVisibility.adversaries ? "Collapse section" : "Expand section"}
            >
              {adversaries && adversaries.length > 0 ? (
                sectionVisibility.adversaries ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                <div style={{ width: '16px', height: '16px' }} />
              )}
              <h3 className="section-title">Adversaries</h3>
            </button>
            <Button
              action="add"
              size="sm"
              onClick={() => handleOpenDatabase('adversary')}
              title="Browse Adversaries"
              aria-label="Browse Adversaries"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
          
        {sectionVisibility.adversaries && adversaries.length > 0 && (
          <List
            items={adversaries}
            type="adversary"
            onDelete={(id) => handleDeleteItem(id, 'adversary')}
            onEdit={(item) => handleEditItem(item, 'adversary')}
            onToggleVisibility={(id) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                updateAdversary(id, { isVisible: !adv.isVisible })
              }
            }}
            onReorder={reorderAdversaries}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onOpenDatabase={handleOpenDatabase}
            onApplyDamage={(id, amount, currentHp, maxHp) => {
              console.log('HP damage:', { id, amount, currentHp, maxHp })
              const newHp = Math.min(maxHp, currentHp + amount) // Increase HP (more damage = more pips)
              console.log('New HP after damage:', newHp)
              updateAdversary(id, { hp: newHp })
            }}
            onApplyHealing={(id, amount, currentHp) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                console.log('HP healing:', { id, amount, currentHp, maxHp: adv.hpMax })
                const newHp = Math.max(0, currentHp - amount) // Decrease HP (less damage = fewer pips)
                console.log('New HP after healing:', newHp)
                updateAdversary(id, { hp: newHp })
              }
            }}
            onApplyStressChange={(id, amount, currentStress, maxStress) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                console.log('Stress change:', { id, amount, currentStress, maxStress })
                console.log('Current adversary:', { stress: adv.stress, hp: adv.hp, stressMax: adv.stressMax, hpMax: adv.hpMax })
                
                let newStress = adv.stress + amount
                let newHp = adv.hp || 0
                
                // Handle stress overflow - excess stress converts to HP damage
                if (newStress > adv.stressMax) {
                  const overflow = newStress - adv.stressMax
                  newStress = adv.stressMax
                  newHp = Math.min(adv.hpMax, newHp + overflow) // Add overflow as HP damage (more pips = more damage)
                  console.log('Stress overflow detected:', { overflow, newStress, newHp })
                } else if (newStress < 0) {
                  newStress = 0
                }
                
                console.log('Final values:', { newStress, newHp })
                
                // Update both stress and HP
                updateAdversary(id, { 
                  stress: newStress,
                  hp: newHp
                })
              }
            }}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </>
  )
}

export default GameBoard
