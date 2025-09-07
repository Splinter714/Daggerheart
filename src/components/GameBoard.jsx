import React, { useState } from 'react'
import { useGameState } from '../useGameState'
import Button from './Buttons'
import List from './List'
import { 
  CheckCircle, 
  XCircle, 
  Skull, 
  Star, 
  Zap,
  Coffee,
  Moon,
  Dice1
} from 'lucide-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSkull, faClock } from '@fortawesome/free-solid-svg-icons'

// Add Dropdown Menu Component
const AddDropdownMenu = ({ onOpenDatabase }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)
  
  return (
    <div className="dropdown-container">
      <button 
        className="add-dropdown-trigger"
        onClick={toggleDropdown}
        title="Add items"
      >
        <span className="add-icon">+</span>
      </button>
      
      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={closeDropdown} />
          <div className="dropdown-menu add-dropdown-menu">
            <div className="dropdown-items">
              <button
                className="dropdown-item"
                onClick={() => {
                  onOpenDatabase && onOpenDatabase('environment')
                  closeDropdown()
                }}
              >
                <span>Add Environment</span>
              </button>
              
              <button
                className="dropdown-item"
                onClick={() => {
                  onOpenDatabase && onOpenDatabase('adversary')
                  closeDropdown()
                }}
              >
                <span>Add Adversary</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Management Dropdown Menu Component
const DropdownMenu = ({ environments, adversaries, onDeleteEnvironment, onDeleteAdversary }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)
  
  const deadAdversaries = adversaries.filter(a => a.hp >= a.hpMax)
  const hasEnvironments = environments.length > 0
  const hasAdversaries = adversaries.length > 0
  const hasDeadAdversaries = deadAdversaries.length > 0
  
  return (
    <div className="dropdown-container">
      <button 
        className="dropdown-trigger"
        onClick={toggleDropdown}
        title="Management options"
      >
        <svg className="cog-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"/>
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={closeDropdown} />
          <div className="dropdown-menu">
            <div className="dropdown-items">
              <button
                className={`dropdown-item ${!hasDeadAdversaries ? 'disabled' : ''}`}
                onClick={() => {
                  if (hasDeadAdversaries) {
                    deadAdversaries.forEach(item => onDeleteAdversary(item.id))
                    closeDropdown()
                  }
                }}
                disabled={!hasDeadAdversaries}
              >
                <span>Clear Dead Adversaries</span>
                {hasDeadAdversaries && (
                  <span className="item-count">({deadAdversaries.length})</span>
                )}
              </button>
              
              <button
                className={`dropdown-item ${!hasEnvironments ? 'disabled' : ''}`}
                onClick={() => {
                  if (hasEnvironments) {
                    environments.forEach(item => onDeleteEnvironment(item.id))
                    closeDropdown()
                  }
                }}
                disabled={!hasEnvironments}
              >
                <span>Clear All Environments</span>
                {hasEnvironments && (
                  <span className="item-count">({environments.length})</span>
                )}
              </button>
              
              <button
                className={`dropdown-item ${!hasAdversaries ? 'disabled' : ''}`}
                onClick={() => {
                  if (hasAdversaries) {
                    adversaries.forEach(item => onDeleteAdversary(item.id))
                    closeDropdown()
                  }
                }}
                disabled={!hasAdversaries}
              >
                <span>Clear All Adversaries</span>
                {hasAdversaries && (
                  <span className="item-count">({adversaries.length})</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const GameBoard = ({
  onItemSelect,
  selectedItem,
  selectedType,
  onOpenDatabase,
  onOpenCreator,
  isEditMode,
  onEditModeChange
}) => {
  
  const { 
    adversaries, 
    environments,
    createAdversary,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
    countdowns,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    reorderCountdowns,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown
  } = useGameState()

  const handleEditItem = (item, type) => {
    onOpenCreator(type)
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

  // GM Control Panel Handlers
  const handleRollOutcome = (outcome) => {
    console.log('GM Control Panel: Handling roll outcome:', outcome)
    console.log('Available countdowns:', countdowns)
    
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
          incrementCountdown(countdown.id)
        }
      }
    })
  }

  const handleRestTrigger = (restType) => {
    console.log('GM Control Panel: Handling rest trigger:', restType)
    console.log('Available countdowns:', countdowns)
    
    countdowns.forEach(countdown => {
      // Long-term countdowns advance on rest
      if (countdown.type === 'long-term') {
        const advancement = restType === 'long' ? 2 : 1
        console.log(`Long-term countdown "${countdown.name}" will advance by ${advancement} on ${restType} rest`)
        
        // Apply advancement
        for (let i = 0; i < advancement; i++) {
          incrementCountdown(countdown.id)
        }
      }
    })
  }

  const handleActionRoll = () => {
    console.log('GM Control Panel: Handling action roll')
    console.log('Available countdowns:', countdowns)
    
    countdowns.forEach(countdown => {
      // Standard countdowns advance by 1 on action roll
      if (countdown.type === 'standard') {
        console.log(`Standard countdown "${countdown.name}" will advance on action roll`)
        incrementCountdown(countdown.id)
      }
    })
  }

  return (
    <>
      {/* Countdowns Section */}
      {countdowns && countdowns.length > 0 && (
        <div className="game-section">
          <div className="section-header">
            <h3 className="section-title">Countdowns</h3>
          </div>
          
          {/* GM Control Panel */}
          <div className="gm-control-panel">
            <h4 className="control-panel-title">GM Triggers</h4>
            
            {/* Roll Outcome Triggers */}
            <div className="trigger-group">
              <h5>Roll Outcomes</h5>
              <div className="trigger-buttons">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleRollOutcome('success-hope')}
                  title="Success with Hope: Progress +2, Standard +1"
                  style={{ backgroundColor: 'var(--purple)', borderColor: 'var(--purple)', color: 'var(--text-primary)' }}
                >
                  <CheckCircle size={16} />
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleRollOutcome('success-fear')}
                  title="Success with Fear: Progress +1, Consequence +1, Standard +1"
                  style={{ backgroundColor: 'var(--purple)', borderColor: 'var(--purple)', color: 'var(--text-primary)' }}
                >
                  <CheckCircle size={16} />
                </Button>
                <Button
                  variant="failure"
                  size="sm"
                  onClick={() => handleRollOutcome('failure-hope')}
                  title="Failure with Hope: Consequence +2, Standard +1"
                  style={{ backgroundColor: 'var(--purple)', borderColor: 'var(--purple)', color: 'var(--text-primary)' }}
                >
                  <XCircle size={16} />
                </Button>
                <Button
                  variant="failure"
                  size="sm"
                  onClick={() => handleRollOutcome('failure-fear')}
                  title="Failure with Fear: Consequence +3, Standard +1"
                  style={{ backgroundColor: 'var(--purple)', borderColor: 'var(--purple)', color: 'var(--text-primary)' }}
                >
                  <XCircle size={16} />
                </Button>
                <Button
                  action="critical"
                  size="sm"
                  onClick={() => handleRollOutcome('critical-success')}
                  title="Critical Success: Progress +3, Standard +1"
                  style={{ backgroundColor: 'var(--purple)', borderColor: 'var(--purple)', color: 'var(--text-primary)' }}
                >
                  <Zap size={16} />
                  <CheckCircle size={16} />
                </Button>
              </div>
            </div>
            
            {/* Rest Triggers */}
            <div className="trigger-group">
              <h5>Rest Triggers</h5>
              <div className="trigger-buttons">
                <Button
                  action="rest"
                  size="sm"
                  onClick={() => handleRestTrigger('short')}
                  title="Short Rest: Advance long-term countdowns"
                >
                  <Coffee size={16} />
                </Button>
                <Button
                  action="rest"
                  size="sm"
                  onClick={() => handleRestTrigger('long')}
                  title="Long Rest: Advance long-term countdowns"
                >
                  <Moon size={16} />
                </Button>
              </div>
            </div>
            
            {/* General Trigger */}
            <div className="trigger-group">
              <h5>General</h5>
              <div className="trigger-buttons">
                <Button
                  action="action"
                  size="sm"
                  onClick={() => handleActionRoll()}
                  title="Action Roll: Advance all standard countdowns by 1"
                >
                  <Dice1 size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          <List
            items={countdowns}
            type="countdown"
            onDelete={deleteCountdown}
            onEdit={() => {}} // No edit functionality for countdowns yet
            onReorder={reorderCountdowns}
            onItemSelect={onItemSelect}
            onAdvance={advanceCountdown}
            onIncrement={(id) => {
              console.log('GameBoard onIncrement called with id:', id, 'incrementCountdown function:', incrementCountdown)
              incrementCountdown(id)
            }}
            onDecrement={(id) => {
              console.log('GameBoard onDecrement called with id:', id, 'decrementCountdown function:', decrementCountdown)
              decrementCountdown(id)
            }}
            isEditMode={isEditMode}
          />
        </div>
      )}

      {/* Environments Section */}
      {environments.length > 0 && (
        <div className="game-section">
          <div className="section-header">
            <h3 className="section-title">Environments</h3>
          </div>
          <List
            items={environments}
            type="environment"
            onDelete={(id) => handleDeleteItem(id, 'environment')}
            onEdit={(item) => handleEditItem(item, 'environment')}
            onToggleVisibility={(id) => {
              const env = environments.find(e => e.id === id)
              if (env) {
                updateEnvironment(id, { visible: !env.visible })
              }
            }}
            onReorder={reorderEnvironments}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onOpenDatabase={onOpenDatabase}
            onAdvance={() => {}} // Not used for environments
            isEditMode={isEditMode}
          />
        </div>
      )}

      {/* Adversaries Section */}
      {adversaries.length > 0 && (
        <div className="game-section">
          <div className="section-header">
            <h3 className="section-title">Adversaries</h3>
          </div>
          <List
            items={adversaries}
            type="adversary"
            onDelete={(id) => handleDeleteItem(id, 'adversary')}
            onEdit={(item) => handleEditItem(item, 'adversary')}
            onToggleVisibility={(id) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                updateAdversary(id, { visible: !adv.visible })
              }
            }}
            onReorder={reorderAdversaries}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onOpenDatabase={onOpenDatabase}
            onAdvance={() => {}} // Not used for adversaries
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
        </div>
      )}
    </>
  )
}

export default GameBoard
